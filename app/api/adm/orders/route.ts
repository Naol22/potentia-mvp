
'use server'

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const client = createServerSupabaseClient();
  try {
    console.log("[Orders API] Fetching orders from Supabase...");
    const { data, error } = await client
      .from("orders")
      .select("id, user_id, plan_id, transaction_id, subscription_id, crypto_address, status, start_date, end_date, is_active, auto_renew, next_billing_date, created_at")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[Orders API] Error fetching orders:", { message: error.message, details: error.details, code: error.code });
      throw new Error("Failed to fetch orders");
    }
    console.log("[Orders API] Successfully fetched orders:", data);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[Orders API] Error fetching orders:", { message: error.message, stack: error.stack });
      return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error", details: "Unknown Error" }, { status: 500 });
  }
}