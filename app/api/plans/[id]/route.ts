import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } 
) {
  const { id } = await context.params;

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*, facility_id (name), miner_id (name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching plan:', error);
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error fetching plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}