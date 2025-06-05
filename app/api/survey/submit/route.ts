import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    supabaseUrl,
    supabaseAnonKey,
  });
  throw new Error('Supabase URL and Anon Key must be configured in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Validate required fields
    if (
      typeof body.satisfaction !== 'number' ||
      body.satisfaction < 1 ||
      body.satisfaction > 5
    ) {
      console.error('Validation failed: Invalid satisfaction', body.satisfaction);
      return NextResponse.json({ error: 'Satisfaction must be a number between 1 and 5' }, { status: 400 });
    }
    if (typeof body.completed !== 'boolean') {
      console.error('Validation failed: completed must be boolean', body.completed);
      return NextResponse.json({ error: 'Completed must be a boolean' }, { status: 400 });
    }
    if (
      body.nps !== undefined &&
      (typeof body.nps !== 'number' || body.nps < 0 || body.nps > 10)
    ) {
      console.error('Validation failed: Invalid NPS', body.nps);
      return NextResponse.json({ error: 'NPS must be a number between 0 and 10' }, { status: 400 });
    }

    const metadata = {
      submitted_at: new Date().toISOString(),
      user_agent: req.headers.get('user-agent') || null,
    };

    const insertData = {
      satisfaction: body.satisfaction,
      completed: body.completed,
      issue: body.issue || null,
      suggestion: body.suggestion || null,
      nps: body.nps ?? null,
      metadata,
    };
    console.log('Inserting survey response:', insertData);

    const { data, error } = await supabase
      .from('survey_responses')
      .insert([insertData])
      .select('id, created_at')
      .single();

    if (error || !data) {
      console.error('Supabase insert error:', {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      });
      return NextResponse.json({ error: error?.message || 'Unknown Supabase error' }, { status: 500 });
    }

    console.log('Survey response inserted:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error inserting survey response:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}