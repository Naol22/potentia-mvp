import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

// Custom Hook to create a Supabase client with Clerk session token
export function useClerkSupabaseClient() {
  const { session } = useSession();

  const supabaseClient = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const token = await session?.getToken();
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
  }, [session]);

  return supabaseClient;
}