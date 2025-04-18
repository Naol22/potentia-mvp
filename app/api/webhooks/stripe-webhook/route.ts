import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '@/utils/supaBaseClient'; 
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', 
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headerList = await headers(); 
  const signature = headerList.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, planId, btcAddress, facilityId, minerId } = session.metadata || {};

      if (!userId || !planId) {
        return NextResponse.json({ error: 'Missing userId or planId in metadata' }, { status: 400 });
      }

      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('price, duration')
        .eq('id', planId)
        .single();

      if (planError || !planData) {
        console.error('Error fetching plan:', planError);
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          plan_id: planId,
          amount: planData.price,
          status: 'completed',
          description: `Payment for plan ${planId}`,
          stripe_payment_id: session.payment_intent as string,
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error storing transaction:', transactionError);
        return NextResponse.json({ error: 'Failed to store transaction' }, { status: 500 });
      }

      const startDate = new Date();
      const endDate = new Date(startDate);
      const duration = planData.duration.toLowerCase(); 

      if (duration.includes('month')) {
        endDate.setMonth(startDate.getMonth() + 1);
      } else if (duration.includes('year')) {
        endDate.setFullYear(startDate.getFullYear() + 1);
      } else {
        endDate.setDate(startDate.getDate() + 30); 
      }

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          plan_id: planId,
          facility_id: facilityId || null, 
          miner_id: minerId || null, 
          btc_address: btcAddress || 'default_btc_address', 
          stripe_payment_id: session.payment_intent as string,
          transaction_id: transactionData.id,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      if (orderError) {
        console.error('Error creating order:', orderError);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}