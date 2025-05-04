import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseKey: !!supabaseKey,
  });
  throw new Error('Supabase URL and Service Role Key must be configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define the expected shape of the survey response data
interface SurveyResponse {
  satisfaction: number;
  completed: boolean;
  issue?: string;
  suggestion?: string;
  nps?: number;
}

// POST /api/survey/submit
export async function POST(request: NextRequest) {
  try {
    console.log('Received POST /api/survey/submit');
    console.log('Supabase config:', {
      url: supabaseUrl,
      key: supabaseKey ? '[REDACTED]' : undefined,
    });

    // Get Clerk auth data
    const authData = await auth();
    const { userId } = authData;
    console.log('Clerk auth:', { userId });

    // Parse request body
    let body: SurveyResponse;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (error) {
      console.error('Invalid JSON body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.satisfaction || typeof body.completed !== 'boolean') {
      console.error('Validation failed: Missing required fields', body);
      return NextResponse.json(
        { error: 'Satisfaction and completed are required' },
        { status: 400 }
      );
    }

    // Validate satisfaction (1-5)
    if (body.satisfaction < 1 || body.satisfaction > 5) {
      console.error('Validation failed: Invalid satisfaction', body.satisfaction);
      return NextResponse.json(
        { error: 'Satisfaction must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate NPS (0-10, optional)
    if (body.nps !== undefined && (body.nps < 0 || body.nps > 10)) {
      console.error('Validation failed: Invalid NPS', body.nps);
      return NextResponse.json(
        { error: 'NPS must be between 0 and 10' },
        { status: 400 }
      );
    }

    // Prepare metadata
    const metadata = {
      submitted_at: new Date().toISOString(),
      user_agent: request.headers.get('user-agent') || null,
    };

    // Generate anonymous_user_id if not authenticated
    const anonymousUserId = userId ? null : crypto.randomUUID();

    // Prepare insert data
    const insertData = {
      user_id: userId || null,
      anonymous_user_id: anonymousUserId,
      satisfaction: body.satisfaction,
      completed: body.completed,
      issue: body.issue || null,
      suggestion: body.suggestion || null,
      nps: body.nps || null,
      metadata,
    };
    console.log('Inserting into Supabase:', insertData);

    // Insert into Supabase
    const { data, error } = await supabase
      .from('survey_responses')
      .insert(insertData)
      .select('id, created_at')
      .single();

    if (error || !data) {
      console.error('Supabase insert error:', {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      });
      return NextResponse.json(
        {
          error: 'Failed to save survey response',
          details: error?.message || 'Unknown Supabase error',
        },
        { status: 500 }
      );
    }

    console.log('Success:', data);
    return NextResponse.json(
      {
        message: 'Survey response submitted successfully',
        id: data.id,
        created_at: data.created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in /api/survey/submit:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}