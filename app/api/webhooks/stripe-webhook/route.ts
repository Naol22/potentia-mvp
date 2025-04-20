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

      const { error: orderError } = await supabase
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

      if (orderError) {
        console.error('Error creating order:', orderError);
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

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}