import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isClientOrAdminRoute = createRouteMatcher(["/admdashboard(.*)", "/api/adm(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, getToken } = await auth();
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  let role = "regular";
  try {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", userId) // Updated to user_id
      .single();

    if (error) {
      if (error.code === "PGRST116") { // No rows found
        console.log(`User ${userId} not found in Supabase, defaulting to 'regular' role.`);
      } else {
        console.error("Error fetching role from Supabase:", error.message);
      }
    } else if (data) {
      role = data.role.toLowerCase();
    }
  } catch (err) {
    console.error("Unexpected error fetching role:", err);
  }

  console.log("Debug - Fetched role from Supabase:", role);

  if (isAdminRoute(req)) {
    if (role !== "admin") {
      console.log("Debug - Unauthorized admin access attempt, redirecting to /dashboard. Role:", role);
      if (pathname.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else if (isClientOrAdminRoute(req)) {
    if (role !== "client" && role !== "admin") {
      console.log("Debug - Unauthorized client/admin access attempt, redirecting to /dashboard. Role:", role);
      if (pathname.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else if (isDashboardRoute(req)) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    } else if (role === "client") {
      return NextResponse.redirect(new URL("/admdashboard", req.url));
    }
  }

  const token = await getToken();
  const requestHeaders = new Headers(req.headers);
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};