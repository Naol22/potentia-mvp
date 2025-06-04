"use server";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClientSupabaseClient } from "@/lib/supabase";
import { Transaction, PaymentType, TransactionStatus, CurrencyCode, PlanType } from "@/types";
import { auth, currentUser } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(request: Request) {
  const client = createClientSupabaseClient();
  try {
    console.log("[Checkout Session API] Initiating checkout session in Supabase...");
    const { planId, cryptoAddress, paymentMethod } = await request.json();
    if (paymentMethod !== "stripe") {
      console.error("[Checkout Session API] Error initiating checkout session:", {
        message: "Invalid payment method",
        details: "This route supports Stripe payments only",
        code: "INVALID_PAYMENT_METHOD",
      });
      throw new Error("This route is for Stripe payments only");
    }
    if (!planId || !cryptoAddress) {
      console.error("[Checkout Session API] Error initiating checkout session:", {
        message: "Missing required fields",
        details: "planId and cryptoAddress are required",
        code: "MISSING_FIELDS",
      });
      throw new Error("Missing planId or cryptoAddress");
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
    const { userId, getToken } = await auth();
    const sessionToken = await getToken();
    const user = await currentUser()
    if (!userId) {
      console.error("[Checkout Session API] Error initiating checkout session:", {
        message: "User not authenticated",
        details: "No authenticated user found",
        code: "UNAUTHENTICATED",
      });
      throw new Error("User not authenticated");
    }
    console.log("[Checkout Session API] Updating user crypto address...");
    const updateUserResponse = await fetch(`${request.headers.get("origin")}/api/update-user`, {
      method: "POST",
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${sessionToken}`,"Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
        cryptoAddress,
      }),
    });
    if (!updateUserResponse.ok) {
      const errorData = await updateUserResponse.json();
      console.error("[Checkout Session API] Error updating user crypto address:", {
        message: errorData.error || "Failed to update user",
        details: errorData.details,
        code: "USER_UPDATE_FAILED",
      });
      throw new Error("Failed to update user crypto address");
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
      created_at: new Date().toISOString(),
    };
    const createTransactionResponse = await fetch(`${request.headers.get("origin")}/api/update-transaction`, {
      method: "POST",
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${sessionToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        transaction,
      }),
    });
    if (!createTransactionResponse.ok) {
      const errorData = await createTransactionResponse.json();
      console.error("[Checkout Session API] Error creating transaction:", {
        message: errorData.error || "Failed to create transaction",
        details: errorData.details,
        code: "TRANSACTION_CREATE_FAILED",
      });
      throw new Error("Failed to create transaction");
    }
    const { transaction: createdTransaction } = await createTransactionResponse.json();
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
      },
    });
    console.log("[Checkout Session API] Successfully created Stripe Checkout session:", {
      sessionId: session.id,
      planId: plan.id,
      transactionId: createdTransaction.id,
    });
    return NextResponse.json({ sessionId: session.id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[Checkout Session API] Error initiating checkout session:", {
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
