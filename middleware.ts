import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)", // Protect all admin routes
]);

export default clerkMiddleware((auth, req) => {
  // Protect routes
  if (isProtectedRoute(req)) {
    auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};