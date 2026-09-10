import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken, CustomJWTPayload } from "./lib/jwt";

export async function middleware(req: NextRequest) {
  const invitationCookie = req.cookies.get("invitation_validated")?.value;
  const token = req.cookies.get("auth_token")?.value || req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  let payload: CustomJWTPayload | null = null;

  // --- Core JWT Validation ---
  if (token) {
    try {
      payload = await verifyAuthToken(token);
    } catch {
      payload = null;
    }
  }

  // --- 1. Invitation-protected pages ---
  if (pathname.startsWith("/register/form")) {
    if (!invitationCookie) {
      return NextResponse.redirect(new URL("/register", req.url));
    }
  }

  // Helper to clear cookies reliably
  const clearAuthCookies = (res: NextResponse) => {
    res.cookies.set("auth_token", "", { path: "/", maxAge: 0 });
    res.cookies.set("token", "", { path: "/", maxAge: 0 });
    res.cookies.set("role", "", { path: "/", maxAge: 0 });
  };

  // --- 2. Profile-protected pages ---
  if (pathname === "/profile") {
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
      const response = NextResponse.redirect(loginUrl);
      if (token) clearAuthCookies(response);
      return response;
    }
  }

  // --- 3. Dashboard-protected pages (Executive Only) ---
  if (pathname.startsWith("/dashboard")) {
    if (!payload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname + req.nextUrl.search);
      const response = NextResponse.redirect(loginUrl);
      if (token) clearAuthCookies(response);
      return response;
    }

    const userRole = String(payload.role || "").toLowerCase();
    const roleCookie = String(req.cookies.get("role")?.value || "").toLowerCase();
    const isExecutive =
      userRole === "admin" ||
      userRole === "moderator" ||
      userRole === "executive" ||
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
      if (token) clearAuthCookies(response);
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
