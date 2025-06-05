"use server";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { TransactionStatus, CurrencyCode } from "@/types";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_SECRET_KEY!;
const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";
const NOWPAYMENTS_WEBHOOK_SECRET = process.env.NOWPAYMENTS_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    console.log("[Webhook NOWPayments API] Verifying and processing NOWPayments webhook event...");

    // Verify webhook signature
    const sig = request.headers.get("x-nowpayments-sig")!;
    const body = await request.text();
    const hmac = crypto
      .createHmac("sha512", NOWPAYMENTS_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (sig !== hmac) {
      console.error("[Webhook NOWPayments API] Error verifying webhook signature:", {
        message: "Invalid signature",
        details: "Signature does not match",
        code: "INVALID_SIGNATURE",
      });
      return NextResponse.json({ error: "Webhook Error: Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.payment_status) {
      case "finished":
      case "confirmed":
        await handleCheckoutCompleted(event);
        break;
      default:
        console.log("[Webhook NOWPayments API] Unhandled event status:", {
          paymentStatus: event.payment_status,
        });
    }

    console.log("[Webhook NOWPayments API] Successfully processed webhook event:", {
      paymentStatus: event.payment_status,
      paymentId: event.payment_id,
    });
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[Webhook NOWPayments API] Error processing webhook event:", {
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

async function handleCheckoutCompleted(payment: {
  payment_status: string;
  payment_id: string;
  metadata: {
    planId: string;
    cryptoAddress: string;
    paymentMethod: string;
    transactionId: string;
  } | null;
  success_url?: string;
  pay_amount: number;
  pay_currency: string;
}) {
  if (!payment.metadata) {
    throw new Error("Metadata is null");
  }
  const { planId, cryptoAddress, paymentMethod, transactionId } = payment.metadata;

  try {
    console.log("[Webhook NOWPayments API] Handling checkout completed event...");
    if (!transactionId) {
      console.error("[Webhook NOWPayments API] Error handling checkout completion:", {
        message: "Missing transactionId in metadata",
        details: "Transaction ID is required to update transaction",
        code: "MISSING_TRANSACTION_ID",
      });
      throw new Error("Missing transactionId in metadata");
    }

    const paymentStatusRes = await axios.get(
      `${NOWPAYMENTS_API_URL}/payment/${payment.payment_id}`,
      {
        headers: {
          "x-api-key": NOWPAYMENTS_API_KEY,
        },
      }
    );
    const paymentStatus = paymentStatusRes.data;

    if (paymentStatus.payment_status !== "finished" && paymentStatus.payment_status !== "confirmed") {
      console.error("[Webhook NOWPayments API] Error handling checkout completion:", {
        message: "Payment not successful",
        details: `Payment status: ${paymentStatus.payment_status}`,
        code: "PAYMENT_NOT_SUCCESSFUL",
      });
      throw new Error("Payment not successful");
    }

    console.log("[Webhook NOWPayments API] Updating transaction to completed...");
    const updateTransactionResponse = await fetch(
      `${payment.success_url?.split("?")[0]}/api/update-transaction`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          transaction: {
            id: transactionId,
            status: "completed" as TransactionStatus,
            payment_method_id: payment.payment_id,
            payment_provider_reference: `NOWPayments payment ${payment.payment_id}`,
            amount: payment.pay_amount,
            currency: payment.pay_currency as CurrencyCode || "BTC",
            created_at: new Date().toISOString(),
          },
        }),
      }
    );

    if (!updateTransactionResponse.ok) {
      const errorData = await updateTransactionResponse.json();
      console.error("[Webhook NOWPayments API] Error updating transaction:", {
        message: errorData.error || "Failed to update transaction",
        details: errorData.details,
        code: "TRANSACTION_UPDATE_FAILED",
      });
      throw new Error("Failed to update transaction");
    }

    const { transaction: updatedTransaction } = await updateTransactionResponse.json();

    console.log("[Webhook NOWPayments API] Creating order in orders table...");
    const order = {
      user_id: updatedTransaction.user_id,
      plan_id: planId,
      transaction_id: transactionId,
      amount: payment.pay_amount || updatedTransaction.amount,
      currency: payment.pay_currency as CurrencyCode || updatedTransaction.currency,
      status: "active",
      created_at: new Date().toISOString(),
    };

    const { error: orderError } = await supabase.from("orders").insert(order);
    if (orderError) {
      console.error("[Webhook NOWPayments API] Error creating order:", {
        message: orderError.message,
        details: orderError.details,
        code: orderError.code,
      });
      throw new Error("Failed to create order");
    }

    console.log("[Webhook NOWPayments API] Successfully processed checkout completion:", {
      transactionId,
      orderId: (await supabase.from("orders").select("id").eq("transaction_id", transactionId).single()).data?.id,
    });

    // Create subscription record
    const subscription = {
      user_id: updatedTransaction.user_id,
      plan_type: "hashrate",
      plan_id: planId,
      status: "active",
      provider_subscription_id: payment.payment_id,
      payment_method_id: updatedTransaction.payment_method_id,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      cancel_at_period_end: false,
      metadata: {
        transaction_id: transactionId,
        crypto_address: cryptoAddress
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: subError } = await supabase.from("subscriptions").insert(subscription);
    if (subError) {
      console.error("[Webhook NOWPayments API] Error creating subscription:", {
        message: subError.message,
        details: subError.details,
        code: subError.code,
      });
      throw new Error("Failed to create subscription");
    }

    // Create subscription event
    const subscriptionEvent = {
      subscription_id: (await supabase.from("subscriptions")
        .select("id")
        .eq("provider_subscription_id", payment.payment_id)
        .single()).data?.id,
      user_id: updatedTransaction.user_id,
      event_type: "subscription_created",
      provider: "nowpayments",
      data: {
        payment_id: payment.payment_id,
        amount: payment.pay_amount,
        currency: payment.pay_currency
      },
      status: "success",
      created_at: new Date().toISOString()
    };

    const { error: eventError } = await supabase.from("subscription_events").insert(subscriptionEvent);
    if (eventError) {
      console.error("[Webhook NOWPayments API] Error creating subscription event:", {
        message: eventError.message,
        details: eventError.details,
        code: eventError.code,
      });
      throw new Error("Failed to create subscription event");
    }
  } catch (error) {
    console.error("[Webhook NOWPayments API] Error handling checkout completion:", {
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