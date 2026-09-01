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
      const response = NextResponse.redirect(new URL("/login", req.url));
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
      const response = NextResponse.redirect(new URL("/login", req.url));
      // Clear stale/invalid cookies
      if (token) {
        response.cookies.delete("auth_token");
        response.cookies.delete("role");
      }
      return response;
    }

    const isExecutive =
      payload.role === "admin" ||
      payload.role === "moderator" ||
      payload.role === "executive";

    if (!isExecutive) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/register/form/:path*",
    "/profile",
    "/dashboard/:path*",
  ],
};
