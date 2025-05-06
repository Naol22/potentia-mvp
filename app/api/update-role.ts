import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const clerkApiKey = process.env.CLERK_SECRET_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const clerk = new clerkClient({ apiKey: clerkApiKey });

export async function POST(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const supabaseWithToken = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  const { data: user, error: userError } = await supabaseWithToken
    .from("users")
    .select("role")
    .eq("clerk_user_id", (await supabaseWithToken.auth.getUser()).data.user?.id)
    .single();

  if (userError || user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, role } = await req.json();
  if (!userId || !["admin", "client", "regular"].includes(role)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { error: supabaseError } = await supabaseWithToken
    .from("users")
    .update({ role })
    .eq("clerk_user_id", userId);

  if (supabaseError) {
    return NextResponse.json({ error: supabaseError.message }, { status: 500 });
  }

  await clerk.users.updateUser(userId, {
    publicMetadata: { role },
  });

  return NextResponse.json({ success: true });
}