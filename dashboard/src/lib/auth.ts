/**
 * Auth utilities: JWT (jose HS256) session cookie + bcrypt password check.
 * Cookie: stacklab_session, httpOnly, Secure, SameSite=Lax, 7 days.
 * JWT payload contains NO personal data, only { role: "admin" }.
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "stacklab_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET is not set or too short");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = { role: "admin" };

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    if (payload.role !== "admin") return null;
    return { role: "admin" };
  } catch {
    return null;
  }
}

/** Read + verify the session from cookies inside route handlers / server components. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

/** Verify admin credentials against env (ADMIN_USERNAME + ADMIN_PASSWORD_HASH bcrypt). */
export async function verifyAdminCredentials(
  username: unknown,
  password: unknown,
): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUser || !expectedHash) return false;
  if (typeof username !== "string" || typeof password !== "string") return false;
  if (username.length > 200 || password.length > 200) return false;
  if (username !== expectedUser) {
    // Burn comparable time to avoid username oracle.
    await bcrypt.compare(password, "$2a$12$0000000000000000000000000000000000000000000000000000");
    return false;
  }
  return bcrypt.compare(password, expectedHash);
}
