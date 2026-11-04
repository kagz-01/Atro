import { supabaseBrowser } from "@/lib/supabase/browser";
import { ACCESS_TOKEN_COOKIE } from "@/lib/supabase/config";
import {
  clearGuestPreviewCookieAssignment,
  guestPreviewCookieAssignment,
} from "@/lib/preview-personas";

/**
 * Browser auth surface for this app.
 *
 * Sign-in is a phone number and a one-time code, verified by Supabase. The
 * access token Supabase issues is mirrored into a cookie so it also rides along
 * with SSR loaders and server functions — the browser alone cannot tell the
 * server who it is, and reading a token the client minted would prove nothing.
 *
 * The cookie is readable by JavaScript on purpose: it is a bearer token for
 * this origin's own API, and the server still verifies every one of them
 * against Supabase Auth. Nothing here grants an identity on its own.
 */

export { configured as authEnabled } from "@/lib/supabase/config";

/**
 * True when sign-in UI should be shown. Present so callers keep one import
 * site whether auth is Supabase-backed or not.
 */
export function authAvailable(): boolean {
  return supabaseBrowser() !== null;
}

function setAccessTokenCookie(token: string | null) {
  if (typeof document === "undefined") return;
  // Same-site, session-scoped: the token dies with the tab, and a stale value
  // cannot outlive the session it belonged to.
  document.cookie = token
    ? `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; samesite=lax`
    : `${ACCESS_TOKEN_COOKIE}=; path=/; samesite=lax; max-age=0`;
}

function setGuestPreview(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = enabled
    ? guestPreviewCookieAssignment()
    : clearGuestPreviewCookieAssignment();
}

/** Enter the sample client portal without establishing an account session. */
export function continueAsGuest(redirectTo = "/portal"): void {
  if (typeof window === "undefined") return;
  const destination = new URL(redirectTo, window.location.origin);
  if (
    destination.origin !== window.location.origin ||
    !destination.pathname.startsWith("/portal") ||
    destination.pathname.startsWith("//")
  ) {
    throw new Error("The guest preview return address is not allowed.");
  }
  setGuestPreview(true);
  window.location.assign(`${destination.pathname}${destination.search}${destination.hash}`);
}

/**
 * Keep the cookie in step with the session Supabase holds.
 *
 * Called on load and after every sign-in/sign-out, and subscribes to token
 * refresh so a long-lived tab never sends an expired token.
 */
export function startAuthCookieSync(): () => void {
  const supabase = supabaseBrowser();
  if (!supabase || typeof document === "undefined") return () => {};

  const sync = () => {
    void supabase.auth.getSession().then(({ data }) => {
      setAccessTokenCookie(data.session?.access_token ?? null);
    });
  };

  sync();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    setAccessTokenCookie(session?.access_token ?? null);
  });

  return () => {
    data.subscription.unsubscribe();
    setAccessTokenCookie(null);
  };
}

/** The current access token, for the middleware to forward as a bearer. */
export async function getBearerToken(): Promise<string | null> {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${ACCESS_TOKEN_COOKIE}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Send a sign-in code to a phone number.
 *
 * `0799 034 712` and `+254799034712` both work; anything ambiguous is refused
 * before a provider is charged for a message that cannot be delivered.
 */
export async function sendPhoneCode(rawPhone: string): Promise<{ error: string | null }> {
  const { toPhoneForOtp } = await import("@/lib/supabase/config");
  const phone = toPhoneForOtp(rawPhone);
  if (!phone) {
    return { error: "That does not look like a phone number. Try 0799 034 712." };
  }
  const supabase = supabaseBrowser();
  if (!supabase) return { error: "Sign-in is unavailable." };
  setGuestPreview(false);
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
  });
  if (!error) {
    const { data } = await supabase.auth.getSession();
    setAccessTokenCookie(data.session?.access_token ?? null);
  }
  return { error: error ? error.message : null };
}

/** Exchange the code for a session. */
export async function verifyPhoneCode(
  rawPhone: string,
  token: string,
): Promise<{ error: string | null }> {
  const { toPhoneForOtp } = await import("@/lib/supabase/config");
  const phone = toPhoneForOtp(rawPhone);
  if (!phone) return { error: "That phone number is not in a usable format." };
  const supabase = supabaseBrowser();
  if (!supabase) return { error: "Sign-in is unavailable." };
  setGuestPreview(false);
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  if (!error) {
    const { data } = await supabase.auth.getSession();
    setAccessTokenCookie(data.session?.access_token ?? null);
  }
  return { error: error ? error.message : null };
}

/** Start passwordless email sign-in; a new account is created if needed. */
export async function sendEmailCode(rawEmail: string): Promise<{ error: string | null }> {
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  const supabase = supabaseBrowser();
  if (!supabase) return { error: "Sign-in is unavailable." };
  setGuestPreview(false);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  return { error: error ? error.message : null };
}

/** Verify a passwordless email code and establish the session. */
export async function verifyEmailCode(
  rawEmail: string,
  token: string,
): Promise<{ error: string | null }> {
  const email = rawEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  const supabase = supabaseBrowser();
  if (!supabase) return { error: "Sign-in is unavailable." };
  setGuestPreview(false);
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: token.trim(),
    type: "email",
  });
  if (!error) {
    const { data } = await supabase.auth.getSession();
    setAccessTokenCookie(data.session?.access_token ?? null);
  }
  return { error: error ? error.message : null };
}

/** Redirect to Google OAuth and return to the supplied same-origin callback. */
export async function signInWithGoogle(redirectTo: string): Promise<{ error: string | null }> {
  const supabase = supabaseBrowser();
  if (!supabase) return { error: "Sign-in is unavailable." };
  setGuestPreview(false);
  const callback = new URL(redirectTo, window.location.origin);
  if (callback.origin !== window.location.origin) {
    return { error: "The sign-in return address is not allowed." };
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });
  return { error: error ? error.message : null };
}

/**
 * Sign out. Resolves once the session is actually gone — the cookie is cleared
 * here, so a caller that redirects on resolve can trust it.
 */
export async function signOut(redirectTo = "/"): Promise<void> {
  const supabase = supabaseBrowser();
  await supabase?.auth.signOut();
  setAccessTokenCookie(null);
  if (typeof window !== "undefined") window.location.href = redirectTo;
}
