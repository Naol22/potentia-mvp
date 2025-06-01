import { NextResponse } from 'next/server';
import { createClientSupabaseClient } from '@/lib/supabase';


export async function GET(
  request: Request,
  context: { params: Promise<{ stripe_payment_id: string }> } 
) {
  const client = createClientSupabaseClient();
  const { stripe_payment_id } = await context.params; 

  try {
    console.log("[Hashrate Plans API] Fetching hashrate plans from Supabase...");
    const { data, error } = await client
      .from('orders')
      .select('*, plan_ids (hashrate, price, type, facility_id (name), miner_id (name))')
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