import { createClientSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { CurrencyCode, Transaction, TransactionStatus } from "@/types";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId, getToken } = await auth();
  const sessionToken = await getToken();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { planId, cryptoAddress, paymentMethod } = await request.json();
  if (!planId || !cryptoAddress || !paymentMethod) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,59})$/;
  if (!btcRegex.test(cryptoAddress)) {
    return NextResponse.json({ error: "Invalid cryptocurrency address" }, { status: 400 });
  }

  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Failed to retrieve authentication token");
    }
    const client = createClientSupabaseClient();

    const { error: updateError } = await client
      .from("users")
      .update({ crypto_address: cryptoAddress })
      .eq("user_id", userId);
    if (updateError) {
      throw new Error(`Failed to update crypto address: ${updateError.message}`);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/hashrate-plans/${planId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch plan details");
    }
    const plan = await response.json();

    if (paymentMethod === "stripe") {
      const stripeResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/webhooks/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`, // Pass session token
        },
        body: JSON.stringify({ planId, cryptoAddress }),
        credentials: "include", // Add this to include cookies
      });

      if (!stripeResponse.ok) {
        const errorText = await stripeResponse.text();
        throw new Error(`Failed to create checkout session: ${errorText}`);
      }

      const { sessionId } = await stripeResponse.json();
      return NextResponse.json({ sessionId });
    } else if (paymentMethod === "nowpayments") {
      const nowPaymentsResponse = await fetch("https://api.nowpayments.io/v1/invoice", {
        method: "POST",
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_amount: plan.price,
          price_currency: plan.currency.toLowerCase(),
          order_id: `order_${userId}_${planId}`,
          order_description: `Payment for plan hashrate ${plan.hashrate} TH/s`,
          ipn_callback_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/nowpayments-webhook`,
          success_url: `${process.env.NEXT_PUBLIC_URL}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment/cancel`,
        }),
      });

      const nowPaymentsData = await nowPaymentsResponse.json();
      if (nowPaymentsResponse.ok && nowPaymentsData.invoice_url) {
        // Record transaction in Supabase
        const transaction: Partial<Transaction>  = {
            user_id: userId,
            plan_id: planId,
            amount: plan?.price,
            currency: plan?.currency as CurrencyCode,
            status: TransactionStatus.Pending,
            payment_method_id: nowPaymentsData.payment_id,
            payment_provider_reference: `Crypto payment for plan ${planId}`,
            created_at: new Date().toISOString(),
        };

        const { error: transactionError } = await client
          .from("transactions")
          .insert(transaction);
        if (transactionError) {
          throw new Error(`Failed to record transaction: ${transactionError.message}`);
        }

        return NextResponse.json({ invoiceUrl: nowPaymentsData.invoice_url });
      } else {
        throw new Error("Failed to initiate NowPayments checkout");
      }
    } else {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}