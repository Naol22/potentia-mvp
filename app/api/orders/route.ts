import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      plan_id,
      facility_id,
      miner_id,
      btc_address,
      stripe_payment_id,
      status = 'pending',
    } = body;

    if (!plan_id || !btc_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: fetchedUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    let user = fetchedUser;

    if (userError || !user) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ clerk_user_id: userId })
        .select('id')
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      user = newUser;
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        plan_id,
        facility_id: facility_id || null,
        miner_id: miner_id || null,
        btc_address,
        stripe_payment_id: stripe_payment_id || null,
        status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/orders:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
