import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher, getAuth } from "@clerk/nextjs/server";

// Define type for sessionClaims
interface SessionClaims {
  role?: string;
  [key: string]: unknown;
}

const isProtectedRoute = createRouteMatcher(["/product(.*)", "/details(.*)", "/cart(.*)", "/checkout(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  console.log("Middleware triggered for:", req.nextUrl.pathname);
  const { userId, sessionClaims } = getAuth(req);
  console.log("User ID:", userId, "Session Claims:", sessionClaims);
  const path = req.nextUrl.pathname;

  // Allow public routes
  const publicPaths = ["/", "/api/webhook"];
  if (publicPaths.some((pp) => path === pp || path.startsWith(pp + "/"))) {
    return NextResponse.next();
  }

  // Check if trying to access admin routes
  if (path.startsWith("/admin")) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }

    const userRole = sessionClaims && (sessionClaims as SessionClaims).role;
    const isAdmin = userRole === "admin";

    if (!isAdmin) {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // Protect specified routes
  if (isProtectedRoute(req)) {
    console.log("Protecting route:", path);
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // Match all routes except _next and static files
    "/(api|trpc)(.*)", // Match API and TRPC routes
  ],
};