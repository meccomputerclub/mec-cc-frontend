import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken, CustomJWTPayload } from "./lib/jwt";

export async function middleware(req: NextRequest) {
  const invitationCookie = req.cookies.get("invitation_validated")?.value;
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  let payload: CustomJWTPayload | null = null;

  // --- Core JWT Validation ---
  if (token) {
    try {
      payload = await verifyAuthToken(token);
    } catch {
      // Treat any verification error as invalid token
      payload = null;
    }
  }

  // --- 1. Invitation-protected pages ---
  if (pathname.startsWith("/register/form")) {
    if (!invitationCookie) {
      return NextResponse.redirect(new URL("/register", req.url));
    }
  }

  // --- 2. Profile-protected pages ---
  if (pathname === "/profile") {
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        response.cookies.delete("auth_token");
        response.cookies.delete("role");
      }
      return response;
    }
  }

  // --- 3. Dashboard-protected pages (Executive Only) ---
  if (pathname.startsWith("/dashboard")) {
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
      const response = NextResponse.redirect(loginUrl);
      // Clear stale/invalid cookies
      if (token) {
        response.cookies.delete("auth_token");
        response.cookies.delete("role");
      }
      return response;
    }

    const roleCookie = req.cookies.get("role")?.value;
    const isExecutive =
      payload.role === "admin" ||
      payload.role === "moderator" ||
      payload.role === "executive" ||
      roleCookie === "admin" ||
      roleCookie === "moderator" ||
      roleCookie === "executive";

    if (!isExecutive) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  // --- 4. Blog write page ---
  if (pathname.startsWith("/blog/write")) {
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
      const response = NextResponse.redirect(loginUrl);
      if (token) {
        response.cookies.delete("auth_token");
        response.cookies.delete("role");
      }
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/register/form/:path*",
    "/profile",
    "/dashboard/:path*",
    "/blog/write/:path*",
    "/blog/write",
  ],
};
