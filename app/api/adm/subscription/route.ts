'use server'

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const client = createServerSupabaseClient();
  try {
    console.log("[Subscriptions API] Fetching subscriptions from Supabase...");
    const { data, error } = await client
      .from("subscriptions")
      .select("id,user_id,plan_type,plan_id,status,created_at,payment_method_id,provider_subscription_id,cancel_at_period_end")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[Subscriptions API] Error fetching subscriptions:", { message: error.message, details: error.details, code: error.code });
      throw new Error("Failed to fetch subscriptions");
    }
    console.log("[Subscriptions API] Successfully fetched subscriptions:", data);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[Subscriptions API] Error fetching subscriptions:", { message: error.message, stack: error.stack });
      return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error", details: "Unknown Error" }, { status: 500 });
  }
}