import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    console.error("GET Error: Missing or invalid user ID");
    return NextResponse.json({ error: "Missing or invalid user ID" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, crypto_address")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`GET Error for user ID ${id}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }

    if (!data) {
      console.error(`GET Error: No user found for ID ${id}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`GET Unexpected Error for user ID ${id}:`, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    console.error("PUT Error: Missing or invalid user ID");
    return NextResponse.json({ error: "Missing or invalid user ID" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  try {
    const userData = await req.json();
    if (!userData.full_name && !userData.email && !userData.crypto_address) {
      console.error(`PUT Error for user ID ${id}: No valid fields provided for update`);
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        full_name: userData.full_name,
        email: userData.email,
        crypto_address: userData.crypto_address,
      })
      .eq("id", id)
      .select("id, full_name, email, crypto_address")
      .single();

    if (error) {
      console.error(`PUT Error for user ID ${id}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    if (!data) {
      console.error(`PUT Error: No user found for ID ${id}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`PUT Unexpected Error for user ID ${id}:`, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Invalid request data or server error" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    console.error("DELETE Error: Missing or invalid user ID");
    return NextResponse.json({ error: "Missing or invalid user ID" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`DELETE Error for user ID ${id}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`DELETE Unexpected Error for user ID ${id}:`, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}