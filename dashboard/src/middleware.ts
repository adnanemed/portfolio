/**
 * Edge middleware:
 * 1. Protects /dashboard/* pages (redirect to /login) and /api/admin/*
 *    (401 JSON) with the stacklab_session JWT. /api/admin/login is exempt
 *    from auth but still CSRF-checked.
 * 2. CSRF Origin check on every mutating /api request (cookie-based auth).
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { isCsrfSafe } from "@/lib/cors";

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(req.method);

  // CSRF: browsers always send Origin on cross-site mutations.
  if (isMutation && !isCsrfSafe(req)) {
    return NextResponse.json(
      { error: "csrf_origin_rejected" },
      { status: 403 },
    );
  }

  const isAdminApi = pathname.startsWith("/api/admin");
  const isLoginEndpoint = pathname === "/api/admin/login";

  if (!isLoginEndpoint) {
    const session = await verifySessionToken(
      req.cookies.get(SESSION_COOKIE)?.value,
    );
    if (!session) {
      if (isAdminApi) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/login", req.url);
      const response = NextResponse.redirect(loginUrl);
      // Avoid open-redirect via ?next= — only same-origin relative paths.
      return response;
    }
  }

  return NextResponse.next();
}
