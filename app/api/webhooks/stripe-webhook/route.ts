"use server";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase";
import { TransactionStatus, CurrencyCode } from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;


export async function POST(request: Request) {
  try {
    console.log("[Webhook Stripe API] Verifying and processing Stripe webhook event...");
    const sig = request.headers.get("stripe-signature")!;
    const body = await request.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error("[Webhook Stripe API] Error verifying webhook signature:", {
        message: "Invalid signature",
        details: (err as Error).message,
        code: "INVALID_SIGNATURE",
      });
      return NextResponse.json({ error: `Webhook Error: ${(err as Error).message}` }, { status: 400 });
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
    if (error instanceof Error) {
      console.error("[Webhook Stripe API] Error processing webhook event:", {
        message: error.message,
        stack: error.stack,
      });
      return NextResponse.json(
        {
          error: "Internal Server Error",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {

  if (!session.metadata) {
    throw new Error('Metadata is null');
  }
  const { planId, cryptoAddress, paymentMethod, transactionId } = session.metadata;
  try {
    console.log("[Webhook Stripe API] Handling checkout session completed event...");
    if (!transactionId) {
      console.error("[Webhook Stripe API] Error handling checkout completion:", {
        message: "Missing transactionId in metadata",
        details: "Transaction ID is required to update transaction",
        code: "MISSING_TRANSACTION_ID",
      });
      throw new Error("Missing transactionId in metadata");
    }

    const client = createServerSupabaseClient();

    console.log("[Webhook Stripe API] Updating transaction to completed...");
    const updateTransactionResponse = await fetch(`${session.success_url!.split("?")[0]}/api/update-transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        transaction: {
          id: transactionId,
          status: "completed" as TransactionStatus,
          payment_method_id: session.payment_intent ? session.payment_intent.toString() : null,
          payment_provider_reference: `Stripe session ${session.id}`,
          checkout_session_id: session.id,
          amount: session.amount_total ? session.amount_total / 100 : undefined, 
          currency: session.currency as CurrencyCode || "USD",
        },
      }),
    });

    if (!updateTransactionResponse.ok) {
      const errorData = await updateTransactionResponse.json();
      console.error("[Webhook Stripe API] Error updating transaction:", {
        message: errorData.error || "Failed to update transaction",
        details: errorData.details,
        code: "TRANSACTION_UPDATE_FAILED",
      });
      throw new Error("Failed to update transaction");
    }

    const { transaction: updatedTransaction } = await updateTransactionResponse.json();
    console.log("[Webhook Stripe API] Creating order in orders table...");
    const order = {
      user_id: session.customer_details?.email
        ? (await client.from("users").select("id").eq("email", session.customer_details.email).single()).data?.id
        : null,
      plan_id: planId,
      transaction_id: transactionId,
      amount: session.amount_total ? session.amount_total / 100 : updatedTransaction.amount,
      currency: session.currency as CurrencyCode || updatedTransaction.currency,
      status: "active",
      created_at: new Date().toISOString(),
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
      orderId: (await client.from("orders").select("id").eq("transaction_id", transactionId).single()).data?.id,
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
  try {
    console.log("[Webhook Stripe API] Handling subscription updated event...");
    const transactionId = subscription.metadata.transactionId;
    if (!transactionId) {
      console.error("[Webhook Stripe API] Error handling subscription update:", {
        message: "Missing transactionId in metadata",
        details: "Transaction ID is required to update transaction",
        code: "MISSING_TRANSACTION_ID",
      });
      throw new Error("Missing transactionId in metadata");
    }
    console.log("[Webhook Stripe API] Updating transaction with subscription details...");
    const updateTransactionResponse = await fetch(
      `${subscription.metadata.success_url!.split("?")[0]}/api/update-transaction`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          transaction: {
            id: transactionId,
            status: "completed" as TransactionStatus,
            subscription_id: subscription.id,
            payment_provider_reference: `Stripe subscription ${subscription.id}`,
            amount: subscription.items.data[0]?.plan?.amount ? subscription.items.data[0].plan.amount / 100 : 0, // Convert from cents
            currency: subscription.currency as CurrencyCode,
          },
        }),
      }
    );

    if (!updateTransactionResponse.ok) {
      const errorData = await updateTransactionResponse.json();
      console.error("[Webhook Stripe API] Error updating transaction:", {
        message: errorData.error || "Failed to update transaction",
        details: errorData.details,
        code: "TRANSACTION_UPDATE_FAILED",
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
    throw error; // Stripe will retry on failure
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log("[Webhook Stripe API] Handling subscription deleted event...");
    const transactionId = subscription.metadata.transactionId;

    if (!transactionId) {
      console.error("[Webhook Stripe API] Error handling subscription deletion:", {
        message: "Missing transactionId in metadata",
        details: "Transaction ID is required to update transaction",
        code: "MISSING_TRANSACTION_ID",
      });
      throw new Error("Missing transactionId in metadata");
    }

    console.log("[Webhook Stripe API] Updating transaction for subscription deletion...");
    const updateTransactionResponse = await fetch(
      `${subscription.metadata.success_url!.split("?")[0]}/api/update-transaction`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          transaction: {
            id: transactionId,
            status: "cancelled" as TransactionStatus,
            subscription_id: null,
          },
        }),
      }
    );

    if (!updateTransactionResponse.ok) {
      const errorData = await updateTransactionResponse.json();
      console.error("[Webhook Stripe API] Error updating transaction:", {
        message: errorData.error || "Failed to update transaction",
        details: errorData.details,
        code: "TRANSACTION_UPDATE_FAILED",
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
