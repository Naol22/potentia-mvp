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

// Get a specific plan
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
    const { userId } = await auth();
  
  if (!await isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// Update a plan
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
    const { userId } = await auth();
  
  if (!await isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const planData = await req.json();
    
    const { data, error } = await supabase
      .from('plans')
      .update(planData)
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

// Delete a plan
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
    const { userId } = await auth();
  
  if (!await isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Check if plan is being used by any orders
  const { data: orderData, error: checkError } = await supabase
    .from('orders')
    .select('id')
    .eq('plan_id', params.id)
    .limit(1);
  
  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }
  
  if (orderData && orderData.length > 0) {
    return NextResponse.json({ 
      error: "Cannot delete plan that is in use by orders" 
    }, { status: 400 });
  }
  
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', params.id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}