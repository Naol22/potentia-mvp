import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supaBaseClient";

interface SessionClaims {
  role?: string;
  [key: string]: unknown;
}

async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const { sessionClaims } = await auth();
  const userRole = sessionClaims ? (sessionClaims as SessionClaims).role : undefined;
  return userRole === "admin";
}

export async function GET(): Promise<NextResponse> {
  const { userId } = await auth();
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("miners")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const minerData = await req.json();
    const { data, error } = await supabase
      .from("miners")
      .insert(minerData)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}