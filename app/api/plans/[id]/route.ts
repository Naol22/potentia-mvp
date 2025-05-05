import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  currency: string;
  duration: string;
  miner_id: string | null;
  facility_id: string | null;
  stripe_price_id: string | null;
  nowpayments_item_code: string | null;
  is_subscription: boolean;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: 'Invalid plan ID format' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('id, type, hashrate, price, currency, duration, miner_id, facility_id, stripe_price_id, nowpayments_item_code, is_subscription')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching plan:', error?.message || 'No data found');
      return NextResponse.json({ error: 'Plan not found', details: error?.message }, { status: 404 });
    }

    const plan: Plan = data;
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Unexpected error fetching plan:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
