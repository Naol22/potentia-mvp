import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/product(.*)",
  "/details(.*)",
  "/cart(.*)",
  "/checkout(.*)",
]);

export default clerkMiddleware(async (authFn, req: NextRequest) => {
  const { userId, orgRole } = await authFn();
  const path = req.nextUrl.pathname;

  const publicPaths = ["/", "/api/webhooks"];
  if (publicPaths.some((pp) => path === pp || path.startsWith(pp + "/"))) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Check both admin UI routes and admin API routes
  if (path.startsWith("/admin") || path.startsWith("/admdashboard") || path.startsWith("/api/admin") || path.startsWith("/api/adm")) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const isOrgAdmin = orgRole === "org:admin";
    console.log("Organization role check:", {
      userId,
      path,
      orgRole,
      isOrgAdmin
    });

    if (!isOrgAdmin) {
      // For API routes, return 401 instead of redirecting
      if (path.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    console.log("Admin access granted for path:", path);
    return NextResponse.next();
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
    "/adm(.*)",
    "/api/adm(.*)",
    "/api/admin(.*)",
    "/admdashboard(.*)",
  ],
};
