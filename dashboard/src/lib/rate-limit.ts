/**
 * Rate limiting via Upstash Redis REST (INCR + EXPIRE).
 * Fails open with a console warning when Upstash is not configured (dev).
 */
import { Redis } from "@upstash/redis";

let client: Redis | null = null;

function redis(): Redis | null {
  if (client) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  client = new Redis({ url, token });
  return client;
}

/**
 * Fixed-window counter. Returns true when the request is ALLOWED.
 * @param key      unique key, e.g. "rl:contact:1.2.3.4"
 * @param limit    max hits per window
 * @param windowSeconds window length
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const r = redis();
  if (!r) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        `[rate-limit] Upstash not configured — FAIL OPEN for key=${key}`,
      );
    }
    return true;
  }
  try {
    const count = await r.incr(key);
    if (count === 1) {
      await r.expire(key, windowSeconds);
    }
    return count <= limit;
  } catch (err) {
    console.error("[rate-limit] Upstash error — failing open:", err);
    return true;
  }
}

/** Extract the client IP from proxy headers (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** SHA-256(ip + salt) — never store raw IPs. Salt = JWT_SECRET. */
export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.JWT_SECRET ?? "stacklab-dev-salt";
  const data = new TextEncoder().encode(`${ip}+${salt}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
