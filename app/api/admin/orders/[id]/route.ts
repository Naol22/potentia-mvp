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

export async function GET(
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      users (id, clerk_user_id),
      plans (id, type, hashrate, price, duration),
      facilities (id, name),
      miners (id, name)
    `)
    .eq("id", params.id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const orderData = await req.json();
    const { data, error } = await supabase
      .from("orders")
      .update(orderData)
      .eq("id", params.id)
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

export async function DELETE(
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { userId } = await auth();
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}