import { getRequest } from "@tanstack/react-start/server";
import { personaKeyFromCookieHeader, previewPersona } from "@/lib/preview-personas";

/** The selected local persona, only when using the isolated PGLite dev database. */
export function getLocalPreviewPersona() {
  if (!import.meta.env.DEV || process.env.DATABASE_URL?.trim()) return null;
  const key = personaKeyFromCookieHeader(getRequest()?.headers.get("cookie"));
  return key ? previewPersona(key) : null;
}

export function isLocalPreviewRequest(): boolean {
  return getLocalPreviewPersona() !== null;
}
