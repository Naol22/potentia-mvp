import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define a type for session claims with public_metadata
interface ClerkSessionClaims {
  public_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Define route matchers
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);
const isClientOrAdminRoute = createRouteMatcher(["/admdashboard(.*)", "/api/adm(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, getToken } = await auth();
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Safely extract role from sessionClaims with fallback
  const role = (sessionClaims as ClerkSessionClaims)?.public_metadata?.role || "regular";

  // Handle role-based access
  if (isAdminRoute(req)) {
    if (role !== "admin") {
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

  // Pass the token to API routes
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