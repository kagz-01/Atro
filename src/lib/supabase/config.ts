/**
 * Supabase wiring — one place that decides whether this app has auth at all.
 *
 * Nothing here imports the SDK: this module is imported by client and server
 * alike, and pulling `createClient` in would drag Node-only code into the
 * browser bundle. `configured` is therefore a plain env check, and the actual
 * clients live in `browser.ts` / `server.ts`.
 *
 * Three variables, all server-side:
 *   SUPABASE_URL             project URL
 *   SUPABASE_ANON_KEY        safe to expose to the browser; signs requests
 *   SUPABASE_SERVICE_ROLE_KEY server-only, bypasses row-level security
 *
 * The service-role key must never be given a `VITE_` prefix — everything with
 * that prefix is inlined into the browser bundle, and that key can delete the
 * database.
 */

/**
 * Name of the cookie the browser writes with the current access token so it
 * also reaches SSR loaders and server functions. Shared rather than living in
 * a `*.server` module, because both sides need it.
 */
export const ACCESS_TOKEN_COOKIE = "atro-sb-access-token";

const url = process.env.SUPABASE_URL?.trim() ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY?.trim() ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

/** The browser half is usable as soon as a URL and anon key exist. */
export const configured = Boolean(url && anonKey);

/**
 * Server-side checks can also read and write with the service role, which is
 * what phone OTP needs (it verifies numbers nobody has signed in yet).
 */
export const serviceRoleConfigured = configured && Boolean(serviceRoleKey);

export const projectUrl = url;
export const anonKeyValue = anonKey;
export const serviceRoleKeyValue = serviceRoleKey;

/**
 * Why auth is unavailable, for the sign-in page to show instead of a blank
 * screen. Specific on purpose: "sign-in is misconfigured" is unactionable,
 * "SUPABASE_URL is not set" tells whoever deploys exactly what is missing.
 */
export function missingConfiguration(): string[] {
  const missing: string[] = [];
  if (!url) missing.push("SUPABASE_URL");
  if (!anonKey) missing.push("SUPABASE_ANON_KEY");
  return missing;
}

/**
 * Preview identity, used ONLY while Supabase is not configured.
 *
 * Signing in needs a real Supabase project, so until the keys exist there is
 * nothing to sign in *as*. Falling back to a placeholder address would leave
 * the studio console unreachable, because access is an allowlist keyed on the
 * signed-in address — so the preview identity borrows the seeded studio admin
 * and every dashboard opens for real.
 *
 * This is impossible to reach on a real deployment: `configured` short-circuits
 * it, so adding Supabase keys disables the bypass with no other change. The
 * other guard is `DATABASE_URL` — a deployed database must never serve a shared
 * identity (see `requireUserId`).
 */
export function previewIdentity(): { id: string; email: string } | null {
  if (configured) return null;
  const email =
    process.env.PREVIEW_AUTH_EMAIL?.trim() ||
    process.env.VITE_PREVIEW_AUTH_EMAIL?.trim() ||
    // The studio owner seeded by migrations/0003_staff_roles.sql.
    "hello@atro.ke";
  return { id: "dev-user", email };
}

/**
 * Normalise a dialled number to E.164, which is the only form Supabase accepts.
 *
 * Reuses the app's normaliser so a Kenyan client can type `0799 034 712` and a
 * diaspora client `+44 7700 900123`, and both end up in a shape the phone
 * provider will actually deliver to.
 */
export function toPhoneForOtp(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const hadPlus = trimmed.startsWith("+") || /^00\d/.test(trimmed);
  const digits = trimmed.replace(/\D/g, "");
  if (/^00\d/.test(trimmed)) return digits.length >= 8 && digits.length <= 15 ? `+${digits.slice(2)}` : null;
  if (hadPlus) return /^\d{8,15}$/.test(digits) ? `+${digits}` : null;
  if (digits.startsWith("254") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10 && (digits.startsWith("07") || digits.startsWith("01"))) {
    return `+254${digits.slice(1)}`;
  }
  return null;
}