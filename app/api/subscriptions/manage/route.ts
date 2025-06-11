import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase";

// Stripe Customer Portal sharable link (replace with your live link in production)
const STRIPE_PORTAL_LINK = 'https://billing.stripe.com/p/login/test_dRmfZa4PD2tPgw28rkak000';

export async function POST(request: Request) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = createServerSupabaseClient();
    const { subscriptionId } = await request.json();

    // Fetch the specific subscription based on user_id and subscriptionId
    console.log("[Subscriptions API] Fetching subscription from Supabase...");
    const { data: subscription, error: subscriptionError } = await client
      .from("subscriptions")
      .select("id, user_id, plan_id, status, payment_method_id, provider_subscription_id, current_period_start, current_period_end, cancel_at_period_end, canceled_at, created_at, updated_at, payment_methods(name)")
      .eq('user_id', userId)
      .eq('id', subscriptionId)
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // const paymentMethodName = subscription.payment_methods?.[0]?.name;
    const paymentMethodName = "stripe";

    if (paymentMethodName === 'stripe') {
      // For Stripe, return the sharable customer portal link
      return NextResponse.json({ url: STRIPE_PORTAL_LINK });
    } else if (paymentMethodName === 'nowpayments') {
      // For NowPayments, this is a placeholder for the actual implementation
      return NextResponse.json({ error: "NowPayments management not implemented" }, { status: 501 });
    } else {
      return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating subscription management session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = createServerSupabaseClient();

    // Fetch all subscriptions for the user
    console.log("[Subscriptions API] Fetching subscriptions from Supabase...");
    const { data: subscriptions, error: subscriptionError } = await client
      .from("subscriptions")
      .select("id, user_id, plan_id, status, payment_method_id, provider_subscription_id, current_period_start, current_period_end, cancel_at_period_end, canceled_at, created_at, updated_at, payment_methods(name), user_id(id, first_name, last_name, email)")
      .eq('user_id', userId);

    if (subscriptionError || !subscriptions) {
      return NextResponse.json({ error: "No subscriptions found" }, { status: 404 });
    }

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}