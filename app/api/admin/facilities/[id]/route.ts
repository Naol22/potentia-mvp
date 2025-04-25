import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supaBaseClient";
import { getAuth } from "@clerk/nextjs/server";

interface Facility {
  id: string;
  name: string;
  location: string;
  capacity: number;
  electricity_cost: number;
  created_at: string;
}

async function isAdmin(userId: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return user?.is_admin ?? false;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdminUser = await isAdmin(userId);
  if (!isAdminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("facilities")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }

  return NextResponse.json(data as Facility);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdminUser = await isAdmin(userId);
  if (!isAdminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { data, error } = await supabase
    .from("facilities")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Facility not found" }, { status: 404 });
  }

  return NextResponse.json(data as Facility);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdminUser = await isAdmin(userId);
  if (!isAdminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("facilities")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Facility deleted successfully" });
}