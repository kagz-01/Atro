import { useSyncExternalStore } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  personaKeyFromCookieHeader,
  previewPersona,
} from "@/lib/preview-personas";

/**
 * Normalized user shape used across the app.
 *
 * A phone-signed-in client has no email and no name by default, so `phone` is a
 * first-class field here rather than an afterthought — it is often the only
 * identifier the studio has for them.
 */
export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  profileImageUrl: string | null;
  /** True when Supabase is not configured and the app falls back to a dev user. */
  isDevFallback: boolean;
};

/**
 * The preview seat, used ONLY when Supabase is not configured.
 *
 * Resolved from the same cookie the server reads (`getSessionUser`), so both
 * sides agree on who you are — the id every per-user row is scoped by comes
 * from the persona, not from a module-level constant, because the four seats
 * are four different owners. No cookie falls back to the env override (or the
 * boss seat's address), matching the server's default.
 *
 * Browser-only by construction: `start()` never runs on the server, so
 * touching `document.cookie` here can never leak into SSR.
 *
 * Built ONCE per page load. The unconfigured `start()` re-runs on every
 * render, and a fresh object each time would hand `useSyncExternalStore` a
 * new snapshot on every pass — setState during render, which React reports
 * as error #520 and then loops on. The switcher reloads to change seats, so
 * the cookie cannot move underneath this cache.
 */
const previewEmail =
  (import.meta.env.VITE_PREVIEW_AUTH_EMAIL as string | undefined)?.trim() || "hello@atro.ke";

let previewUser: AppUser | null = null;

function previewAppUser(): AppUser {
  if (previewUser) return previewUser;
  const key = personaKeyFromCookieHeader(document.cookie);
  const persona = previewPersona(key);
  previewUser = {
    id: persona.userId,
    displayName: persona.name,
    primaryEmail: key ? persona.email : previewEmail,
    primaryPhone: null,
    profileImageUrl: null,
    isDevFallback: true,
  };
  return previewUser;
}

/** `useCurrentUserState()` result: the user plus the session-loading flag. */
export type CurrentUserState = {
  /** The user — `null` BOTH while the session loads and when signed out. */
  user: AppUser | null;
  /** True while the session is still resolving — don't treat `user: null` as signed out yet. */
  isPending: boolean;
};

type Cache = {
  user: AppUser | null;
  isPending: boolean;
  listeners: Set<() => void>;
};

const cache: Cache = { user: null, isPending: true, listeners: new Set() };
let started = false;

function emit() {
  for (const listener of cache.listeners) listener();
}

function set(next: Partial<Cache>) {
  Object.assign(cache, next);
  emit();
}

/**
 * Subscribe to Supabase's session, mirrored into a tiny external store so
 * every caller shares one listener and one auth call.
 */
function start() {
  if (started || typeof window === "undefined") return;
  const supabase = supabaseBrowser();
  if (!supabase) {
    // Unconfigured: behave as whoever the persona cookie says, never pending.
    // The flag matters here too — without it every render re-entered this
    // branch and re-emitted, and the store listener of a component mid-render
    // would schedule a setState on the component being rendered (React's
    // "cannot update while rendering" warning, which in a concurrent prod
    // build escalates to a #520 recovery loop on /portal). The persona cannot
    // change without a full reload, so one settle per load is correct.
    started = true;
    set({ user: previewAppUser(), isPending: false });
    return;
  }
  started = true;

  void supabase.auth.getSession().then(({ data }) => {
    const user = data.session?.user;
    set({
      user: user ? mapUser(user) : null,
      isPending: false,
    });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    set({ user: user ? mapUser(user) : null, isPending: false });
  });
}

function mapUser(user: {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): AppUser {
  const metaName = user.user_metadata?.["full_name"];
  const metaAlt = user.user_metadata?.["name"];
  return {
    id: user.id,
    displayName:
      (typeof metaName === "string" && metaName.trim() ? metaName.trim() : null) ??
      (typeof metaAlt === "string" && metaAlt.trim() ? metaAlt.trim() : null),
    primaryEmail: user.email ?? null,
    primaryPhone: user.phone ?? null,
    profileImageUrl: null,
    isDevFallback: false,
  };
}

function subscribe(listener: () => void): () => void {
  cache.listeners.add(listener);
  start();
  return () => {
    cache.listeners.delete(listener);
  };
}

const getSnapshot = () => cache.user;
const getServerSnapshot = () => null;

/**
 * Current user + loading state.
 *
 * `user` is `null` while the session resolves (`isPending: true`) and when
 * signed out (`isPending: false`). Guard a route by waiting out `isPending`
 * before acting on `user`:
 *
 *   const { user, isPending } = useCurrentUserState();
 *   if (isPending) return null;              // still resolving — don't redirect
 *   if (!user) return <RedirectToSignIn />;  // definitely signed out
 */
export function useCurrentUserState(): CurrentUserState {
  start();
  return { user: cache.user, isPending: cache.isPending };
}

/**
 * Convenience view for display. NOTE: `null` means *loading OR signed out* —
 * for redirects use `useCurrentUserState()` and check `isPending`.
 */
export function useCurrentUser(): AppUser | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}