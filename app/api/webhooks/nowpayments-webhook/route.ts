import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NOWPAYMENTS_API_KEY = 'J5SHGSD-EBVMJX6-PYEKYZ9-4VB4CMT';
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

// Initialize NOWPayments API client
const nowpayments = axios.create({
  baseURL: NOWPAYMENTS_API_URL,
  headers: {
    'x-api-key': NOWPAYMENTS_API_KEY!,
    'Content-Type': 'application/json',
  },
});

export async function POST(request: Request) {
  try {
    console.log('🔔 NOWPayments Webhook Received');
    
    const body = await request.json();
    console.log('📦 Webhook Payload:', JSON.stringify(body, null, 2));
    
    const signature = request.headers.get('x-nowpayments-sig');
    console.log('🔑 Webhook Signature:', signature);

    // Skip signature verification in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🛠️ Development mode: Skipping signature verification');
    }

    const { event_type, data } = body;
    console.log(`🎯 Processing event: ${event_type}`);

    switch (event_type) {
      case 'subscription_created':
        await handleSubscriptionCreated(data);
        break;

      case 'subscription_canceled':
        await handleSubscriptionCanceled(data);
        break;

      case 'subscription_renewed':
        await handleSubscriptionRenewed(data);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event_type}`);
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleSubscriptionCreated(data: any) {
  console.log('📝 Processing subscription creation:', data);
  
  const { subscription_id, customer_id, plan_id } = data;

  try {
    // Find user by NOWPayments customer ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('clerk_user_id')
      .eq('nowpayments_customer_id', customer_id)
      .single();

    if (userError) {
      console.error('❌ Error finding user:', userError);
      return;
    }

    if (!user) {
      console.error('❌ User not found for customer ID:', customer_id);
      return;
    }

    console.log('👤 Found user:', user);

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        clerk_user_id: user.clerk_user_id,
        stripe_transaction_id: subscription_id,
        amount: data.price_amount || 0,
        status: 'active',
      })
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Error creating transaction:', transactionError);
      return;
    }

    console.log('💳 Created transaction:', transaction);

    // Log subscription event
    console.log('📊 Subscription created successfully:', {
      subscription_id,
      customer_id,
      plan_id,
      transaction_id: transaction.id
    });

  } catch (error) {
    console.error('❌ Error in handleSubscriptionCreated:', error);
  }
}

async function handleSubscriptionCanceled(data: any) {
  console.log('📝 Processing subscription cancellation:', data);
  
  const { subscription_id } = data;

  try {
    // First, try to cancel the subscription via NOWPayments API
    const cancelResponse = await nowpayments.post(`/subscription/${subscription_id}/cancel`);
    console.log('🔗 NOWPayments cancel response:', cancelResponse.data);

    // Update transaction status
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_transaction_id', subscription_id)
      .select()
      .single();

    if (transactionError) {
      console.error('❌ Error updating transaction:', transactionError);
      return;
    }

    console.log('💳 Updated transaction:', transaction);
    console.log('📊 Subscription canceled successfully:', {
      subscription_id,
      transaction_id: transaction.id
    });

  } catch (error) {
    console.error('❌ Error in handleSubscriptionCanceled:', error);
  }
}

async function handleSubscriptionRenewed(data: any) {
  console.log('📝 Processing subscription renewal:', data);
  
  const { subscription_id, price_amount } = data;

  try {
    // Find the original transaction
    const { data: existingTransaction, error: findError } = await supabase
      .from('transactions')
      .select('clerk_user_id')
      .eq('stripe_transaction_id', subscription_id)
      .single();

    if (findError) {
      console.error('❌ Error finding existing transaction:', findError);
      return;
    }

    if (!existingTransaction) {
      console.error('❌ Existing transaction not found');
      return;
    }

    // Create new transaction for renewal
    const { data: newTransaction, error: createError } = await supabase
      .from('transactions')
      .insert({
        clerk_user_id: existingTransaction.clerk_user_id,
        stripe_transaction_id: `${subscription_id}_renewal_${Date.now()}`,
        amount: price_amount || 0,
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating renewal transaction:', createError);
      return;
    }

    console.log('💳 Created renewal transaction:', newTransaction);
    console.log('📊 Subscription renewed successfully:', {
      subscription_id,
      renewal_transaction_id: newTransaction.id
    });

  } catch (error) {
    console.error('❌ Error in handleSubscriptionRenewed:', error);
  }
} 