// ATRO presence — being in the building, from wherever the client actually is.
//
// The portal's record is the same for every client: contract, money,
// approvals, decisions. What distance changes is presence. This module holds
// every decision that separates the two tracks, as pure functions so the
// panels only ever paint:
//
//   local   → 'visit'       the client asks to walk the building;
//                           the studio answers with a confirmed slot.
//   abroad  → 'walkthrough' the client asks for the building to be walked on
//                           camera; the studio answers with a link.
//
// Three rules are written here rather than in the components, because they
// must not be persuadable: a track may only ask for its own kind; an answered
// request is answered once (a confirmed date the studio changes later is a
// conversation, not a state flip); and a decline must carry words — silence
// with a status attached is how a client learns to distrust the portal.
//
// Instants are compared by Date.parse, never lexicographically: ISO strings
// with different UTC offsets do not sort by their characters, and a visit
// confirmed for 10:00 EAT must not lose to a request written at 08:00Z.

/** The site keeps this clock. Visits are confirmed in it, and printed in it. */
export const SITE_ZONE = "Africa/Nairobi";

export const PRESENCE_KINDS = ["visit", "walkthrough"] as const;
export type PresenceKind = (typeof PRESENCE_KINDS)[number];

export const PRESENCE_STATUSES = ["requested", "scheduled", "delivered", "declined"] as const;
export type PresenceStatus = (typeof PRESENCE_STATUSES)[number];

export type PresenceRequest = {
  id: string;
  projectId: string;
  kind: PresenceKind;
  status: PresenceStatus;
  /** What the client asked for, in their words. */
  clientNote: string;
  /** The client's suggested day, `yyyy-mm-dd`, or null. */
  proposedOn: string | null;
  /** The studio's confirmed instant for a visit, ISO, or null. */
  scheduledAt: string | null;
  /** Where the studio handed over the recording, or '' when not delivered. */
  deliveryUrl: string;
  staffNote: string;
  createdAt: string;
  /** When the studio answered — null while the request is still open. */
  respondedAt: string | null;
  /** Who answered: the staff account's address, or '' while open. */
  respondedBy: string;
};

/** The one kind a track asks for — the other kind is not their situation. */
export function kindForTrack(isAbroadClient: boolean): PresenceKind {
  return isAbroadClient ? "walkthrough" : "visit";
}

/** Server-side eligibility: is this the caller's kind to ask for? */
export function mayAsk(isAbroadClient: boolean, kind: PresenceKind): boolean {
  return kindForTrack(isAbroadClient) === kind;
}

export function isOpen(p: PresenceRequest): boolean {
  return p.status === "requested";
}

/** One question at a time: a client waiting on an answer may not re-ask. */
export function hasOpen(list: PresenceRequest[], kind: PresenceKind): boolean {
  return list.some((p) => p.kind === kind && isOpen(p));
}

/**
 * The legal next states, per kind. Only 'requested' may move, and only
 * forward: scheduled for a visit, delivered for a recording, declined for
 * either — each exactly once.
 */
export function canRespond(
  kind: PresenceKind,
  from: PresenceStatus,
  to: PresenceStatus,
): boolean {
  if (from !== "requested") return false;
  if (kind === "visit") return to === "scheduled" || to === "declined";
  return to === "delivered" || to === "declined";
}

const time = (iso: string): number => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
};

/**
 * What the visit card leads with, in order: the next confirmed visit (soonest
 * first), else the question still waiting on the studio, else the most recent
 * visit already behind them. Declined requests never lead — a card whose
 * headline is "declined" is a punishment, not information; the form simply
 * returns so a new visit can be asked for.
 */
export function visitHeadline(
  list: PresenceRequest[],
  nowIso: string,
): PresenceRequest | null {
  const visits = list.filter((p) => p.kind === "visit");
  const now = time(nowIso);
  const upcoming = visits
    .filter((p) => p.status === "scheduled" && p.scheduledAt && time(p.scheduledAt) >= now)
    .sort((a, b) => time(a.scheduledAt ?? "") - time(b.scheduledAt ?? ""));
  if (upcoming[0]) return upcoming[0];
  const waiting = visits.filter(isOpen).sort((a, b) => time(b.createdAt) - time(a.createdAt));
  if (waiting[0]) return waiting[0];
  const past = visits
    .filter((p) => p.status === "scheduled")
    .sort((a, b) => time(b.scheduledAt ?? "") - time(a.scheduledAt ?? ""));
  return past[0] ?? null;
}

/** Newest first — how both the portal list and the console queue read. */
export function sortNewest(list: PresenceRequest[]): PresenceRequest[] {
  return [...list].sort((a, b) => time(b.createdAt) - time(a.createdAt));
}

/**
 * The console queue: what still needs an answer on top (newest of those
 * first), history below it. Staff open a project to act, not to reminisce.
 */
export function sortForQueue(list: PresenceRequest[]): PresenceRequest[] {
  const open = sortNewest(list.filter(isOpen));
  const rest = sortNewest(list.filter((p) => !isOpen(p)));
  return [...open, ...rest];
}

export function statusLabel(p: PresenceRequest): string {
  const what = p.kind === "visit" ? "Visit" : "Walkthrough";
  switch (p.status) {
    case "requested":
      return `${what} requested`;
    case "scheduled":
      return "Visit confirmed";
    case "delivered":
      return "Walkthrough delivered";
    case "declined":
      return `${what} declined`;
  }
}

export function statusTone(status: PresenceStatus): "stone" | "gold" | "maroon" | "live" {
  switch (status) {
    case "requested":
      return "gold";
    case "scheduled":
      return "maroon";
    case "delivered":
      return "live";
    case "declined":
      return "stone";
  }
}

/**
 * "Saturday 24 October 2026, 13:00" — an instant printed on one named clock.
 * A zone Intl cannot resolve prints nothing rather than something plausible:
 * a wrong time is worse than no time.
 */
export function formatInstant(iso: string | null, timeZone: string): string | null {
  if (!iso) return null;
  try {
    const d = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone,
    });
    const parts = d.formatToParts(new Date(iso));
    const pick = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? "";
    return `${pick("weekday")} ${pick("day")} ${pick("month")} ${pick("year")}, ${pick("hour")}:${pick("minute")}`;
  } catch {
    return null;
  }
}

/** `yyyy-mm-dd` → "Sat 24 Oct". Parsed at UTC noon so the day cannot drift. */
export function formatDay(day: string | null): string | null {
  if (!day) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${day}T12:00:00Z`));
  } catch {
    return null;
  }
}

/**
 * Today as the site knows it, `yyyy-mm-dd` — the floor under the date field.
 * At 01:00 in Nairobi it is already the next day there while UTC still says
 * yesterday, and a client must not be able to ask for a visit "today" that
 * has already happened where the visit would be.
 */
export function siteDay(nowIso: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: SITE_ZONE }).format(
      new Date(nowIso),
    );
  } catch {
    return nowIso.slice(0, 10);
  }
}

/** Strict `yyyy-mm-dd`: shaped right AND a day that exists (no 30 February). */
export function isDayInput(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/**
 * A `datetime-local` value (as the console's form produces it) as an instant,
 * read as Nairobi wall time. The studio answers in the site's clock — the
 * same clock the gate, the crew and the certificate keep.
 */
export function eatInstant(datetimeLocal: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(datetimeLocal)) return null;
  const d = new Date(`${datetimeLocal}:00+03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Only links a client can actually open reach a client. */
export function deliveryUrlOk(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
