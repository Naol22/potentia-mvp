"use server";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClientSupabaseClient } from "@/lib/supabase";
import { Transaction, PaymentType, TransactionStatus, CurrencyCode, PlanType, SubscriptionStatus } from "@/types";
import { auth, currentUser } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(request: Request) {
  const client = createClientSupabaseClient();

  try {
    console.log("[Checkout Session API] Initiating checkout session in Supabase...");
    const { planId, cryptoAddress, paymentMethod, paymentMethodId } = await request.json();

    if (paymentMethod !== "stripe") {
      console.error("[Checkout Session API] Error initiating checkout session:", {
        message: "Invalid payment method",
        details: "This route supports Stripe payments only",
        code: "INVALID_PAYMENT_METHOD",
      });
      throw new Error("This route is for Stripe payments only");
    }
    if (!planId || !cryptoAddress || !paymentMethodId) {
      console.error("[Checkout Session API] Error initiating checkout session:", {
        message: "Missing required fields",
        details: "planId, cryptoAddress, and paymentMethodId are required",
        code: "MISSING_FIELDS",
      });
      throw new Error("Missing planId, cryptoAddress, or paymentMethodId");
    }

    console.log("[Checkout Session API] Fetching plan from Supabase...");
    const { data: plan, error: planError } = await client
      .from("hashrate_plans")
      .select("*")
      .eq("id", planId)
      .single();
    if (planError || !plan) {
      console.error("[Checkout Session API] Error fetching plan:", {
        message: planError?.message || "Plan not found",
        details: planError?.details,
        code: planError?.code,
      });
      throw new Error("Plan not found");
    }

    console.log("[Checkout Session API] Fetching authenticated user...");
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId) {
      console.error("[Checkout Session API] Error initiating checkout session:", {
        message: "User not authenticated",
        details: "No authenticated user found",
        code: "UNAUTHENTICATED",
      });
      throw new Error("User not authenticated");
    }

    console.log("[Checkout Session API] Updating user crypto address...");
    const { error: updateUserError } = await client
      .from("users")
      .update({ crypto_address: cryptoAddress })
      .eq("user_id", userId);
    if (updateUserError) {
      console.error("[Checkout Session API] Error updating user crypto address:", {
        message: updateUserError.message,
        details: updateUserError.details,
        code: "USER_UPDATE_FAILED",
      });
      throw new Error("Failed to update user crypto address");
    }

    console.log("[Checkout Session API] Creating subscription entry...");
    const subscription = {
      user_id: userId,
      plan_type: "hashrate" as PlanType,
      plan_id: plan.id,
      status: "incomplete" as SubscriptionStatus,
      payment_method_id: paymentMethodId,
      provider_subscription_id: "", // Will be updated after Stripe session
      created_at: new Date().toISOString(),
    };
    const { data: createdSubscription, error: subscriptionError } = await client
      .from("subscriptions")
      .insert(subscription)
      .select()
      .single();
    if (subscriptionError || !createdSubscription) {
      console.error("[Checkout Session API] Error creating subscription:", {
        message: subscriptionError?.message || "Failed to create subscription",
        details: subscriptionError?.details,
        code: "SUBSCRIPTION_CREATE_FAILED",
      });
      throw new Error("Failed to create subscription");
    }

    console.log("[Checkout Session API] Creating pending transaction...");
    const transaction: Partial<Transaction> = {
      user_id: userId,
      plan_type: "hashrate" as PlanType,
      plan_id: plan.id,
      payment_type: plan.is_subscription ? ("subscription" as PaymentType) : ("one_time" as PaymentType),
      amount: plan.price,
      currency: plan.currency as CurrencyCode || "USD",
      status: "pending" as TransactionStatus,
      payment_provider_reference: `Stripe checkout for plan ${plan.id}`,
      subscription_id: createdSubscription.id,
      payment_method_id: paymentMethodId,
      created_at: new Date().toISOString(),
    };
    const { data: createdTransaction, error: transactionError } = await client
      .from("transactions")
      .insert(transaction)
      .select()
      .single();
    if (transactionError || !createdTransaction) {
      console.error("[Checkout Session API] Error creating transaction:", {
        message: transactionError?.message || "Failed to create transaction",
        details: transactionError?.details,
        code: "TRANSACTION_CREATE_FAILED",
      });
      throw new Error("Failed to create transaction");
    }

    console.log("[Checkout Session API] Creating Stripe Checkout session...");
    const mode = plan.is_subscription ? "subscription" : "payment";
    const lineItems = [
      {
        price: plan.stripe_price_id || undefined,
        quantity: 1,
        adjustable_quantity: { enabled: false },
      },
    ];
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode,
      success_url: `${request.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/checkout`,
      customer_email: user.email || undefined,
      metadata: {
        planId: plan.id,
        cryptoAddress,
        paymentMethod,
        transactionId: createdTransaction.id,
        subscriptionId: createdSubscription.id,
      },
    });

    console.log("[Checkout Session API] Creating subscription session...");
    const subscriptionSession = {
      user_id: userId,
      subscription_id: createdSubscription.id,
      provider: "stripe",
      session_id: session.id,
      session_url: session.url || "",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      metadata: { planId: plan.id, transactionId: createdTransaction.id },
    };
    const { error: sessionError } = await client
      .from("subscription_sessions")
      .insert(subscriptionSession);
    if (sessionError) {
      console.error("[Checkout Session API] Error creating subscription session:", {
        message: sessionError.message,
        details: sessionError.details,
        code: "SUBSCRIPTION_SESSION_CREATE_FAILED",
      });
      throw new Error("Failed to create subscription session");
    }

    console.log("[Checkout Session API] Logging subscription created event...");
    const subscriptionEvent = {
      subscription_id: createdSubscription.id,
      user_id: userId,
      event_type: "created",
      provider: "stripe",
      data: { session_id: session.id, plan_id: plan.id },
      status: "success",
    };
    const { error: eventError } = await client
      .from("subscription_events")
      .insert(subscriptionEvent);
    if (eventError) {
      console.error("[Checkout Session API] Error logging subscription event:", {
        message: eventError.message,
        details: eventError.details,
        code: "SUBSCRIPTION_EVENT_CREATE_FAILED",
      });
      throw new Error("Failed to log subscription event");
    }

    console.log("[Checkout Session API] Successfully created Stripe Checkout session:", {
      sessionId: session.id,
      planId: plan.id,
      transactionId: createdTransaction.id,
      subscriptionId: createdSubscription.id,
    });
    return NextResponse.json({ sessionId: session.id });
  } catch (error: unknown) {
    console.error("[Checkout Session API] Error initiating checkout session:", {
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
