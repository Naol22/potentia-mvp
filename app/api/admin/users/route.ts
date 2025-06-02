import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";


export async function GET() {
  const supabase = createServerSupabaseClient();
  try {
    console.log("[Users API] Fetching users...");
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, crypto_address")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Users API] Error fetching users:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch users", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[Users API] Error:", error.message);
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
    const userData = await req.json();
    const { data, error } = await supabase
      .from("users")
      .insert({
        full_name: userData.full_name,
        email: userData.email,
        crypto_address: userData.crypto_address,
      })
      .select("id, full_name, email, crypto_address")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Invalid request data or server error" },
      { status: 400 }
    );
  }
}