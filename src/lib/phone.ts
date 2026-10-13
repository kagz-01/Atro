/**
 * Phone numbers, normalised once so every transport can trust them.
 *
 * This app talks to clients over SMS and WhatsApp, and both reject anything
 * that is not in a canonical international form. Kenya is the hard case: people
 * write `0799034712`, `+254 799 034 712`, `254799034712` and `0799-034-712` for
 * the same handset, and a diaspora client writes a UK or US number with no
 * local part at all.
 *
 * Numbers used to be checked with `/^\+\d{8,15}$/` at send time, so a client who
 * typed the local form — which is what almost everyone types — was silently
 * dropped and the notification logged as "no contact on file". Normalising at
 * the edges is what makes the SMS channel work at all.
 */

/**
 * Canonical E.164 form, e.g. `+254799034712`.
 *
 * Returns `null` rather than guessing when the input is ambiguous — a number
 * that reaches a messaging API slightly wrong is worse than one that never
 * leaves the building, because the failure is silent to the sender.
 *
 * An input with no country code is assumed to be Kenyan: that is where this
 * studio builds, and `0799034712` is unambiguously Kenyan to them. Anything
 * international must carry `+` or `00`.
 */
export function toE164(input: string | null | undefined): string | null {
  if (!input) return null;

  // Keep digits only, remembering whether the caller declared a country code.
  const trimmed = input.trim();
  const hadPlus = trimmed.startsWith("+") || /^00\d/.test(trimmed);
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  // 00 is the international access prefix: 0044... means +44...
  if (/^00\d/.test(trimmed)) return validE164("+" + digits.slice(2));

  // Explicitly international.
  if (hadPlus) return validE164("+" + digits);

  // 2547... / 2541... written without the plus.
  if (digits.startsWith("254") && digits.length === 12) return validE164("+" + digits);

  // Local Kenyan mobile: 07xxxxxxxx / 01xxxxxxxx.
  if (digits.length === 10 && (digits.startsWith("07") || digits.startsWith("01"))) {
    return validE164("+254" + digits.slice(1));
  }

  return null;
}

/**
 * Digits-only form for Africa's Talking, which takes `254799034712` — no plus.
 * `null` when the number cannot be trusted.
 */
export function toAfricaTalking(input: string | null | undefined): string | null {
  const e164 = toE164(input);
  return e164 ? e164.slice(1) : null;
}

/** E.164 permits a leading `+` and 8–15 digits; reject anything else. */
function validE164(candidate: string): string | null {
  return /^\+\d{8,15}$/.test(candidate) ? candidate : null;
}

/** How to render a stored number for a human. Falls back to the raw input. */
export function formatPhone(input: string | null | undefined): string {
  const e164 = toE164(input);
  if (!e164) return (input ?? "").trim();
  if (e164.startsWith("+254") && e164.length === 13) {
    return `+254 ${e164.slice(4, 7)} ${e164.slice(7, 10)} ${e164.slice(10)}`;
  }
  return e164;
}