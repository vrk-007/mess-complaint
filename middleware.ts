import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware handles route protection at the Edge.
// We use database sessions, so we check for the session cookie directly
// instead of trying to decode a JWT (which would cause JWEInvalid errors).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isLoginPage = pathname === "/login";
  const isOnboardingPage = pathname === "/onboarding";

  // Always allow auth API routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Check for session cookie (Auth.js database session cookie)
  const sessionCookie =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!sessionCookie;

  // Redirect logged-in users away from the login page to home
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to login (except login and onboarding)
  if (!isLoggedIn && !isLoginPage && !isOnboardingPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
