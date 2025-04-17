import { NextResponse } from "next/server";
import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// This function will be executed for each request
export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = getAuth(req);
  const path = req.nextUrl.pathname;
  
  // Allow public routes
  const publicPaths = ["/", "/api/webhook"];
  if (publicPaths.some(pp => path === pp || path.startsWith(pp + "/"))) {
    return NextResponse.next();
  }
  
  // Check if trying to access admin routes
  if (path.startsWith("/admin")) {
    // Redirect to sign-in if not authenticated
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user has admin role in Clerk
    // Access the role safely with type assertion
    const userRole = sessionClaims && (sessionClaims as any).role;
    const isAdmin = userRole === "admin";
    
    // Redirect to home if not admin
    if (!isAdmin) {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};