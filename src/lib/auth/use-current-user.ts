import { useSyncExternalStore } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

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
 * Stable fallback user, used ONLY when Supabase is not configured. Its id is
 * `"dev-user"` — the SAME id `verify.server.ts` returns server-side — so
 * per-user rows written in that mode belong to one consistent owner.
 */
const previewEmail =
  (import.meta.env.VITE_PREVIEW_AUTH_EMAIL as string | undefined)?.trim() || "hello@atro.ke";

export const DEV_USER: AppUser = {
  id: "dev-user",
  displayName: "Preview mode",
  primaryEmail: previewEmail,
  primaryPhone: null,
  profileImageUrl: null,
  isDevFallback: true,
};

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
    // Unconfigured: behave as the dev fallback, never pending.
    set({ user: DEV_USER, isPending: false });
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