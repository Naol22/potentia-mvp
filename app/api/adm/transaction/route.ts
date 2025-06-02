'use server'

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const client = createServerSupabaseClient();
  try {
    console.log("[Transactions API] Fetching transactions from Supabase...");
    const { data, error } = await client
      .from("transactions")
      .select("id, user_id, plan_id, subscription_id, amount, currency, status, description, payment_method_id, payment_provider_reference, metadata, created_at")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[Transactions API] Error fetching transactions:", { message: error.message, details: error.details, code: error.code });
      throw new Error("Failed to fetch transactions");
    }
    console.log("[Transactions API] Successfully fetched transactions:", data);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[Transactions API] Error fetching transactions:", { message: error.message, stack: error.stack });
      return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error", details: "Unknown error" }, { status: 500 });
  }
}