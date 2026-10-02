/**
 * Admin credential verification (Node runtime only — bcrypt).
 *
 * Why loadRawEnv: `next start` parses .env with dotenv-expand, which expands
 * `$VAR` sequences. Bcrypt hashes contain `$` and get silently mangled
 * (verified: hash loses its `$` segments). We re-load the raw .env values,
 * overriding the expanded ones. On Vercel there is no .env file, so this is
 * a no-op and dashboard env vars are used as-is.
 */
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

export function loadRawEnv() {
  dotenv.config({ override: true });
}

/** Verify admin credentials against ADMIN_USERNAME + ADMIN_PASSWORD_HASH. */
export async function verifyAdminCredentials(
  username: unknown,
  password: unknown,
): Promise<boolean> {
  loadRawEnv();
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedUser || !expectedHash) return false;
  if (typeof username !== "string" || typeof password !== "string") return false;
  if (username.length > 200 || password.length > 200) return false;
  if (username !== expectedUser) {
    // Burn comparable time to avoid a username oracle.
    await bcrypt.compare(password, "$2a$12$0000000000000000000000000000000000000000000000000000");
    return false;
  }
  return bcrypt.compare(password, expectedHash);
}
