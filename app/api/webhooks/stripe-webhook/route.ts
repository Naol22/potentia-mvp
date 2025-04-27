import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil', 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const { user_id, plan_id, btc_address, transaction_id, start_date, end_date } = session.metadata || {};

      if (!user_id || !plan_id || !btc_address || !transaction_id || !start_date || !end_date) {
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transaction_id);

      if (transactionError) {
        console.error('Error updating transaction:', transactionError);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
      }

      const { error: checkoutOrderError } = await supabase
        .from('orders')
        .insert({
          user_id,
          plan_id,
          btc_address,
          stripe_payment_id: session.id,
          transaction_id,
          status: 'active',
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          is_active: true,
          next_billing_date: new Date(end_date),
          auto_renew: false,
        });

      if (checkoutOrderError) {
        console.error('Error creating order:', checkoutOrderError);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
      }
      break;

    case 'checkout.session.expired':
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      const expiredTransactionId = expiredSession.metadata?.transaction_id;

      if (expiredTransactionId) {
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', expiredTransactionId);
      }
      break;

    // In customer.subscription.deleted handler
    case 'customer.subscription.deleted':
      const cancelledSubscription = event.data.object as Stripe.Subscription;
      const subscriptionId = cancelledSubscription.id;
      
      // Find the subscription and user data first
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('provider_subscription_id', subscriptionId)
        .single();
        
      if (subscriptionError || !subscriptionData) {
        console.error('Error updating subscription:', subscriptionError);
        break;
      }

      // Update subscription record
      const { error: subUpdateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', subscriptionData.id);
          
      if (subUpdateError) {
        console.error('Error updating subscription:', subUpdateError);
        break;
      }

      // Also update related orders
      const { error: subOrderError } = await supabase
        .from('orders')
        .update({
          status: 'unsubscribed',
          is_active: false,
          auto_renew: false
        })
        .eq('subscription_id', subscriptionData.id);
        
      if (subOrderError) {
        console.error('Error updating order status:', subOrderError);
      }
      break;
    
    // In customer.subscription.created handler
    case 'customer.subscription.created':
      const newSubscription = event.data.object as Stripe.Subscription;
      const customerId = newSubscription.customer as string;
      
      // Get the price details
      const priceId = newSubscription.items.data[0].price.id;
      const { data: priceData } = await supabase
        .from('plans')
        .select('id')
        .eq('stripe_price_id', priceId)
        .single();
        
      if (!priceData) {
        console.error('Price not found:', priceId);
        break;
      }
      
      // Find the user by Stripe customer ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();
        
      if (!userData) {
        console.error('User not found for customer:', customerId);
        break;
      }
      
      // Create subscription record
      const { data: newSubData, error: createError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userData.id,
          plan_id: priceData.id,
          provider_subscription_id: newSubscription.id,
          payment_method_id: 1, // Assuming 1 is Stripe's payment method ID
          status: newSubscription.status,
          current_period_start: new Date((newSubscription as any).current_period_start * 1000),
          current_period_end: new Date((newSubscription as any).current_period_end * 1000),
          created_at: new Date(),
          updated_at: new Date()
        })
        .select('id')
        .single();
        
      if (createError) {
        console.error('Error creating subscription record:', createError);
        break;
      }
      
      // Log the event
      await supabase
        .from('subscription_events')
        .insert({
          subscription_id: newSubData.id,
          user_id: userData.id, // Add user_id
          event_type: 'subscription_created',
          data: JSON.stringify(newSubscription)
        });
      break;
      
    // In customer.subscription.updated handler
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      
      // Find the subscription first
      const { data: existingSubData, error: findError } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('provider_subscription_id', updatedSubscription.id)
        .single();
        
      if (findError || !existingSubData) {
        console.error('Error finding subscription:', findError);
        break;
      }
      
      // Update subscription record
      const { error: subscriptionUpdateError } = await supabase
        .from('subscriptions')
        .update({
          status: updatedSubscription.status,
          current_period_start: new Date((updatedSubscription as any).current_period_start * 1000),
          current_period_end: new Date((updatedSubscription as any).current_period_end * 1000),
          updated_at: new Date()
        })
        .eq('provider_subscription_id', updatedSubscription.id);
        
      if (subscriptionUpdateError) {
        console.error('Error updating subscription:', subscriptionUpdateError);
        break;
      }
      
      // Log the event
      await supabase
        .from('subscription_events')
        .insert({
          subscription_id: existingSubData.id,
          user_id: existingSubData.user_id,
          event_type: 'subscription_updated',
          data: JSON.stringify(updatedSubscription)
        });
      break;
      
    // In customer.subscription.paused handler
    case 'customer.subscription.paused':
      const pausedSubscription = event.data.object as Stripe.Subscription;
      
      // Find the subscription first
      const { data: pausedSubData, error: pausedFindError } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('provider_subscription_id', pausedSubscription.id)
        .single();
        
      if (pausedFindError || !pausedSubData) {
        console.error('Error finding subscription:', pausedFindError);
        break;
      }
      
      // Update subscription record
      const { error: pauseError } = await supabase
        .from('subscriptions')
        .update({
          status: 'paused',
          updated_at: new Date()
        })
        .eq('provider_subscription_id', pausedSubscription.id);
        
      if (pauseError) {
        console.error('Error pausing subscription:', pauseError);
        break;
      }
      
      // Log the event
      await supabase
        .from('subscription_events')
        .insert({
          subscription_id: pausedSubData.id,
          user_id: pausedSubData.user_id,
          event_type: 'subscription_paused',
          data: JSON.stringify(pausedSubscription)
        });
      break;

    // Fix in invoice.payment_succeeded and invoice.payment_failed handlers
    case 'invoice.payment_succeeded':
      const successfulInvoice = event.data.object as Stripe.Invoice;
      const successSubId = (successfulInvoice as any).subscription as string;
      
      if (!successSubId) {
        console.log('No subscription associated with this invoice');
        break;
      }
      
      // Find the subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('provider_subscription_id', successSubId)
        .single();
        
      if (subError || !subData) {
        console.error('Error finding subscription:', subError);
        break;
      }
      
      // Record the payment in transactions
      await supabase
        .from('transactions')
        .insert({
          user_id: subData.user_id,
          subscription_id: subData.id,
          amount: successfulInvoice.amount_paid / 100,
          currency: successfulInvoice.currency,
          status: 'completed',
          type: 'subscription_renewal',
          stripe_payment_id: successfulInvoice.id,
          description: `Subscription payment succeeded for subscription ${subData.id}`,
          created_at: new Date(successfulInvoice.created * 1000)
        });
        
      // Log the event
      await supabase
        .from('subscription_events')
        .insert({
          subscription_id: subData.id,
          user_id: subData.user_id, // Add user_id
          event_type: 'payment_succeeded',
          data: JSON.stringify(successfulInvoice)
        });
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      const failedSubId = (failedInvoice as any).subscription as string;
      
      if (!failedSubId) {
        console.log('No subscription associated with this invoice');
        break;
      }
      
      // Find the subscription
      const { data: failedSubData, error: failedSubError } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('provider_subscription_id', failedSubId)
        .single();
        
      if (failedSubError || !failedSubData) {
        console.error('Error finding subscription:', failedSubError);
        break;
      }
      
      // Record the failed payment in transactions
      await supabase
        .from('transactions')
        .insert({
          user_id: failedSubData.user_id,
          subscription_id: failedSubData.id,
          amount: failedInvoice.amount_due / 100,
          currency: failedInvoice.currency,
          status: 'failed',
          type: 'subscription_renewal',
          stripe_payment_id: failedInvoice.id,
          description: `Subscription payment failed for subscription ${failedSubData.id}`,
          created_at: new Date(failedInvoice.created * 1000)
        });
        
      // Log the event
      await supabase
        .from('subscription_events')
        .insert({
          subscription_id: failedSubData.id,
          user_id: failedSubData.user_id, // Add user_id
          event_type: 'payment_failed',
          data: JSON.stringify(failedInvoice)
        });
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}