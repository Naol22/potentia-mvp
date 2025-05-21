import { NextResponse } from "next/server";
  import { Webhook } from "svix";
  import { createClient } from "@supabase/supabase-js";

  interface ClerkWebhookEvent {
    type: string;
    data: ClerkUserData;
  }

  interface ClerkUserData {
    id: string;
    email_addresses: { email_address: string }[];
    first_name?: string;
    last_name?: string;
    public_metadata?: {
      role?: string;
    };
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!webhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing required environment variables");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

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
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, public_metadata } = event.data;
      const role = public_metadata?.role || "regular"; // Default to 'regular' if not set
      const validRoles = ["regular", "admin", "client"];
      const sanitizedRole = validRoles.includes(role) ? role : "regular"; // Sanitize role

      console.log(`Processing ${eventType} for user ${id} with role ${sanitizedRole}`);

      const upsertData = {
        user_id: id,
        clerk_user_id: id, // Sync with user_id to avoid confusion
        email: email_addresses[0].email_address,
        first_name,
        last_name,
        role: sanitizedRole,
        crypto_address: null,
      };
      console.log("Upsert data:", upsertData); // Log the exact data

      const { error } = await supabase.from("users").upsert(
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

      console.log(`Successfully synced user ${id} to Supabase with role ${sanitizedRole}`);
    }

    return new Response("", { status: 200 });
  };

  export async function POST(req: Request) {
    return handler(req);
  }

  export async function OPTIONS() {
    return new Response("", { status: 200, headers: { Allow: "POST" } });
  }