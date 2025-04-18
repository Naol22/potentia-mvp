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

// Get a specific user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!await isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// Update a user
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!await isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const userData = await req.json();
    
    // Only allow updating specific fields
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
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

// Delete a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  
  if (!await isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Prevent admins from deleting themselves
  if (params.id === userId) {
    return NextResponse.json({ 
      error: "You cannot delete your own account" 
    }, { status: 400 });
  }
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', params.id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}