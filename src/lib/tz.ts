// ATRO — clock arithmetic the client can check by looking at their watch.
//
// A call is scheduled in EAT because that is where the site is. The client may
// be anywhere: the same instant is 15:00 in Nairobi, 12:00 in London on a
// winter Friday and 13:00 the week the clocks change. The conversion is done
// here rather than stored, because a time written down in someone else's zone
// is wrong the moment their zone changes its mind — which is exactly how the
// demo data drifted (a hand-typed "13:00 your time" that was an hour off, and
// a Dubai conversion five hours out instead of one).

export type ZonedClock = {
  /** The wall clock in that zone, 24-hour — "12:00", midnight reads "00:00". */
  clock: string;
  /** Short zone name for that date — "GMT", "BST", "GST". */
  zone: string;
};

/**
 * The instant, shown as a wall clock in one IANA zone.
 * Returns null for a missing/unknown zone or an unparseable instant — a
 * wrong time must never be rendered as if it were right.
 */
export function zonedClock(iso: string, timeZone: string): ZonedClock | null {
  if (!iso || !timeZone) return null;
  try {
    const at = new Date(iso);
    if (Number.isNaN(at.getTime())) return null;
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    }).formatToParts(at);
    const hour = parts.find((p) => p.type === "hour")?.value ?? "";
    const minute = parts.find((p) => p.type === "minute")?.value ?? "";
    const zone = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    if (!hour || !minute || !zone) return null;
    return { clock: `${hour}:${minute}`, zone };
  } catch {
    // An unknown zone name throws RangeError out of Intl — refuse quietly.
    return null;
  }
}

/** Where the client's clock lives: their stated profile zone, else the project's. */
export function clientZone(profileTimezone: string, projectTz: string): string {
  return profileTimezone.trim() || projectTz.trim();
}

/** Nairobi runs on the site's clock — "your time" would just repeat theirs. */
export function isHomeZone(zone: string): boolean {
  return !zone || zone === "Africa/Nairobi";
}

/* ── quiet hours ── */

/**
 * Waking hours, read on the client's own clock: before 08:00 and from 20:00
 * there, an email or message waits for morning rather than landing on a phone
 * at three. The window is checked, never stored as a wall time, because a
 * time written down in someone else's zone is wrong the moment their zone
 * changes its mind — the same reason clock arithmetic lives in this file.
 *
 * In-app never waits (the portal is where they would read it), and neither
 * does the studio's own audience — only a client's push channels are held,
 * and only when the zone can be known. An unreadable zone sends now: a
 * delivery deferred on a guess is worse than one that arrives early.
 */
export const QUIET_BEFORE_HOUR = 8;
export const QUIET_UNTIL_HOUR = 20;

type Wall = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function parseIso(iso: string): Date | null {
  if (!iso) return null;
  const at = new Date(iso);
  return Number.isNaN(at.getTime()) ? null : at;
}

/** The instant as wall-clock parts in one IANA zone; null for unknown zones. */
function wallAt(at: Date, zone: string): Wall | null {
  if (!zone) return null;
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(at);
    const v = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? NaN);
    const wall: Wall = {
      year: v("year"),
      month: v("month"),
      day: v("day"),
      hour: v("hour"),
      minute: v("minute"),
      second: v("second"),
    };
    return Object.values(wall).every(Number.isFinite) ? wall : null;
  } catch {
    return null;
  }
}

/** How far that zone's wall clock sits ahead of UTC at this instant. */
function offsetMs(at: Date, zone: string): number | null {
  const wall = wallAt(at, zone);
  if (!wall) return null;
  return (
    Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second) -
    at.getTime()
  );
}

/** Inside the window on the client's clock. An unreadable input or zone reads as outside — send. */
export function insideQuietHours(iso: string, zone: string): boolean {
  const at = parseIso(iso);
  const wall = at ? wallAt(at, zone) : null;
  if (!wall) return false;
  return wall.hour >= QUIET_BEFORE_HOUR && wall.hour < QUIET_UNTIL_HOUR;
}

/**
 * The next 08:00 in that zone, as an instant. The wall time is converted in
 * two passes because the offset at the guessed instant can be a different
 * regime (DST) than the morning being aimed at; if the result does not read
 * back as 08:00 — or has already passed — one more day is tried, and failing
 * that it refuses rather than returning a wrong time.
 */
export function nextMorningAt(iso: string, zone: string): string | null {
  const at = parseIso(iso);
  const wall = at ? wallAt(at, zone) : null;
  if (!at || !wall) return null;
  const wallMs = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day + (wall.hour >= QUIET_BEFORE_HOUR ? 1 : 0),
    QUIET_BEFORE_HOUR,
  );
  const toInstant = (targetWallMs: number): number => {
    let instant = targetWallMs - (offsetMs(new Date(targetWallMs), zone) ?? 0);
    const refined = offsetMs(new Date(instant), zone);
    if (refined !== null) instant = targetWallMs - refined;
    return instant;
  };
  let instant = toInstant(wallMs);
  const readBack = wallAt(new Date(instant), zone);
  if (!readBack || readBack.hour !== QUIET_BEFORE_HOUR || instant <= at.getTime()) {
    instant = toInstant(wallMs + 24 * 60 * 60 * 1000);
    if (instant <= at.getTime()) return null;
  }
  return new Date(instant).toISOString();
}

/**
 * Null when the message may go now; otherwise the morning it waits for.
 * An unparseable zone yields null from both halves — send now.
 */
export function quietHoldUntil(iso: string, zone: string): string | null {
  if (insideQuietHours(iso, zone)) return null;
  return nextMorningAt(iso, zone);
}

/**
 * A timestamp for a delivery log row: "24 Oct 2026 · 10:00 BST", in the
 * zone the reader lives in. Home-zone stamps read EAT — the site's own
 * name for its clock — where Intl would only say "GMT+3".
 */
export function stampIn(iso: string, zone: string): string {
  const at = parseIso(iso);
  const tz = zone || "Africa/Nairobi";
  if (!at) return "";
  try {
    const date = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(at);
    const clock = zonedClock(iso, tz);
    if (!clock) return "";
    return `${date} · ${clock.clock} ${isHomeZone(zone) ? "EAT" : clock.zone}`;
  } catch {
    return "";
  }
}
