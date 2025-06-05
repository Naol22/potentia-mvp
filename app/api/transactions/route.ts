import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

const supabase = createServerSupabaseClient();

export async function GET(request: Request) {
  // Get the current user (Clerk)
  const {userId} = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch transactions for the current user
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ transactions: data });
}
