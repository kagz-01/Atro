import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { previewIdentity } from "@/lib/supabase/config";
import {
  personaCookieAssignment,
  personaKeyFromCookieHeader,
  PREVIEW_PERSONAS,
  previewPersona,
  previewPersonaWorkspace,
  isGuestPreviewCookie,
  type PreviewPersonaKey,
} from "@/lib/preview-personas";

/**
 * The four-seat switcher for local preview.
 *
 * The switcher stays pinned to the viewport because switching seats is how
 * local preview reaches the office console and each side of the client portal.
 *
 * Nothing renders until after mount: the active seat comes from
 * `document.cookie`, which the server does not share with this component, so
 * deciding during SSR would guarantee a hydration mismatch.
 *
 * The cookie is resolved per-request on the server, so a seat change only
 * takes effect after a document reload. Each seat also opens its own
 * workspace: studio staff in the console and clients in the portal.
 */
export function PreviewPersonaSwitcher() {
  const [active, setActive] = useState<PreviewPersonaKey | null>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    // Configured Supabase means no preview identity, so the switcher cannot
    // linger in production.
    if (!previewIdentity() || isGuestPreviewCookie(document.cookie)) return;
    setActive(personaKeyFromCookieHeader(document.cookie) ?? previewPersona().key);
  }, []);

  if (!active || !(pathname.startsWith("/admin") || pathname.startsWith("/portal"))) return null;

  return (
    <div
      role="group"
      aria-label="Preview persona switcher"
      className="fixed bottom-3 left-3 z-[70] flex items-center gap-0.5 rounded-full border border-amber-300 bg-amber-50/95 p-1 shadow-sm backdrop-blur-sm"
    >
      {PREVIEW_PERSONAS.map((persona) => {
        const selected = persona.key === active;
        const workspace = previewPersonaWorkspace(persona.key);
        const alreadyInWorkspace =
          workspace === "/admin"
            ? window.location.pathname.startsWith("/admin")
            : window.location.pathname.startsWith("/portal");
        const needsWorkspaceNavigation = selected && !alreadyInWorkspace;
        return (
          <button
            key={persona.key}
            type="button"
            aria-label={
              needsWorkspaceNavigation
                ? `Open ${persona.short} workspace`
                : `Switch to ${persona.name}`
            }
            aria-pressed={selected}
            title={
              needsWorkspaceNavigation
                ? `${persona.name} is selected; open the ${workspace === "/admin" ? "studio" : "client"} workspace`
                : `${persona.name} — ${persona.blurb} · ${persona.email}`
            }
            onClick={() => {
              document.cookie = personaCookieAssignment(persona.key);
              if (selected && alreadyInWorkspace) return;
              if (alreadyInWorkspace) {
                window.location.reload();
              } else {
                window.location.assign(workspace);
              }
            }}
            className={
              selected
                ? `rounded-full bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white ${needsWorkspaceNavigation ? "cursor-pointer ring-1 ring-amber-950/30" : "cursor-default"}`
                : "cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium text-amber-950 hover:bg-amber-200"
            }
          >
            {persona.short}
          </button>
        );
      })}
    </div>
  );
}
