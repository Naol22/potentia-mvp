import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase";
import { TransactionStatus, CurrencyCode, OrderStatus } from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const VALID_CURRENCIES = ['USD', 'EUR', 'BTC'] as const;

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
  if (!session.metadata) {
    throw new Error("Metadata is null");
  }
  const { planId, cryptoAddress, transactionId } = session.metadata;

  if (!transactionId) {
    console.error("[Webhook Stripe API] Error handling checkout completion:", {
      message: "Missing transactionId in metadata",
      details: "Transaction ID is required to update transaction",
      code: "MISSING_TRANSACTION_ID",
    });
    throw new Error("Missing transactionId in metadata");
  }

  try {
    console.log("[Webhook Stripe API] Updating transaction to completed...");
    const client = createServerSupabaseClient();

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

    const { data: updatedTransaction, error: transactionError } = await client
      .from("transactions")
      .update({
        status: "completed" as TransactionStatus,
        payment_method_id: session.payment_intent ? session.payment_intent.toString() : null,
        payment_provider_reference: `Stripe session ${session.id}`,
        checkout_session_id: session.id,
        amount: session.amount_total ? session.amount_total / 100 : undefined,
        currency,
      })
      .eq("id", transactionId)
      .select()
      .single();

    if (transactionError) {
      console.error("[Webhook Stripe API] Error updating transaction:", {
        message: transactionError.message,
        details: transactionError.details,
        code: transactionError.code,
      });
      throw new Error("Failed to update transaction");
    }

    console.log("[Webhook Stripe API] Creating order in orders table...");
    const order = {
      user_id: session.customer_details?.email
        ? (
            await client
              .from("users")
              .select("user_id")
              .eq("email", session.customer_details.email)
              .single()
          ).data?.user_id || null
        : null,
      plan_type: updatedTransaction.plan_type,
      plan_id: planId,
      transaction_id: transactionId,
      amount: session.amount_total
        ? session.amount_total / 100
        : updatedTransaction.amount,
      status: "completed" as OrderStatus,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subscription_id: null,
      crypto_address: cryptoAddress || null,
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
      transactionId,
      orderId: (
        await client
          .from("orders")
          .select("id")
          .eq("transaction_id", transactionId)
          .single()
      ).data?.id,
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

    // Normalize currency to uppercase
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
        updated_at: new Date().toISOString(),
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
        updated_at: new Date().toISOString(),
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