import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  context: { params: Promise<{ stripe_payment_id: string }> } 
) {
  const { stripe_payment_id } = await context.params; 

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, plan_id (hashrate, price, type, facility_id (name), miner_id (name))')
      .eq('stripe_payment_id', stripe_payment_id)
      .single();

    if (error || !data) {
      console.error('Error fetching order:', error);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error fetching order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}