import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from("hosting")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  try {
    const hostingData = await req.json();
    const { data, error } = await supabase
      .from("hosting")
      .insert(hostingData)
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