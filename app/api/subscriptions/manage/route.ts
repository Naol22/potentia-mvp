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
    
    let sessionUrl = '';
    let sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Session expires in 30 minutes
    
    // Extract payment method name from the response
    const paymentMethodName = subscription.payment_methods?.[0]?.name;
    
    // Handle different payment methods
    if (paymentMethodName === 'stripe') {
      // Create Stripe customer portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.provider_subscription_id,
        return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
      });
      
      sessionUrl = portalSession.url;
    } else if (paymentMethodName === 'bitpay') {
      // For BitPay, we might need a different approach
      // This is a placeholder - BitPay doesn't have a direct equivalent to Stripe's portal
      sessionUrl = `${process.env.NEXT_PUBLIC_URL}/dashboard/subscriptions/${subscriptionId}?token=${sessionToken}`;
    } else {
      return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
    }
    
    // Create a secure session record
    const { error: sessionError } = await supabase
      .from('subscription_sessions')
      .insert({
        user_id: userData.id,
        subscription_id: subscriptionId,
        session_url: sessionUrl,
        session_token: sessionToken,
        expires_at: expiresAt,
      });
      
    if (sessionError) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
    
    // Return the session URL
    return NextResponse.json({ 
      url: sessionUrl,
      expiresAt
    });
  } catch (error) {
    console.error('Error creating subscription management session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}