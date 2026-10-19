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
