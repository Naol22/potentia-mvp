import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase";

interface Plan {
  id: string;
  type: string;
  hashrate: number;
  price: number;
  currency: string;
  duration: string;
  miner_id: string | null;
  facility_id: string | null;
  stripe_price_id: string | null;
  nowpayments_item_code: string | null;
  is_subscription: boolean;
}

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid plan ID format" }, { status: 400 });
  }

  const authResult = await auth();
  const { getToken } = authResult;
  let token: string | undefined;

  try {
    const rawToken = await getToken();
    token = rawToken ?? undefined;
  } catch (error) {
    console.error("Error retrieving Clerk token:", error);
    return NextResponse.json(
      { error: "Unauthorized", details: "Failed to retrieve authentication token" },
      { status: 401 }
    );
  }

  const supabase = createClerkSupabaseClient(token);

  try {
    const { data, error } = await supabase
      .from("plans")
      .select(
        "id, type, hashrate, price, currency, duration, miner_id, facility_id, stripe_price_id, nowpayments_item_code, is_subscription"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Error fetching plan:", error?.message || "No data found");
      return NextResponse.json(
        { error: "Plan not found", details: error?.message },
        { status: 404 }
      );
    }

    const plan: Plan = data;
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Unexpected error fetching plan:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}