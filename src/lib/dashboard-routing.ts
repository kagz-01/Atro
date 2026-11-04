import type { AppUser } from "@/lib/auth/use-current-user";
import { personaKeyFromCookieHeader, previewPersona } from "@/lib/preview-personas";
import { isStaffRole } from "@/lib/staff-access-rules";

export type DashboardRoute = "/portal" | "/admin";

export function resolveDashboardRoute({
  user,
  accessRole,
}: {
  user: AppUser | null | undefined;
  accessRole?: string | null;
}): DashboardRoute {
  if (!user || user.isGuestPreview) return "/portal";
  if (accessRole && isStaffRole(accessRole)) return "/admin";

  if (typeof document !== "undefined") {
    const previewKey = personaKeyFromCookieHeader(document.cookie);
    const preview = previewPersona(previewKey ?? null);
    if (preview.key === "boss" || preview.key === "office") return "/admin";
  }

  return "/portal";
}
