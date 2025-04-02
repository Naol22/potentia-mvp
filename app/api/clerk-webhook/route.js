// app/api/clerk-webhook/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
  const { data } = await req.json();
  if (data.type === "user.created") {
    const { id: clerkUserId, email_addresses } = data.data;
    const email = email_addresses[0].email_address;

    await supabase.from("users").upsert({
      clerk_user_id: clerkUserId,
      email,
    });
  }
  return NextResponse.json({ received: true });
}