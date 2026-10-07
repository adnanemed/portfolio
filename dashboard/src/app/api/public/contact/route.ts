import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { isOriginAllowed } from "@/lib/cors";
import { sendContactNotification } from "@/lib/email";
import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_MS = 1000;

function jsonWithCors(req: Request, body: unknown, status: number) {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (!origin) {
    headers["Access-Control-Allow-Origin"] = "*";
  }
  return NextResponse.json(body, { status, headers });
}

export function OPTIONS(req: Request) {
  return jsonWithCors(req, null, 204);
}

/**
 * POST /api/public/contact
 * Order: honeypot/timing (403) → rate-limit 3/h/IP (429) → zod (400)
 *        → INSERT Neon → Resend (failure never blocks the 201, R7).
 */
export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonWithCors(req, { error: "validation" }, 400);
  }

  // 1. Honeypot — real users never fill the hidden "website" field.
  const website = payload.website;
  if (typeof website === "string" && website.length > 0) {
    return jsonWithCors(req, { error: "blocked" }, 403);
  }

  // 2. Min fill time — bots submit instantly.
  const startedAt = typeof payload.startedAt === "number" ? payload.startedAt : 0;
  const elapsed = Date.now() - startedAt;
  if (
    !startedAt ||
    elapsed < MIN_FILL_MS ||
    elapsed > 1000 * 60 * 60 * 24 // > 24h old → replay
  ) {
    return jsonWithCors(req, { error: "blocked" }, 403);
  }

  // 3. Rate limit — 3 requests / hour / IP.
  const ip = clientIp(req);
  const allowed = await rateLimit(`rl:contact:${ip}`, 3, 60 * 60);
  if (!allowed) {
    return jsonWithCors(req, { error: "rate_limited" }, 429);
  }

  // 4. Validation.
  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonWithCors(
      req,
      { error: "validation", fields: parsed.error.flatten().fieldErrors },
      400,
    );
  }
  const data = parsed.data;

  // 5. Insert FIRST — the message must never be lost (R7).
  let inserted = true;
  try {
    await db.insert(messages).values({
      name: data.name,
      email: data.email,
      phone: data.phone ? data.phone : null,
      message: data.message,
      locale: data.locale,
      status: "unread",
      ipHash: await hashIp(ip),
      userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
    });
  } catch (err) {
    console.error("[contact] DB insert failed:", err);
    inserted = false;
  }

  if (!inserted) {
    return jsonWithCors(req, { error: "internal" }, 500);
  }

  // 6. Email notification — failure logged, response stays 201.
  const emailResult = await sendContactNotification({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    message: data.message,
    locale: data.locale,
  });
  if (!emailResult.sent) {
    console.warn(
      `[contact] email not sent (insert succeeded): ${emailResult.error}`,
    );
  }

  return jsonWithCors(req, { ok: true }, 201);
}
