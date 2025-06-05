"use server";

import { NextResponse } from "next/server";
import { createClientSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const client = createClientSupabaseClient();

  try {
    console.log("[Payment Methods API] Fetching active payment methods...");
    const { data: paymentMethods, error } = await client
      .from("payment_methods")
      .select("id, name, provider, is_active")
      .eq("is_active", true);

    if (error) {
      console.error("[Payment Methods API] Error fetching payment methods:", {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw new Error("Failed to fetch payment methods");
    }

    console.log("[Payment Methods API] Successfully fetched payment methods:", {
      count: paymentMethods.length,
    });
    return NextResponse.json(paymentMethods);
  } catch (error: unknown) {
    console.error("[Payment Methods API] Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
