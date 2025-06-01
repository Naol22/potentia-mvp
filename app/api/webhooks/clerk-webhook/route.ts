import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServerSupabaseClient } from "@/lib/supabase";
import { clerkClient } from "@clerk/clerk-sdk-node";

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

if (
  !webhookSecret ||
  !supabaseUrl ||
  !supabaseServiceRoleKey ||
  !potentiaOrgId
) {
  throw new Error("Missing required environment variables");
}

const client = createServerSupabaseClient();

const handler = async (req: Request) => {
  const payloadString = await req.text();
  const headers = req.headers;
  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  console.log("[Webhook] Received request with payload:", payloadString);
  console.log("[Webhook] Headers:", {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  });

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("[Webhook] Missing Svix headers");
    return new Response("Error: Missing Svix headers", { status: 400 });
  }



  // Decode the token to inspect its claims


  const wh = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    console.log("[Webhook] Verifying webhook signature...");
    event = wh.verify(payloadString, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
    console.log("[Webhook] Webhook signature verified successfully");
  } catch (err: unknown) {
    console.error("[Webhook] Webhook verification failed:", err);
    return new Response("Error: Webhook verification failed", { status: 400 });
  }

  const eventType = event.type;
  console.log("[Webhook] Processing event type:", eventType);

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = event.data;
    console.log("[Webhook] User created event data:", {
      id,
      email_addresses,
      first_name,
      last_name,
    });

    //I'll fiish this later Clerk SDK be updating every hours its crazy
    // // try {
    //   console.log("[Webhook] Attempting to add user to org:potentia using Clerk SDK...");
    //   await clerkClient.organizations.createOrganizationMembership({
    //     organizationId: potentiaOrgId,
    //     userId: id,
    //     role: "member",
    //   });
    //   console.log(`[Webhook] Successfully added user ${id} to org:potentia as member`);
    // } catch {
    //   console.error("[Webhook] Error adding user to org:potentia:", {
    //     message: Error.toString,
    //     stack: Error.toString,
    //   });
    //   return new Response("Error: Failed to add user to org", { status: 500 });
    // }

    const upsertData = {
      user_id: id,
      email: email_addresses[0].email_address,
      first_name,
      last_name,
      full_name: `${first_name || ""} ${last_name || ""}`.trim() || null,
      org_id: potentiaOrgId,
      crypto_address: null,
    };
    console.log(
      "[Webhook] Preparing to upsert user data to Supabase:",
      upsertData
    );

    try {
      console.log("[Webhook] Performing upsert operation on users table...");
      const { error, data, status } = await client
        .from("users")
        .upsert(upsertData, { onConflict: "user_id" });
      if (error) {
        throw error;
      }
      console.log(
        `[Webhook] Successfully synced user ${id} to Supabase users table`
      );
      console.log(`[Webhook] Upsert response status: ${status}, data:`, data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error syncing user ${id} to Supabase:`, error.message);
        return NextResponse.json(
          { error: "Failed to sync user", message: error.message },
          { status: 500 }
        );
      } else {
        console.error(`Unknown error syncing user ${id} to Supabase:`, error);
        return NextResponse.json(
          { error: "Unknown error", message: String(error) },
          { status: 500 }
        );
      }
    }
  } else {
    console.log("[Webhook] Ignoring non-user.created event:", eventType);
  }

  console.log("[Webhook] Webhook processing completed");
  return new Response("", { status: 200 }); 
};

export async function POST(req: Request) {
  console.log("[Webhook] Handling POST request...");
  return handler(req);
}

export async function OPTIONS() {
  console.log("[Webhook] Handling OPTIONS request...");
  return new Response("", { status: 200, headers: { Allow: "POST" } });
}
