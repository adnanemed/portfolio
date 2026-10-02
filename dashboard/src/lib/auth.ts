/**
 * Auth utilities (server routes). Re-exports the edge-safe session helpers
 * plus the Node-only bcrypt credential check.
 */
export {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
} from "./session";
export type { SessionPayload } from "./session";
export { loadRawEnv, verifyAdminCredentials } from "./credentials";

import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./session";
import type { SessionPayload } from "./session";

/** Read + verify the session from cookies inside route handlers / server components. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
