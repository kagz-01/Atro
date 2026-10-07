import { useEffect, useState } from "react";

/**
 * True only after the first client render has committed.
 *
 * Auth state must never be read on the very first paint: the server always
 * renders the session as pending (there is no session on that side), so a client
 * that already knows the answer — from a cookie, or from the bearer token in the
 * live preview — produces different markup and React discards the whole tree with
 * a hydration mismatch. Gating on this flag makes the server HTML and the first
 * client render identical (the skeleton), then swaps in the real state.
 *
 * Pairs with `useCurrentUserState()`; do not redirect on `user === null` alone.
 */
export function useIsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}