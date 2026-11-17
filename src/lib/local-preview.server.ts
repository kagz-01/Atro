import { getRequest } from "@tanstack/react-start/server";
import { configured } from "@/lib/supabase/config";
import {
  personaKeyFromCookieHeader,
  previewPersona,
  previewWorkspacesAvailable,
} from "@/lib/preview-personas";

/** Whether this runtime can safely use seeded preview identities and PGLite. */
export function isPreviewEnvironment(): boolean {
  return previewWorkspacesAvailable({
    isDevelopment: import.meta.env.DEV,
    hasDatabase: Boolean(process.env.DATABASE_URL?.trim()),
    hasAuth: configured,
  });
}

/** The selected persona, only when using the isolated PGLite preview database. */
export function getPreviewPersona() {
  if (!isPreviewEnvironment()) return null;
  const key = personaKeyFromCookieHeader(getRequest()?.headers.get("cookie"));
  return key ? previewPersona(key) : null;
}

export function isPreviewRequest(): boolean {
  return getPreviewPersona() !== null;
}
