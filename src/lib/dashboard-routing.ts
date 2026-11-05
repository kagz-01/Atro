import type { AppUser } from "./auth/use-current-user.ts";
import { personaKeyFromCookieHeader, previewPersona } from "./preview-personas.ts";
import { isStaffRole } from "./staff-access-rules.ts";

export type ClientPortalRoute = "/portal" | "/portal/diaspora";
export type DashboardRoute = ClientPortalRoute | "/admin" | "/staff";

export function resolveDashboardRoute({
  user,
  accessRole,
  preferredClientRoute = "/portal",
}: {
  user: AppUser | null | undefined;
  accessRole?: string | null;
  preferredClientRoute?: ClientPortalRoute;
}): DashboardRoute {
  if (!user || user.isGuestPreview) return preferredClientRoute;
  if (accessRole && isStaffRole(accessRole)) {
    return accessRole === "admin" ? "/admin" : "/staff";
  }

  if (typeof document !== "undefined") {
    const previewKey = personaKeyFromCookieHeader(document.cookie);
    const preview = previewPersona(previewKey ?? null);
    if (preview.key === "boss") return "/admin";
    if (preview.key === "office") return "/staff";
  }

  return preferredClientRoute;
}
