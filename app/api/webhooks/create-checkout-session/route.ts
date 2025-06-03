import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import {
  CurrencyCode,
  PaymentType,
  Transaction,
  TransactionStatus,
} from "@/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const client = createServerSupabaseClient();
    const { planId, cryptoAddress } = await request.json();

    console.log("[Checkout API] Creating checkout session...");
    console.log("[Checkout API] User ID:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plan, error: planError } = await client
      .from("hashrate_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const transaction: Partial<Transaction> = {
      user_id: userId,
      plan_id: planId,
      plan_type: "hashrate",
      amount: plan?.price,
      currency: plan?.currency as CurrencyCode,
      status: TransactionStatus.Pending,
      payment_type: PaymentType.Subscription,
      payment_provider_reference: `Crypto payment for plan ${planId}`,
      created_at: new Date().toISOString(),
    };

    const { error: transactionError } = await client
      .from("transactions")
      .insert(transaction)
      .select()
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            recurring: {
              interval: "month", // Add recurring payment configuration
            },
            product_data: {
              name: `${
                plan.type === "hashrate" ? "Hashrate" : "Hosting"
              } Plan - ${plan.hashrate} TH/s`,
              description: `Duration: ${plan.duration}`,
            },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${request.headers.get(
        "origin"
      )}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/checkout?canceled=true`,
      metadata: {
        user_id: userId,
        plan_id: planId,
        cryptoAddress: cryptoAddress,
        transaction_id: transaction.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });

    await client
      .from("transactions")
      .update({ stripe_payment_id: session.id })
      .eq("id", transaction.id);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
