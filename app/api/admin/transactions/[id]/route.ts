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
    .from("transactions")
    .select(`
      *,
      users (id, first_name, last_name, email),
      plans (id, type, hashrate, price, duration)
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
    const transactionData = await req.json();
    const { data, error } = await supabase
      .from("transactions")
      .update(transactionData)
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
  const { data: orderData, error: checkError } = await supabase
    .from("orders")
    .select("id")
    .eq("transaction_id", params.id)
    .limit(1);
  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }
  if (orderData && orderData.length > 0) {
    return NextResponse.json({ 
      error: "Cannot delete transaction that is linked to orders" 
    }, { status: 400 });
  }
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}