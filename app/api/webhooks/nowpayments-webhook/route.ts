import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_SECRET_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';
const NOWPAYMENTS_AUTH_TOKEN = process.env.NOWPAYMENTS_AUTH_TOKEN; // You must set this in your env

export async function POST(request: Request) {
  try {
    const { payment_id, email, subscription_plan_id } = await request.json();
    if (!payment_id || !email || !subscription_plan_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check payment status
    const paymentStatusRes = await axios.get(
      `${NOWPAYMENTS_API_URL}/payment/${payment_id}`,
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY!,
        },
      }
    );
    const paymentStatus = paymentStatusRes.data;

    if (paymentStatus.payment_status === 'finished' || paymentStatus.payment_status === 'confirmed') {
      // 2. Update transaction in Supabase
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'successful' })
        .eq('payment_method_id', payment_id)
        .eq('status', 'pending');
      if (updateError) {
        return NextResponse.json({ error: 'Failed to update transaction', details: updateError.message }, { status: 500 });
      }

      // 3. Create email subscription in NowPayments
      const subscriptionRes = await axios.post(
        `${NOWPAYMENTS_API_URL}/subscriptions`,
        {
          subscription_plan_id,
          email,
        },
        {
          headers: {
            'Authorization': `Bearer ${NOWPAYMENTS_AUTH_TOKEN}`,
            'x-api-key': NOWPAYMENTS_API_KEY!,
            'Content-Type': 'application/json',
          },
        }
      );
      const subscriptionData = subscriptionRes.data;

      return NextResponse.json({ success: true, subscription: subscriptionData });
    } else {
      return NextResponse.json({ status: paymentStatus.payment_status, message: 'Payment not successful yet' }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error in NowPayments webhook:', error?.response?.data || error.message);
    return NextResponse.json({ error: 'Internal server error', details: error?.response?.data || error.message }, { status: 500 });
  }
} 