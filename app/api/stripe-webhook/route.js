// app/api/stripe-webhook/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const clerkUserId = session.customer_details.metadata.clerkUserId;
    await supabase.from("transactions").insert({
      clerk_user_id: clerkUserId,
      stripe_transaction_id: session.payment_intent,
      amount: session.amount_total,
      status: "completed",
    });

    // Update user's stripe_customer_id if not set
    await supabase
      .from("users")
      .update({ stripe_customer_id: session.customer })
      .eq("clerk_user_id", clerkUserId);
  }

  return NextResponse.json({ received: true });
}