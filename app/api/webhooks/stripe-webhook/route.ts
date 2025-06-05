import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase";
import {
  TransactionStatus,
  CurrencyCode,
  OrderStatus,
  SubscriptionStatus,
} from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const VALID_CURRENCIES = ["USD", "EUR", "BTC"] as const;

export async function POST(request: Request) {
  try {
    console.log("[Webhook Stripe API] Verifying and processing Stripe webhook event...");
    const sig = request.headers.get("stripe-signature")!;
    const body = await request.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error("[Webhook Stripe API] Error verifying webhook signature:", {
        message: "Invalid signature",
        details: (err as Error).message,
        code: "INVALID_SIGNATURE",
      });
      return NextResponse.json(
        { error: `Webhook Error: ${(err as Error).message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log("[Webhook Stripe API] Unhandled event type:", {
          eventType: event.type,
        });
    }

    console.log("[Webhook Stripe API] Successfully processed webhook event:", {
      eventType: event.type,
      eventId: event.id,
    });
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("[Webhook Stripe API] Error processing webhook event:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log("[Webhook Stripe API] Processing checkout session completed...", { sessionId: session.id });
    const client = createServerSupabaseClient();

    // Fetch subscription session to get subscriptionId and planId
    const { data: sessionData, error: sessionError } = await client
      .from("subscription_sessions")
      .select("subscription_id, metadata")
      .eq("session_id", session.id)
      .single();
    if (sessionError || !sessionData) {
      console.error("[Webhook Stripe API] Error fetching subscription session:", {
        message: sessionError?.message || "Session not found",
        details: sessionError?.details,
        code: "SESSION_FETCH_FAILED",
      });
      throw new Error("Failed to fetch subscription session");
    }
    const { subscription_id: subscriptionId, metadata } = sessionData;
    const planId = metadata?.planId;

    if (!subscriptionId || !planId) {
      console.error("[Webhook Stripe API] Error processing checkout:", {
        message: "Missing subscriptionId or planId",
        details: "Required fields not found in subscription session",
        code: "MISSING_FIELDS",
      });
      throw new Error("Missing subscriptionId or planId");
    }

    // Fetch the Stripe subscription if available
    let stripeSubscription = null;
    if (session.subscription) {
      stripeSubscription = await stripe.subscriptions.retrieve(session.subscription.toString());
    }

    const rawCurrency = session.currency || "USD";
    const currency = rawCurrency.toUpperCase() as CurrencyCode;
    if (!VALID_CURRENCIES.includes(currency)) {
      console.error("[Webhook Stripe API] Invalid currency:", {
        message: `Currency ${currency} is not supported`,
        details: `Supported currencies: ${VALID_CURRENCIES.join(", ")}`,
        code: "INVALID_CURRENCY",
      });
      throw new Error(`Invalid currency: ${currency}`);
    }

    // Fetch the subscription to get user_id and plan_type
    const { data: subscription, error: subscriptionError } = await client
      .from("subscriptions")
      .select("user_id, plan_type")
      .eq("id", subscriptionId)
      .single();
    if (subscriptionError || !subscription) {
      console.error("[Webhook Stripe API] Error fetching subscription:", {
        message: subscriptionError?.message || "Subscription not found",
        details: subscriptionError?.details,
        code: "SUBSCRIPTION_FETCH_FAILED",
      });
      throw new Error("Failed to fetch subscription");
    }

    console.log("[Webhook Stripe API] Creating transaction...");
    const transaction = {
      user_id: subscription.user_id,
      plan_type: subscription.plan_type,
      plan_id: planId,
      payment_type: "subscription" as const,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency,
      status: "completed" as TransactionStatus,
      payment_provider_reference: `Stripe session ${session.id}`,
      subscription_id: subscriptionId,
      checkout_session_id: session.id,
      created_at: new Date().toISOString(),
      // updated_at: new Date().toISOString(),
    };
    const { data: createdTransaction, error: transactionError } = await client
      .from("transactions")
      .insert(transaction)
      .select()
      .single();
    if (transactionError || !createdTransaction) {
      console.error("[Webhook Stripe API] Error creating transaction:", {
        message: transactionError?.message || "Failed to create transaction",
        details: transactionError?.details,
        code: "TRANSACTION_CREATE_FAILED",
      });
      throw new Error("Failed to create transaction");
    }

    let subscriptionData = null;
    if (stripeSubscription) {
      console.log("[Webhook Stripe API] Updating subscription...");
      const subscriptionUpdate = {
        user_id: subscription.user_id,
        plan_type: subscription.plan_type,
        plan_id: planId,
        status: stripeSubscription.status as SubscriptionStatus,
        provider_subscription_id: stripeSubscription.id,
        current_period_start: new Date(stripeSubscription.start_date * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.items.data[0].current_period_end * 1000).toISOString(),        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        checkout_session_id: session.id,
        // updated_at: new Date().toISOString(),
      };
      const { data, error: subscriptionUpdateError } = await client
        .from("subscriptions")
        .upsert({ id: subscriptionId, ...subscriptionUpdate }, { onConflict: "id" })
        .select()
        .single();
      if (subscriptionUpdateError) {
        console.error("[Webhook Stripe API] Error updating subscription:", {
          message: subscriptionUpdateError.message,
          details: subscriptionUpdateError.details,
          code: "SUBSCRIPTION_UPDATE_FAILED",
        });
        throw new Error("Failed to update subscription");
      }
      subscriptionData = data;

      console.log("[Webhook Stripe API] Updating subscription session...");
      const { error: sessionUpdateError } = await client
        .from("subscription_sessions")
        .update({ is_used: true})
        .eq("session_id", session.id);
      if (sessionUpdateError) {
        console.error("[Webhook Stripe API] Error updating subscription session:", {
          message: sessionUpdateError.message,
          details: sessionUpdateError.details,
          code: "SUBSCRIPTION_SESSION_UPDATE_FAILED",
        });
        throw new Error("Failed to update subscription session");
      }
    }

    console.log("[Webhook Stripe API] Logging subscription event...");
    const eventType = subscriptionData ? "created" : "payment_succeeded";
    const subscriptionEvent = {
      subscription_id: subscriptionId || null,
      user_id: subscription.user_id,
      event_type: eventType,
      provider: "stripe",
      data: {
        session_id: session.id,
        plan_id: planId,
        transaction_id: createdTransaction.id,
        status: subscriptionData ? subscriptionData.status : "completed",
      },
      status: "success",
    };
    const { error: eventError } = await client
      .from("subscription_events")
      .insert(subscriptionEvent);
    if (eventError) {
      console.error("[Webhook Stripe API] Error logging subscription event:", {
        message: eventError.message,
        details: eventError.details,
        code: "SUBSCRIPTION_EVENT_CREATE_FAILED",
      });
      throw new Error("Failed to log subscription event");
    }

    console.log("[Webhook Stripe API] Creating order in orders table...");
    const order = {
      user_id: session.customer_details?.email
        ? (await client.from("users").select("user_id").eq("email", session.customer_details.email).single()).data?.user_id || null
        : null,
      plan_type: subscription.plan_type,
      plan_id: planId,
      transaction_id: createdTransaction.id,
      amount: session.amount_total ? session.amount_total / 100 : createdTransaction.amount,
      status: "completed" as OrderStatus,
      is_active: true,
      subscription_id: subscriptionId || null,
      crypto_address: metadata?.cryptoAddress || null,
      created_at: new Date().toISOString(),
      // updated_at: new Date().toISOString(),
    };
    const { error: orderError } = await client.from("orders").insert(order);
    if (orderError) {
      console.error("[Webhook Stripe API] Error creating order:", {
        message: orderError.message,
        details: orderError.details,
        code: orderError.code,
      });
      throw new Error("Failed to create order");
    }

    console.log("[Webhook Stripe API] Successfully processed checkout completion:", {
      transactionId: createdTransaction.id,
      orderId: (await client.from("orders").select("id").eq("transaction_id", createdTransaction.id).single()).data?.id,
      subscriptionId: subscriptionId,
    });
  } catch (error) {
    console.error("[Webhook Stripe API] Error handling checkout completion:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const transactionId = subscription.metadata.transactionId;
  if (!transactionId) {
    console.error("[Webhook Stripe API] Error handling subscription update:", {
      message: "Missing transactionId in metadata",
      details: "Transaction ID is required to update transaction",
      code: "MISSING_TRANSACTION_ID",
    });
    throw new Error("Missing transactionId in metadata");
  }

  try {
    console.log("[Webhook Stripe API] Updating transaction with subscription details...");
    const client = createServerSupabaseClient();

    const rawCurrency = subscription.currency || "USD";
    const currency = rawCurrency.toUpperCase() as CurrencyCode;
    if (!VALID_CURRENCIES.includes(currency)) {
      console.error("[Webhook Stripe API] Invalid currency:", {
        message: `Currency ${currency} is not supported`,
        details: `Supported currencies: ${VALID_CURRENCIES.join(", ")}`,
        code: "INVALID_CURRENCY",
      });
      throw new Error(`Invalid currency: ${currency}`);
    }

    const { error } = await client
      .from("transactions")
      .update({
        status: "completed" as TransactionStatus,
        subscription_id: subscription.id,
        payment_provider_reference: `Stripe subscription ${subscription.id}`,
        amount: subscription.items.data[0]?.plan?.amount
          ? subscription.items.data[0].plan.amount / 100
          : 0,
        currency,
        // updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId)
      .select()
      .single();

    if (error) {
      console.error("[Webhook Stripe API] Error updating transaction:", {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw new Error("Failed to update transaction");
    }

    console.log("[Webhook Stripe API] Successfully processed subscription update:", {
      transactionId,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("[Webhook Stripe API] Error handling subscription update:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const transactionId = subscription.metadata.transactionId;
  if (!transactionId) {
    console.error("[Webhook Stripe API] Error handling subscription deletion:", {
      message: "Missing transactionId in metadata",
      details: "Transaction ID is required to update transaction",
      code: "MISSING_TRANSACTION_ID",
    });
    throw new Error("Missing transactionId in metadata");
  }

  try {
    console.log("[Webhook Stripe API] Updating transaction for subscription deletion...");
    const client = createServerSupabaseClient();

    const { error } = await client
      .from("transactions")
      .update({
        status: "cancelled" as TransactionStatus,
        subscription_id: null,
        // updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId)
      .select()
      .single();

    if (error) {
      console.error("[Webhook Stripe API] Error updating transaction:", {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw new Error("Failed to update transaction");
    }

    console.log("[Webhook Stripe API] Successfully processed subscription deletion:", {
      transactionId,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("[Webhook Stripe API] Error handling subscription deletion:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};