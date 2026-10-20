// ATRO — the facts a lead already told us, carried into the portal.
//
// The enquiry wizard asks abroad clients two questions the Abroad dashboard
// runs on — where they are based and which zone their clock is in — and
// conversion used to write neither into the project ("clientCity: '',
// clientTz: ''"), nor create the profile that decides whether the Abroad
// section exists at all. The /diaspora page promises a portal that adapts to
// their time zone; these functions are how that promise survives the funnel:
// one enquiry row becomes the project's locality and the person's profile,
// decided here so both callers agree and the decision is testable.
//
// The `.ts` extension on the import carries its `.ts` extension like every
// other import from a tested module (see abroad.ts → journey.ts): node's test
// runner has no alias resolver, so `@/lib/...` would not load under `node --test`.

import { initialsFrom } from "./profile.ts";

/** The enquiry fields either hand-off needs (the snake_case row maps onto this). */
export type LeadFacts = {
  name: string;
  email: string;
  phone: string;
  diaspora: boolean;
  country: string;
  timezone: string;
};

/**
 * An IANA zone this runtime actually knows, else "".
 *
 * The wizard offers an explicit "Other" choice (value "other") and a select can
 * be left untouched — neither may reach a clock: a time rendered from an
 * invented zone is wrong by an unknown amount, so the honest answer is "not
 * set" and the profile panel invites the client to choose one.
 */
export function usableZone(timezone: string): string {
  const tz = timezone.trim();
  if (!tz) return "";
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: tz });
    return tz;
  } catch {
    return "";
  }
}

/** Country "Other" is a polite decline of the question, not a place. */
function usableCountry(country: string): string {
  const value = country.trim();
  return !value || value === "Other" ? "" : value;
}

/**
 * What the project row keeps: their locality, in the project's own columns.
 *
 * A local enquiry never offered these questions — its city stays empty exactly
 * as before — so nothing about a Nairobi lead changes here.
 */
export function leadLocality(lead: {
  diaspora: boolean;
  country: string;
  timezone: string;
}): { clientCity: string; clientTz: string } {
  if (!lead.diaspora) return { clientCity: "", clientTz: "" };
  return {
    clientCity: usableCountry(lead.country),
    clientTz: usableZone(lead.timezone),
  };
}

/**
 * The profile a first sign-in should find already waiting: named, reachable,
 * and — for a diaspora enquiry — typed `diaspora` with the zone Steps 7 and 8
 * read, so the Abroad view, the "your clock" call quotes and the consent log
 * all exist from the first load rather than after a trip through Settings.
 *
 * Consent columns are left to their table defaults (email and WhatsApp on,
 * SMS off — the same values EMPTY_PROFILE holds): a record of what the client
 * told us, never a permission grab. `country`/`timezone` blank out for a local
 * lead, whose wizard never asked.
 */
export function leadProfile(lead: LeadFacts): {
  displayName: string;
  initials: string;
  email: string;
  phone: string;
  country: string;
  timezone: string;
  clientType: string;
} {
  return {
    displayName: lead.name.trim(),
    initials: initialsFrom(lead.name),
    email: lead.email.trim(),
    phone: lead.phone.trim(),
    country: lead.diaspora ? usableCountry(lead.country) : "",
    timezone: lead.diaspora ? usableZone(lead.timezone) : "",
    clientType: lead.diaspora ? "diaspora" : "individual",
  };
}
