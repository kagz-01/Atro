import { getRequest } from "@tanstack/react-start/server";
import { configured, previewIdentity, ACCESS_TOKEN_COOKIE } from "@/lib/supabase/config";
import { verifyAccessToken } from "@/lib/supabase/server";

/**
 * Server-side session resolution (server-only).
 *
 * Supabase issues a JWT when a client signs in with a phone code. The browser
 * client mirrors that access token into a cookie so it rides along with SSR
 * loaders and server functions; here we hand it to Supabase Auth and believe
 * the answer, never the token itself.
 *
 * Never trust a client-supplied user id — only what `verifyAccessToken`
 * returns.
 */

/** True when a real database is configured server-side. */
const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());

/** Re-export so callers can branch on it without importing the supabase client. */
export { configured as authConfigured };

/** Dev fallback user id, used only when auth is disabled (`VITE_AUTH_ENABLED=false`). */
export const DEV_USER_ID = "dev-user";

/**
 * Thrown by `requireUserId` when the caller has no valid session. Carries
 * `status: 401`; the message is a stable contract — match
 * `err.message === "Unauthorized"` client-side to send the visitor to sign-in.
 */
export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export type VerifiedUser = { id: string; email: string | null; phone?: string | null };

/**
 * Resolve the signed-in user from the current request, or `null` when nobody is
 * signed in or Supabase is not configured.
 *
 * The token is read from the cookie, or from `Authorization: Bearer …` which is
 * what the middleware forwards when the session is not cookie-visible.
 */
export async function getSessionUser(
  bearerToken?: string,
): Promise<VerifiedUser | null> {
  // No Supabase means no way to sign in, so preview as the seeded studio admin
  // rather than pretending nobody is signed in.
  const preview = previewIdentity();
  if (!configured) return preview;

  const request = getRequest();
  if (!request) return null;

  let token = bearerToken ?? null;
  if (!token) {
    const header = request.headers.get("authorization");
    if (header?.toLowerCase().startsWith("bearer ")) {
      token = header.slice(7).trim();
    }
  }
  if (!token) {
    const cookie = request.headers.get("cookie") ?? "";
    const match = cookie.match(new RegExp(`(?:^|; )${ACCESS_TOKEN_COOKIE}=([^;]+)`));
    if (match?.[1]) token = decodeURIComponent(match[1]);
  }

  const user = await verifyAccessToken(token);
  if (!user) return null;
  return { id: user.id, email: user.email, phone: user.phone };
}

/**
 * Resolve the current user id for a server function, or throw when unauthorized.
 * - Supabase configured -> the verified session user id; throws
 *   `UnauthorizedError` when signed out.
 * - Not configured + `DATABASE_URL` set -> throw (fail closed): one shared dev
 *   user on a real database would let every visitor read/write everyone's rows.
 * - Not configured + no database -> the shared dev user id.
 */
export async function requireUserId(bearerToken?: string): Promise<string> {
  if (!configured) {
    if (databaseConfigured) {
      throw new Error(
        "Supabase is not configured but DATABASE_URL is set — " +
          "refusing to fall back to the shared dev user against a real database.",
      );
    }
    return DEV_USER_ID;
  }
  const user = await getSessionUser(bearerToken);
  if (!user) throw new UnauthorizedError();
  return user.id;
}