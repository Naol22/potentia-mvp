
'use server'

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const client = createServerSupabaseClient();
  try {
    console.log("[Users API] Fetching users from Supabase...");
    const { data, error } = await client
      .from("users")
      .select("id, user_id, first_name, last_name, full_name, email, stripe_customer_id, btc_address, created_at")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[Users API] Error fetching users:", { message: error.message, details: error.details, code: error.code });
      throw new Error("Failed to fetch users");
    }
    console.log("[Users API] Successfully fetched users:", data);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[Users API] Error fetching users:", { message: error.message, stack: error.stack });
      return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error", details: "Unknown error" }, { status: 500 });
  }
}