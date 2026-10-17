/**
 * Client profile rules — pure, so they can be tested without a browser.
 *
 * The avatar half is here rather than in the component because the part that
 * matters is the refusing: an upload is only accepted when it is an image we
 * recognise and small enough to store. A validation that only lives in the UI is
 * a validation that can be skipped.
 */

/** Hard ceiling on what we will store, before it reaches the database. */
export const AVATAR_MAX_BYTES = 400 * 1024;

export const AVATAR_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export type AvatarMime = (typeof AVATAR_MIME)[number];

export const CLIENT_TYPES = [
  { value: "individual", label: "For myself" },
  { value: "owner", label: "I own the project" },
  { value: "diaspora", label: "I live abroad" },
  { value: "developer", label: "I am a developer" },
  { value: "agent", label: "On behalf of someone" },
] as const;

export type ClientType = (typeof CLIENT_TYPES)[number]["value"];

export function isClientType(value: string): value is ClientType {
  return CLIENT_TYPES.some((t) => t.value === value);
}

/** Largest edge of the stored picture; the browser does the resizing. */
export const AVATAR_EDGE = 512;

export type ParsedImage = { mime: AvatarMime; bytes: Uint8Array };

/**
 * Decode a `data:` URL, rejecting anything that is not a small enough image.
 *
 * Returns a reason rather than throwing, because the caller has to show it to
 * the person who picked the file.
 */
export function parseImageDataUrl(
  value: string,
): { ok: true; image: ParsedImage } | { ok: false; reason: string } {
  const match = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i.exec(
    value.trim(),
  );
  if (!match) return { ok: false, reason: "That file could not be read as an image." };

  const mime = match[1].toLowerCase();
  if (!AVATAR_MIME.includes(mime as AvatarMime)) {
    return {
      ok: false,
      reason: "Use a JPEG, PNG or WebP picture.",
    };
  }

  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(match[2].replace(/\s/g, "")), (c) => c.charCodeAt(0));
  } catch {
    return { ok: false, reason: "That file could not be read as an image." };
  }

  const check = checkAvatarSize(bytes.byteLength);
  if (!check.ok) return check;
  return { ok: true, image: { mime: mime as AvatarMime, bytes } };
}

export function checkAvatarSize(
  byteLength: number,
): { ok: true } | { ok: false; reason: string } {
  if (byteLength === 0) return { ok: false, reason: "That picture was empty." };
  if (byteLength > AVATAR_MAX_BYTES) {
    return {
      ok: false,
      reason: `That picture is ${Math.round(byteLength / 1024)} KB. Keep it under ${Math.round(AVATAR_MAX_BYTES / 1024)} KB.`,
    };
  }
  return { ok: true };
}

/**
 * Two letters for an avatar placeholder.
 *
 * Splits on whitespace, dots and the "@" of an address, then drops punctuation
 * rather than splitting on it. Dots separate initials and separate the parts of
 * an address; hyphens and apostrophes join a name, so "Mary-Jane O'Neill" gives
 * MO, not MJ. "amina@example.com" gives AE and "b.otieno@example.com" gives BO,
 * because the local part of an address is the name.
 */
export function initialsFrom(name: string): string {
  const words = name
    .trim()
    .split(/[\s@.]+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  if (words.length === 0) return "";
  return words
    .slice(0, 2)
    .map((w) => [...w][0].toUpperCase())
    .join("");
}

/** Display name with anything that should not be rendered trimmed away. */
export function cleanProfileText(value: string, max: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export const PROFILE_LIMITS = {
  displayName: 80,
  city: 60,
  country: 60,
  company: 120,
  about: 1000,
  referralSource: 120,
} as const;

/** Split a display name into a first name and whatever follows it. */
export function splitName(name: string): { first: string; rest: string } {
  const trimmed = name.trim();
  const at = trimmed.indexOf(" ");
  if (at === -1) return { first: trimmed, rest: "" };
  return { first: trimmed.slice(0, at), rest: trimmed.slice(at + 1).trim() };
}
