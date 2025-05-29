import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServerSupabaseClient } from "@/lib/supabase";

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserData;
}
interface ClerkUserData {
  id: string;
  email_addresses: { email_address: string }[];
  first_name?: string;
  last_name?: string;
}

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const potentiaOrgId = process.env.POTENTIA_ORG_ID; // e.g., 'org_123abc' from Clerk
const clerkApiBaseUrl = process.env.CLERK_API_BASE_URL || "https://api.clerk.com/v1";

if (!webhookSecret || !supabaseUrl || !supabaseServiceRoleKey || !potentiaOrgId) {
  throw new Error("Missing required environment variables");
}

const client = createServerSupabaseClient()

const handler = async (req: Request) => {
  const payloadString = await req.text();
  const headers = req.headers;
  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  const wh = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(payloadString, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Error: Webhook verification failed", { status: 400 });
  }

  const eventType = event.type;
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = event.data;

    try {
      await fetch(`${clerkApiBaseUrl}/organizations/${potentiaOrgId}/memberships`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CLERK_API_KEY}`, // Add Clerk API key to env
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: id,
          role: "member",
        }),
      });
      console.log(`Added user ${id} to org:potentia as member`);
    } catch (error) {
      console.error("Error adding user to org:potentia:", error);
      return new Response("Error: Failed to add user to org", { status: 500 });
    }

    // Sync with Supabase
    const upsertData = {
      user_id: id,
      email: email_addresses[0].email_address,
      first_name,
      last_name,
      crypto_address: null,
    };
    console.log("Upsert data:", upsertData);

    const { error } = await client.from("users").upsert(
      upsertData,
      { onConflict: "user_id" }
    );

    if (error) {
      console.error(`Error syncing user ${id} to Supabase:`, error.message, error.details, error.code);
      return NextResponse.json(
        { error: "Failed to sync user", message: error.message, details: error.details, code: error.code },
        { status: 200 }
      );
    }

    console.log(`Successfully synced user ${id} to Supabase`);
  }

  return new Response("", { status: 200 });
};

export async function POST(req: Request) {
  return handler(req);
}

export async function OPTIONS() {
  return new Response("", { status: 200, headers: { Allow: "POST" } });
}
