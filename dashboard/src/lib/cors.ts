/**
 * CORS + CSRF Origin checks.
 *
 * - Public GET endpoints: response carries ACAO only for allowlisted origins
 *   (from CORS_ALLOWED_ORIGINS), plus Vary: Origin.
 * - Mutations (admin API, contact): Origin header must match the request host
 *   or be in the allowlist — classic CSRF defence for cookie auth.
 */

export function allowedOrigins(): string[] {
  return (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  const hardcodedAllowed = [
    "https://stacklab-site.vercel.app",
    "http://localhost:4321",
    "http://localhost:4322",
    "http://localhost:3000",
    "http://127.0.0.1:4321",
    "http://127.0.0.1:4322",
  ];
  if (hardcodedAllowed.includes(origin)) return true;
  if (allowedOrigins().includes(origin)) return true;
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith(".vercel.app") && (url.hostname.includes("stacklab") || url.hostname.includes("mijero"))) {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

/** CORS headers for a given request Origin (public API). */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

/**
 * CSRF check for mutating requests: the Origin header (when present) must
 * match the deployment host or the allowlist. Requests without Origin
 * (curl, server-to-server) pass; browsers always send Origin on mutations.
 */
export function isCsrfSafe(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser client

  try {
    const originHost = new URL(origin).host;
    const host =
      req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (host && originHost === host) return true;
  } catch {
    return false;
  }
  return isOriginAllowed(origin);
}

/** Standard OPTIONS preflight response for public endpoints. */
export function preflightResponse(req: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}
