import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerSupabaseClient();
  try {
    console.log("[Facilities API] Fetching facilities...");
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Facilities API] Error fetching facilities:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch facilities", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[Facilities API] Error:", error.message);
      return NextResponse.json(
        { error: "Internal Server Error", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error", details: "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  try {
    const facilityData = await req.json();
    const { data, error } = await supabase
      .from("transactions")
      .insert(facilityData)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Invalid request data or server error", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Invalid request data or server error" },
      { status: 400 }
    );
  }
}