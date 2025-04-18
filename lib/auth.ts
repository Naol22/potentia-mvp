import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function getSupabaseClientWithAuth() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Simulate a custom sign-in with Clerk userId
  const { data: { session }, error } = await supabase.auth.signInWithIdToken({
    provider: 'custom',
    token: userId, // Use Clerk userId as the token
    nonce: userId, // Nonce can be the same as userId for simplicity
  });

  if (error || !session) {
    throw new Error('Failed to generate Supabase session: ' + (error?.message || 'No session'));
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  });
}
