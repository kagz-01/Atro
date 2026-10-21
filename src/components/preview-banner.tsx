import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { previewIdentity } from "@/lib/supabase/config";
import { personaKeyFromCookieHeader, previewPersona } from "@/lib/preview-personas";

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
 *
 * Which seat the copy names comes from the persona cookie, read in the same
 * post-mount effect for the same hydration reason.
 */
const DISMISS_KEY = "atro.preview-banner-dismissed";

export function PreviewBanner() {
  const [visible, setVisible] = useState(false);
  const [personaKey, setPersonaKey] = useState<string | null>(null);
  const identity = previewIdentity();
  const bar = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!identity) return;
    setPersonaKey(personaKeyFromCookieHeader(document.cookie));
    try {
      setVisible(window.sessionStorage.getItem(DISMISS_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, [identity]);

  // The console's sidebar and topbar are sticky to the top of the viewport, so
  // without this they would slide underneath the notice. Publishing the measured
  // height as a custom property lets them offset by exactly the right amount —
  // and the notice wraps to two lines on a phone, so it has to be measured
  // rather than assumed.
  useLayoutEffect(() => {
    if (!visible) return;
    const node = bar.current;
    if (!node) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        "--preview-banner-h",
        `${node.offsetHeight}px`,
      );
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--preview-banner-h");
    };
  }, [visible]);

  if (!identity || !visible) return null;

  const seat = previewPersona(personaKey);
  const email = personaKey ? seat.email : identity.email;

  return (
    <div
      ref={bar}
      className="sticky top-0 z-[60] flex items-center gap-3 bg-amber-100 px-4 py-2 text-[12px] text-amber-950"
    >
      <span className="size-1.5 shrink-0 rounded-full bg-amber-600" />
      <p className="flex-1">
        <strong className="font-semibold">Preview mode.</strong> Sign-in is not
        connected yet, so you are browsing as{" "}
        <code className="font-mono">{email}</code> — {seat.name},{" "}
        {seat.blurb.toLowerCase()}. Change seats with the switcher at the
        bottom left. Nothing here is a real session.
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