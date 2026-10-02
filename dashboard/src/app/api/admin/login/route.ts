import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_CLEAR_OPTIONS = { ...sessionCookieOptions(), maxAge: 0 };

export async function POST(req: Request) {
  // 5 attempts / 15 min / IP (Upstash).
  const ip = clientIp(req);
  const allowed = await rateLimit(`rl:login:${ip}`, 5, 15 * 60);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "validation", fields: { body: "invalid JSON" } },
      { status: 400 },
    );
  }

  const { username, password } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
  };

  const valid = await verifyAdminCredentials(username, password);
  if (!valid) {
    // Generic error only — never reveal which field failed.
    return NextResponse.json(
      { error: "invalid_credentials" },
      { status: 401 },
    );
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}

export async function DELETE() {
  // Convenience: same semantics as /api/admin/logout.
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", COOKIE_CLEAR_OPTIONS);
  return response;
}
