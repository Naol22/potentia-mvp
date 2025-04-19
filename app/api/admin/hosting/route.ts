import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/utils/supaBaseClient";

// Check if user is admin using Clerk
async function isAdmin(userId: string | null) {
  if (!userId) return false;
  
  // Get the user's session claims from Clerk
  const { sessionClaims } = await auth();
  
  // Check if the user has admin role in Clerk
  const userRole = sessionClaims && (sessionClaims as any).role;
  return userRole === "admin";
}

// Get all hosting plans
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  
  if (!await isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { data, error } = await supabase
    .from('hosting')
    .select(`
      *,
      miners (id, name),
      facilities (id, name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// Create a new hosting plan
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!await isAdmin(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const hostingData = await req.json();
    
    const { data, error } = await supabase
      .from('hosting')
      .insert(hostingData)
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