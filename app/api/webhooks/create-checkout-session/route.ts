import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supaBaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const { userId, planId, btcAddress, facilityId, minerId } = await request.json();

    if (!userId || !planId || !btcAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('price, type')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.type} Plan`,
            },
            unit_amount: Math.round(plan.price * 100), 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        userId,
        planId,
        btcAddress,
        facilityId: facilityId || '',
        minerId: minerId || '',
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}