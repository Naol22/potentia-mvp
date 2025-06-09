"use server";

import { NextResponse } from "next/server";
import { createClientSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const client = createClientSupabaseClient();

  try {
    console.log("[Transactions API] Fetching active Transactions...");
    const { data: transactions, error } = await client
      .from("transactions")
      .select("*");

    if (error) {
      console.error("[Transactions API] Error fetching Transactions:", {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw new Error("Failed to fetch Transactions");
    }
    console.log("[Transactions API] Successfully fetched Transactions:", {
      count: transactions.length,
    });
    return NextResponse.json(transactions);
  } catch (error: unknown) {
    console.error("[Transactions API] Error:", {
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
