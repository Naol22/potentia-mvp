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

export async function GET() {
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
      .eq("type", "hashrate")
      .order("hashrate", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch plans", details: error.message },
        { status: 500 }
      );
    }

    const plans: Plan[] = data;
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Unexpected error fetching plans:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}