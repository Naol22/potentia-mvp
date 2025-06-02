
'use server'

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const client = createServerSupabaseClient();
  try {
    console.log("[Survey Responses API] Fetching survey responses from Supabase...");
    const { data, error } = await client
      .from("survey_responses")
      .select("id, user_id, anonymous_user_id, satisfaction, completed, issue, suggestion, nps, metadata, created_at")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[Survey Responses API] Error fetching survey responses:", { message: error.message, details: error.details, code: error.code });
      throw new Error("Failed to fetch survey responses");
    }
    console.log("[Survey Responses API] Successfully fetched survey responses:", data);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[Survey Responses API] Error fetching survey responses:", { message: error.message, stack: error.stack });
      return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error", details: "Unknown error" }, { status: 500 });
  }
}