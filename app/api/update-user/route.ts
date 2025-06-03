"use server";

import { NextResponse } from "next/server";
import { createClientSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

type UserUpdate = {
  userId: string;
  cryptoAddress: string;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const client = createClientSupabaseClient();

  try {
    console.log("[Update User API] Updating user crypto address in Supabase...");
    const { userId, cryptoAddress } = (await request.json()) as UserUpdate;

    if (!userId || !cryptoAddress) {
      console.error("[Update User API] Error updating user crypto address:", {
        message: "Missing userId or cryptoAddress",
        details: "Both userId and cryptoAddress are required fields",
        code: "MISSING_FIELDS",
      });
      throw new Error("Missing userId or cryptoAddress");
    }

    const { error } = await client
      .from("users")
      .update({ crypto_address: cryptoAddress })
      .eq("user_id", userId);

    if (error) {
      console.error("[Update User API] Error updating user crypto address:", {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw new Error("Failed to update user crypto address");
    }

    console.log("[Update User API] Successfully updated user crypto address:", {
      userId,
      cryptoAddress,
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[Update User API] Error updating user crypto address:", {
        message: error.message,
        stack: error.stack,
      });
      return NextResponse.json(
        {
          error: "Internal Server Error",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: "Unknown error",
      },
      { status: 500 }
    );
  }
}