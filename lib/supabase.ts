import { createClient } from "@supabase/supabase-js";

export function createClerkSupabaseClient(token?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const headers = new Headers(options.headers || {});
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}