/**
 * The four preview personas — who you can be when sign-in is not configured.
 *
 * A real deployment has one session per person and no way to become someone
 * else. The preview has no sign-in at all, so without this it could only ever
 * show one seat at a time: the seeded studio admin. That made the office
 * staff's console, and each side of the client relationship, unreachable —
 * you could read the code for them but never open them.
 *
 * Each persona is a full identity (its own user id, its own address), so
 * switching is not a filter on the same data: the projects, the roles and the
 * consent records all change with it. Keyed by a cookie the server reads on
 * every request and the banner writes before reloading.
 *
 * Impossible to reach on a real deployment for the same reason
 * `previewIdentity` is: Supabase configured means no preview identity at all.
 */

/** Cookie that carries the current persona key. Preview-only. */
export const PREVIEW_PERSONA_COOKIE = "atro-preview-persona";

export type PreviewPersonaKey = "boss" | "office" | "local" | "abroad";

export type PreviewPersona = {
  key: PreviewPersonaKey;
  /** The identity every per-user row is scoped by. Stable across seeds. */
  userId: string;
  /** The address the role allowlist and the claiming flows key on. */
  email: string;
  /** Short label for the switcher. */
  name: string;
  /** One button-width label for the switcher strip. */
  short: string;
  /** One line on what this seat is for. */
  blurb: string;
};

/**
 * The seats, in the order the switcher shows them.
 *
 * `dev-user` stays the boss's id because every seeded row written before this
 * module existed used it — renumbering would orphan the studio's own history
 * for no gain. The client personas get their own ids so a project can belong
 * to exactly one of them.
 */
export const PREVIEW_PERSONAS: readonly PreviewPersona[] = [
  {
    key: "boss",
    userId: "dev-user",
    email: "hello@atro.ke",
    name: "The boss",
    short: "Boss",
    blurb: "Sees everything",
  },
  {
    key: "office",
    userId: "dev-staff",
    email: "juma@atro.ke",
    name: "Juma · office",
    short: "Office",
    blurb: "Staff space",
  },
  {
    key: "local",
    userId: "dev-local",
    email: "wanjiku@example.com",
    name: "Wanjiku · Karen",
    short: "Local",
    blurb: "Building at home",
  },
  {
    key: "abroad",
    userId: "dev-abroad",
    email: "b.otieno@example.com",
    name: "Brian · London",
    short: "Abroad",
    blurb: "Building from abroad",
  },
] as const;

const DEFAULT_KEY: PreviewPersonaKey = "boss";

export function isPreviewPersonaKey(value: unknown): value is PreviewPersonaKey {
  return (
    typeof value === "string" &&
    PREVIEW_PERSONAS.some((p) => p.key === value)
  );
}

/**
 * Resolve a persona key to the full identity.
 *
 * Anything unknown — a stale cookie, a hand-typed value — resolves to the
 * boss rather than to nothing: the preview must always open *somewhere*, and
 * the boss is the seat every other seat is measured against.
 */
export function previewPersona(key: string | null = null): PreviewPersona {
  const match = PREVIEW_PERSONAS.find((p) => p.key === key);
  return match ?? PREVIEW_PERSONAS.find((p) => p.key === DEFAULT_KEY)!;
}

/**
 * Pull the persona key out of a raw `Cookie` header.
 *
 * Reads the header itself rather than a parsed jar because the server path
 * (`getSessionUser`) only ever holds the raw header — the same shape the
 * session-token reader already parses. Anything unreadable — no header, a
 * stale key, a mangled value — yields null so the caller falls back to the
 * env-driven default instead of to a guess.
 */
export function personaKeyFromCookieHeader(
  header: string | null | undefined,
): PreviewPersonaKey | null {
  if (!header) return null;
  const escaped = PREVIEW_PERSONA_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = header.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  if (!match) return null;
  const value = decodeURIComponent(match[1]);
  return isPreviewPersonaKey(value) ? value : null;
}

/**
 * The `document.cookie` assignment the switcher writes before reloading.
 *
 * A year, site-wide, lax — the preview should not ask you to re-pick a seat
 * on every reload, and lax keeps it off cross-site POSTs where it has no
 * business travelling.
 */
export function personaCookieAssignment(key: PreviewPersonaKey): string {
  return `${PREVIEW_PERSONA_COOKIE}=${key}; path=/; max-age=31536000; samesite=lax`;
}
