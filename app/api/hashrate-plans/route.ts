'use server'

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { HashratePlan } from "@/types"; 

export async function GET() {
  const client = createServerSupabaseClient();

  try {
    console.log("[Hashrate Plans API] Fetching hashrate plans from Supabase...");
    const { data, error } = await client
      .from("hashrate_plans")
      .select(
        "id, hashrate, price, currency, duration, stripe_price_id, nowpayments_item_id, is_subscription, created_at"
      )
      .order("hashrate", { ascending: true });

    if (error) {
      console.error("[Hashrate Plans API] Error fetching hashrate plans:", {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw new Error("Failed to fetch hashrate plans");
    }

    const hashrate_plans: HashratePlan[] = data;
    console.log("[Hashrate Plans API] Successfully fetched hashrate plans:", hashrate_plans);
    return NextResponse.json(hashrate_plans);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[Hashrate Plans API] Error fetching hashrate plans:", {
        message: error.message,
        stack: error.stack,
      });
      return NextResponse.json(
        {
          error: "Internal Server Error",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: "Unknown error",
      },
      { status: 500 }
    );
  }
}