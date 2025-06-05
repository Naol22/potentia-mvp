'use server'
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerSupabaseClient();
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id, user_id, plan_id, status, created_at, plan_type , transaction_id");
    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("Fetched orders:", data);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error in orders route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}