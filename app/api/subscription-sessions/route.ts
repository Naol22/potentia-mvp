import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    console.log("[Subscription Sessions API] Fetching subscription session...");
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      console.error("[Subscription Sessions API] Invalid session_id:", {
        message: "session_id is required",
        code: "INVALID_SESSION_ID",
      });
      return NextResponse.json(
        { error: "Invalid session_id", details: "session_id query parameter is required" },
        { status: 400 }
      );
    }

    const client = createServerSupabaseClient();
    const { data, error } = await client
      .from("subscription_sessions")
      .select("metadata")
      .eq("session_id", sessionId)
      .single();

    console.log("[Subscription Sessions API] Supabase response:", { data, error }); // Debug log

    if (error || !data) {
      console.error("[Subscription Sessions API] Error fetching subscription session:", {
        message: error?.message || "Session not found",
        details: error?.details,
        code: "SESSION_FETCH_FAILED",
      });
      return NextResponse.json(
        { error: "Session not found", details: error?.message || "No subscription session found for the given session_id" },
        { status: 404 }
      );
    }

    console.log("[Subscription Sessions API] Successfully fetched subscription session:", {
      session_id: sessionId,
      metadata: data.metadata,
    });
    return NextResponse.json({ data: [data] }, { status: 200 });
  } catch (error: unknown) {
    console.error("[Subscription Sessions API] Error processing request:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}