import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { planId, btcAddress } = await request.json();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*, facility_id (name), miner_id (name)")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const { data: supabaseUser, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (userError || !supabaseUser) {
      return NextResponse.json(
        { error: "User not found in Supabase" },
        { status: 404 }
      );
    }

    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: supabaseUser.id,
        plan_id: planId,
        amount: plan.price,
        status: "pending",
        type: 'subscription', // Changed from 'one-time' to 'subscription'
        description: `Subscription for ${plan.type} plan - ${plan.hashrate} TH/s`,
      })
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
              interval: 'month', // Add recurring payment configuration
            },
            product_data: {
              name: `${
                plan.type === "hashrate" ? "Hashrate" : "Hosting"
              } Plan - ${plan.hashrate} TH/s`,
              description: `Facility: ${plan.facility_id.name}, Miner: ${plan.miner_id.name}, Duration: ${plan.duration}`,
            },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "subscription", // Changed from "payment" to "subscription"
      success_url: `${request.headers.get(
        "origin"
      )}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/checkout?canceled=true`,
      metadata: {
        user_id: supabaseUser.id,
        plan_id: planId,
        btc_address: btcAddress,
        transaction_id: transaction.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });

    await supabase
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
