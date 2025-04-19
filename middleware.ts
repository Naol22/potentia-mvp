import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface CustomSessionClaims {
  role?: string;
  metadata?: {
    role?: string;
  };
}

const isProtectedRoute = createRouteMatcher([
  "/product(.*)",
  "/details(.*)",
  "/cart(.*)",
  "/checkout(.*)",
]);

export default clerkMiddleware(async (authFn, req: NextRequest) => {
  const { userId, sessionClaims } = await authFn();
  const path = req.nextUrl.pathname;

  const publicPaths = ["/", "/api/webhook"];
  if (publicPaths.some((pp) => path === pp || path.startsWith(pp + "/"))) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (path.startsWith("/admin")) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const claims = sessionClaims as CustomSessionClaims;
    const userRole = claims?.metadata?.role ?? claims?.role;

    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", 
    "/",
    "/(api|trpc)(.*)",
    "/product(.*)",
    "/details(.*)",
    "/cart(.*)",
    "/checkout(.*)",
    "/admin(.*)",
  ],
};
