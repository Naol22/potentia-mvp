import { NextResponse } from 'next/server';
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Stripe Customer Portal sharable link (replace with your live link in production)
const STRIPE_PORTAL_LINK = 'https://billing.stripe.com/p/login/test_dRmfZa4PD2tPgw28rkak000';

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
      .eq('user_id', user.id)
      .single();
      
    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get subscription details
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('id, payment_method_id, provider_subscription_id, payment_methods(name)')
      .eq('id', subscriptionId)
      .eq('user_id', userData.id)
      .single();
      
    if (subscriptionError || !subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    
    const paymentMethodName = subscription.payment_methods?.[0]?.name;
    
    if (paymentMethodName === 'stripe') {
      // For Stripe, return the sharable customer portal link
      return NextResponse.json({ url: STRIPE_PORTAL_LINK });
    } else if (paymentMethodName === 'nowpayments') {
      // For NowPayments, generate a session token and custom management URL
      //Everything under this block is specific to NowPayments management and it is a placeholder for the actual implementation.
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);
      
      const sessionUrl = `${process.env.NEXT_PUBLIC_URL}/dashboard/subscriptions/${subscriptionId}/manage?token=${sessionToken}`;
      
      const { error: sessionError } = await supabase
        .from('subscription_sessions')
        .insert({
          user_id: userData.id,
          subscription_id: subscriptionId,
          provider: 'nowpayments',
          session_id: sessionToken,
          session_url: sessionUrl,
          expires_at: expiresAt,
          is_used: false,
        });
        
      if (sessionError) {
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
      }
      
      return NextResponse.json({ 
        url: sessionUrl,
        token: sessionToken,
        expiresAt
      });
    } else {
      return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating subscription management session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const subscriptionId = url.searchParams.get('subscriptionId');
    
    if (!token || !subscriptionId) {
      return NextResponse.json({ error: "Missing token or subscription ID" }, { status: 400 });
    }
    
    // Verify the token is valid and not expired (only for NowPayments)
    const now = new Date();
    const { data: session, error: sessionError } = await supabase
      .from('subscription_sessions')
      .select('user_id, subscription_id, expires_at, provider')
      .eq('session_id', token)
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
        user_id(id, first_name, last_name, email)
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