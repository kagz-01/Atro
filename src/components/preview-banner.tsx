import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { previewIdentity } from "@/lib/supabase/config";

/**
 * "You are not signed in" banner for local preview.
 *
 * Shown only while Supabase is unconfigured, and only after mount: whether it
 * renders depends on `sessionStorage`, which the server does not have, so
 * deciding during SSR would guarantee a hydration mismatch on every page.
 *
 * It re-derives from `previewIdentity()` on every render, which returns `null`
 * the moment Supabase is configured — the same switch that disables the bypass
 * also removes this notice, so it cannot linger on a real deployment.
 */
const DISMISS_KEY = "atro.preview-banner-dismissed";

export function PreviewBanner() {
  const [visible, setVisible] = useState(false);
  const identity = previewIdentity();

  useEffect(() => {
    if (!identity) return;
    try {
      setVisible(window.sessionStorage.getItem(DISMISS_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, [identity]);

  if (!identity || !visible) return null;

  return (
    <div className="sticky top-0 z-[60] flex items-center gap-3 bg-amber-100 px-4 py-2 text-[12px] text-amber-950">
      <span className="size-1.5 shrink-0 rounded-full bg-amber-600" />
      <p className="flex-1">
        <strong className="font-semibold">Preview mode.</strong> Sign-in is not
        connected yet, so you are browsing as{" "}
        <code className="font-mono">{identity.email}</code> — the studio owner,
        which is why the admin console opens. Nothing here is a real session.
      </p>
      <button
        type="button"
        aria-label="Hide preview notice"
        onClick={() => {
          try {
            window.sessionStorage.setItem(DISMISS_KEY, "1");
          } catch {
            /* ignore */
          }
          setVisible(false);
        }}
        className="shrink-0 cursor-pointer rounded p-1 hover:bg-amber-200"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}