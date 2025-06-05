"use server";

import { NextResponse } from "next/server";
import { createClientSupabaseClient } from "@/lib/supabase";
import { Transaction, PaymentType, TransactionStatus, CurrencyCode, PlanType } from "@/types";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const client = createClientSupabaseClient();

  try {
    console.log("[Checkout Session API] Initiating NOWPayments checkout session...");

    const { planId, cryptoAddress, paymentMethod } = await request.json();
    if (paymentMethod !== "nowpayments") {
      console.error("[Checkout Session API] Error initiating checkout session:", {
        message: "Invalid payment method",
        details: "This route supports NOWPayments payments only",
        code: "INVALID_PAYMENT_METHOD",
      });
      throw new Error("This route is for NOWPayments payments only");
    }
    if (!planId || !cryptoAddress) {
      console.error("[Checkout Session API] Error initiating checkout session:", {
        message: "Missing required fields",
        details: "planId and cryptoAddress are required",
        code: "MISSING_FIELDS",
      });
      throw new Error("Missing planId or cryptoAddress");
    }

    const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,59})$/;
    if (!btcRegex.test(cryptoAddress)) {
      console.error("[Checkout Session API] Error initiating checkout session:", {
        message: "Invalid cryptocurrency address",
        details: "Crypto address does not match expected format",
        code: "INVALID_CRYPTO_ADDRESS",
      });
      throw new Error("Invalid cryptocurrency address");
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
      credentials: "include",
      headers: { "Authorization": `Bearer ${sessionToken}`, "Content-Type": "application/json" },
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
      payment_provider_reference: `NOWPayments checkout for plan ${plan.id}`,
      created_at: new Date().toISOString(),
    };
    const createTransactionResponse = await fetch(`${request.headers.get("origin")}/api/update-transaction`, {
      method: "POST",
      credentials: "include",
      headers: { "Authorization": `Bearer ${sessionToken}`, "Content-Type": "application/json" },
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

    console.log("[Checkout Session API] Creating NOWPayments invoice...");
    const nowPaymentsResponse = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_SECRET_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: plan.price,
        price_currency: plan.currency.toLowerCase(),
        order_id: `order_${userId}_${plan.id}_${Date.now()}`,
        order_description: `Payment for plan hashrate ${plan.hashrate} TH/s`,
        ipn_callback_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/nowpayments-webhook`,
        success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout`,
        partially_paid_url: `${process.env.NEXT_PUBLIC_URL}/checkout`,
      }),
    });

    if (!nowPaymentsResponse.ok) {
      const errorData = await nowPaymentsResponse.json();
      console.error("[Checkout Session API] Error creating NOWPayments invoice:", {
        message: errorData.message || "Unknown error",
        details: errorData,
        code: "NOWPAYMENTS_INVOICE_FAILED",
      });
      throw new Error(`NOWPayments API error: ${errorData.message || "Unknown error"}`);
    }

    const nowPaymentsData = await nowPaymentsResponse.json();
    if (!nowPaymentsData.invoice_url) {
      console.error("[Checkout Session API] Error creating NOWPayments invoice:", {
        message: "Invalid response from NOWPayments API",
        details: "Missing invoice_url in response",
        code: "INVALID_RESPONSE",
      });
      throw new Error("Invalid response from NOWPayments API");
    }

    console.log("[Checkout Session API] Successfully created NOWPayments invoice:", {
      invoiceId: nowPaymentsData.id,
      planId: plan.id,
      transactionId: createdTransaction.id,
    });

    return NextResponse.json({
      invoiceUrl: nowPaymentsData.invoice_url,
      paymentId: nowPaymentsData.payment_id,
      paymentAddress: nowPaymentsData.pay_address,
      paymentAmount: nowPaymentsData.pay_amount,
      paymentCurrency: nowPaymentsData.pay_currency,
    });
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