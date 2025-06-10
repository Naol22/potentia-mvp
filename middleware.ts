import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define custom session claims type
interface CustomSessionClaims {
  o?: {
    rol?: 'admin' | 'member' | string; // Adjust roles as needed
  };
  metadata?: {
    role?: 'admin' | 'member' | string; // Alternative location for role
  };
}

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/learn',
  '/resources',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/admdasboard(.*)']);
const isUserDashboardRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();
  const debug = process.env.NODE_ENV === 'development';

  if (debug) {
    console.log(`[Middleware] Request URL: ${req.url}`);
    console.log(`[Middleware] User ID: ${userId || 'Not authenticated'}`);
    console.log(`[Middleware] Session Claims: ${JSON.stringify(sessionClaims, null, 2)}`);
  }

  if (isAdminRoute(req)) {
    if (debug) console.log('[Middleware] Accessing admin route...');
    const claims = sessionClaims as CustomSessionClaims | undefined;
    const role = claims?.o?.rol;
    const hasAdminAccess = role === 'admin';
    if (debug) console.log(`[Middleware] Admin role check: ${hasAdminAccess} (Role: ${role ?? 'none'})`);

    if (!hasAdminAccess) {
      if (debug) console.log('[Middleware] Redirecting to /unauthorized due to insufficient permissions');
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    return NextResponse.next();
  }

  if (isUserDashboardRoute(req)) {
    if (debug) console.log('[Middleware] Accessing user dashboard route...');
    await auth.protect();
    return NextResponse.next();
  }

  if (!isPublicRoute(req)) {
    if (debug) console.log('[Middleware] Protecting non-public route...');
    await auth.protect();
    return NextResponse.next();
  }

  if (debug) console.log('[Middleware] Allowing public route...');
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|ttf|woff|woff2|csv|docx|xlsx|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};