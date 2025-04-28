import { NextResponse } from 'next/server';
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { subscriptionId } = await request.json();
    
    // Authenticate user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get user's Supabase ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();
      
    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get subscription details
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('id, payment_method_id, provider_subscription_id, payment_methods(name)')
      .eq('id', subscriptionId)
      .eq('user_id', userData.id) // Security: ensure subscription belongs to user
      .single();
      
    if (subscriptionError || !subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    
    // Generate secure token with expiration for all payment methods
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Session expires in 30 minutes
    
    let sessionUrl = '';
    
    // Extract payment method name from the response
    const paymentMethodName = subscription.payment_methods?.[0]?.name;
    
    // Handle different payment methods
    if (paymentMethodName === 'stripe') {
      // Create Stripe customer portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.provider_subscription_id,
        return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
      });
      
      // For Stripe, we'll still use their portal but track the session with our token
      sessionUrl = portalSession.url;
    } else if (paymentMethodName === 'nowpayments') {
      // For NOWPayments, we need a custom management page
      sessionUrl = `${process.env.NEXT_PUBLIC_URL}/dashboard/subscriptions/${subscriptionId}/manage?token=${sessionToken}`;
    } else {
      return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
    }
    
    // Create a secure session record for all payment methods
    const { error: sessionError } = await supabase
      .from('subscription_sessions')
      .insert({
        user_id: userData.id,
        subscription_id: subscriptionId,
        session_url: sessionUrl,
        session_token: sessionToken,
        expires_at: expiresAt,
        payment_method: paymentMethodName
      });
      
    if (sessionError) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
    
    // Return the session URL and token information
    return NextResponse.json({ 
      url: sessionUrl,
      token: sessionToken,
      expiresAt
    });
  } catch (error) {
    console.error('Error creating subscription management session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add a new GET endpoint to validate tokens and retrieve subscription data
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const subscriptionId = url.searchParams.get('subscriptionId');
    
    if (!token || !subscriptionId) {
      return NextResponse.json({ error: "Missing token or subscription ID" }, { status: 400 });
    }
    
    // Verify the token is valid and not expired
    const now = new Date();
    const { data: session, error: sessionError } = await supabase
      .from('subscription_sessions')
      .select('user_id, subscription_id, expires_at, payment_method')
      .eq('session_token', token)
      .eq('subscription_id', subscriptionId)
      .gt('expires_at', now.toISOString())
      .single();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    // Get subscription details
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        id, 
        status, 
        current_period_start, 
        current_period_end,
        payment_method_id,
        provider_subscription_id,
        payment_methods(name),
        user_id (id, first_name, last_name, email)
      `)
      .eq('id', subscriptionId)
      .eq('user_id', session.user_id)
      .single();
    
    if (subscriptionError || !subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      subscription,
      sessionValid: true,
      expiresAt: session.expires_at
    });
  } catch (error) {
    console.error('Error validating subscription session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}