import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string;
    last_name?: string;
  };
}

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  const payload = await request.text();
  const headers = {
    'svix-id': request.headers.get('svix-id') || '',
    'svix-timestamp': request.headers.get('svix-timestamp') || '',
    'svix-signature': request.headers.get('svix-signature') || '',
  };

  const webhook = new Webhook(webhookSecret);

  let event: ClerkWebhookEvent;
  try {
    event = webhook.verify(payload, headers) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const { type, data } = event;

  switch (type) {
    case 'user.created':
    case 'user.updated':
      const { id: clerk_user_id, email_addresses, first_name, last_name } = data;
      const email = email_addresses?.[0]?.email_address || null;

      const { error } = await supabase
        .from('users')
        .upsert(
          {
            clerk_user_id,
            first_name: first_name || null,
            last_name: last_name || null,
            email,
          },
          { onConflict: 'clerk_user_id' }
        );

      if (error) {
        console.error('Error syncing user with Supabase:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      break;

    case 'user.deleted':
      const { id: deletedUserId } = data;

      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('clerk_user_id', deletedUserId);

      if (deleteError) {
        console.error('Error deleting user from Supabase:', deleteError.message);
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
      break;

    default:
      return NextResponse.json({ message: 'Event type not handled' }, { status: 200 });
  }

  return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
}