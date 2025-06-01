'use server'

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { HashratePlan } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = createServerSupabaseClient();
  const { id } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid plan ID format" }, { status: 400 });
  }

  try {
    const { data, error} = await client
      .from("hashrate_plans")
      .select(
        "id,hashrate, price, currency, duration, stripe_price_id, nowpayments_item_id, is_subscription, created_at"
      )
      .eq("id", id)
      .single();

      if (error) {
        console.error("[Hashrate Plans API] Error fetching hashrate plans:", {
          message: error.message,
          details: error.details,
          code: error.code,
        });
        throw new Error("Failed to fetch hashrate plans");
      }
  
      const hashrate_plans: HashratePlan = data;
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