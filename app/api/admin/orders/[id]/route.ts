import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/utilis/supaBaseClient";

// Check if user is admin using Clerk
async function isAdmin(userId: string | null) {
  if (!userId) return false;
  
  // Get the user's session claims from Clerk
  const { sessionClaims } = await auth();
  
  // Check if the user has admin role in Clerk
  const userRole = sessionClaims && (sessionClaims as any).role;
  return userRole === "admin";
}

// Get a specific order
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!await isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      users (id, clerk_user_id),
      plans (id, type, hashrate, price, duration),
      facilities (id, name),
      miners (id, name)
    `)
    .eq('id', params.id)
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// Update an order
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!await isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const orderData = await req.json();
    
    const { data, error } = await supabase
      .from('orders')
      .update(orderData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}

// Delete an order
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!await isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', params.id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}