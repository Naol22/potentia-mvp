import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClientSupabaseClient } from '@/lib/supabase';

const supabase = createClientSupabaseClient();

interface SurveyResponseBody {
  satisfaction: number;
  completed: boolean;
  issue?: string;
  suggestion?: string;
  nps?: number;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: SurveyResponseBody;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Invalid JSON:', error);
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }

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
    if (body.issue && (typeof body.issue !== 'string' || body.issue.length > 1000)) {
      return NextResponse.json({ error: 'Issue must be a string under 1000 characters' }, { status: 400 });
    }
    if (body.suggestion && (typeof body.suggestion !== 'string' || body.suggestion.length > 1000)) {
      return NextResponse.json({ error: 'Suggestion must be a string under 1000 characters' }, { status: 400 });
    }

    const metadata = {
      submitted_at: new Date().toISOString(),
      user_agent: req.headers.get('user-agent')?.slice(0, 255) || null,
      user_id: userId, // Fixed typo from személyes_id to user_id
    };

    const insertData = {
      user_id: userId,
      satisfaction: body.satisfaction,
      completed: body.completed,
      issue: body.issue || null,
      suggestion: body.suggestion || null,
      nps: body.nps ?? null,
      metadata,
    };

    console.log('Inserting survey response:', {
      satisfaction: insertData.satisfaction,
      completed: insertData.completed,
      nps: insertData.nps,
      metadata,
    });

    const { data, error } = await supabase
      .from('survey_responses')
      .insert([insertData])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase insert error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ error: error.message || 'Unknown Supabase error' }, { status: 500 });
    }

    console.log('Survey response inserted:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error inserting survey response:', error);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}