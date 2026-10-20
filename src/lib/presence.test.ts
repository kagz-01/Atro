import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canRespond,
  deliveryUrlOk,
  eatInstant,
  formatDay,
  formatInstant,
  hasOpen,
  isDayInput,
  kindForTrack,
  mayAsk,
  sortForQueue,
  sortNewest,
  siteDay,
  statusLabel,
  statusTone,
  visitHeadline,
  type PresenceRequest,
  type PresenceStatus,
} from "./presence.ts";

const req = (over: Partial<PresenceRequest> = {}): PresenceRequest => ({
  id: "p1",
  projectId: "proj",
  kind: "visit",
  status: "requested",
  clientNote: "",
  proposedOn: null,
  scheduledAt: null,
  deliveryUrl: "",
  staffNote: "",
  createdAt: "2026-10-01T09:00:00.000Z",
  respondedAt: null,
  respondedBy: "",
  ...over,
});

describe("tracks", () => {
  it("local asks to visit, abroad asks for a walkthrough", () => {
    assert.equal(kindForTrack(false), "visit");
    assert.equal(kindForTrack(true), "walkthrough");
    assert.equal(mayAsk(false, "visit"), true);
    assert.equal(mayAsk(false, "walkthrough"), false);
    assert.equal(mayAsk(true, "walkthrough"), true);
    assert.equal(mayAsk(true, "visit"), false);
  });

  it("blocks a second ask while one is waiting", () => {
    assert.equal(hasOpen([req({ kind: "visit" })], "visit"), true);
    assert.equal(hasOpen([req({ kind: "visit" })], "walkthrough"), false);
    assert.equal(hasOpen([req({ kind: "visit", status: "declined" })], "visit"), false);
    assert.equal(hasOpen([], "visit"), false);
  });
});

describe("canRespond", () => {
  it("answers each kind exactly once, and only from requested", () => {
    assert.equal(canRespond("visit", "requested", "scheduled"), true);
    assert.equal(canRespond("visit", "requested", "declined"), true);
    assert.equal(canRespond("visit", "requested", "delivered"), false);
    assert.equal(canRespond("walkthrough", "requested", "delivered"), true);
    assert.equal(canRespond("walkthrough", "requested", "declined"), true);
    assert.equal(canRespond("walkthrough", "requested", "scheduled"), false);
  });

  it("never re-answers an answered request", () => {
    const terminal: PresenceStatus[] = ["scheduled", "delivered", "declined"];
    for (const from of terminal) {
      for (const to of ["scheduled", "delivered", "declined"] as PresenceStatus[]) {
        assert.equal(canRespond("visit", from, to), false, `${from} → ${to}`);
        assert.equal(canRespond("walkthrough", from, to), false, `${from} → ${to}`);
      }
    }
  });
});

describe("visitHeadline", () => {
  const now = "2026-10-20T09:00:00.000Z";
  const future = "2026-10-24T10:00:00.000Z";
  const later = "2026-11-01T10:00:00.000Z";
  const past = "2026-10-10T10:00:00.000Z";

  it("leads with the next confirmed visit, soonest first", () => {
    const out = visitHeadline(
      [
        req({ id: "later", status: "scheduled", scheduledAt: later }),
        req({ id: "waiting" }),
        req({ id: "soon", status: "scheduled", scheduledAt: future }),
      ],
      now,
    );
    assert.equal(out?.id, "soon");
  });

  it("prefers a waiting question over a visit already behind them", () => {
    const out = visitHeadline(
      [req({ id: "old", status: "scheduled", scheduledAt: past }), req({ id: "waiting" })],
      now,
    );
    assert.equal(out?.id, "waiting");
  });

  it("falls back to the most recent past visit, and to null without one", () => {
    const out = visitHeadline(
      [
        req({ id: "older", status: "scheduled", scheduledAt: "2026-09-01T10:00:00.000Z" }),
        req({ id: "newer-past", status: "scheduled", scheduledAt: past }),
      ],
      now,
    );
    assert.equal(out?.id, "newer-past");
    assert.equal(visitHeadline([req({ status: "declined" })], now), null);
    assert.equal(visitHeadline([], now), null);
  });

  it("ignores walkthroughs entirely", () => {
    const out = visitHeadline(
      [req({ kind: "walkthrough", status: "delivered", deliveryUrl: "https://x.test/v" })],
      now,
    );
    assert.equal(out, null);
  });
});

describe("ordering", () => {
  it("sorts newest first", () => {
    const out = sortNewest([
      req({ id: "a", createdAt: "2026-10-01T09:00:00.000Z" }),
      req({ id: "b", createdAt: "2026-10-18T09:00:00.000Z" }),
      req({ id: "c", createdAt: "2026-10-09T09:00:00.000Z" }),
    ]);
    assert.deepEqual(out.map((p) => p.id), ["b", "c", "a"]);
  });

  it("puts what the console must answer on top", () => {
    const out = sortForQueue([
      req({ id: "old-open", createdAt: "2026-10-01T09:00:00.000Z" }),
      req({ id: "done-new", status: "scheduled", scheduledAt: "2026-11-01T10:00:00.000Z", createdAt: "2026-10-19T09:00:00.000Z" }),
      req({ id: "new-open", createdAt: "2026-10-18T09:00:00.000Z" }),
    ]);
    assert.deepEqual(out.map((p) => p.id), ["new-open", "old-open", "done-new"]);
  });
});

describe("labels and tones", () => {
  it("names the outcome the client actually reads", () => {
    assert.equal(statusLabel(req({ kind: "visit" })), "Visit requested");
    assert.equal(statusLabel(req({ kind: "visit", status: "scheduled" })), "Visit confirmed");
    assert.equal(statusLabel(req({ kind: "walkthrough" })), "Walkthrough requested");
    assert.equal(
      statusLabel(req({ kind: "walkthrough", status: "delivered" })),
      "Walkthrough delivered",
    );
    assert.equal(statusLabel(req({ kind: "visit", status: "declined" })), "Visit declined");
  });

  it("maps states to tones", () => {
    assert.equal(statusTone("requested"), "gold");
    assert.equal(statusTone("scheduled"), "maroon");
    assert.equal(statusTone("delivered"), "live");
    assert.equal(statusTone("declined"), "stone");
  });
});

describe("dates", () => {
  it("prints an instant on the clock it was given", () => {
    assert.equal(
      formatInstant("2026-10-24T10:00:00+03:00", "Africa/Nairobi"),
      "Saturday 24 October 2026, 10:00",
    );
    // The same instant on a London clock in winter reads 07:00 GMT — the
    // conversion, not the zone's name, is the thing under test.
    assert.equal(
      formatInstant("2026-01-24T10:00:00+03:00", "Europe/London"),
      "Saturday 24 January 2026, 07:00",
    );
    assert.equal(formatInstant(null, "Africa/Nairobi"), null);
    assert.equal(formatInstant("not a date", "Africa/Nairobi"), null);
  });

  it("prints a proposed day without letting the zone move it", () => {
    assert.equal(formatDay("2026-10-24"), "Sat 24 Oct");
    assert.equal(formatDay(null), null);
  });

  it("floors the date field on the site's today, not UTC's", () => {
    // 22:30 UTC is already 01:30 the next morning in Nairobi.
    assert.equal(siteDay("2026-10-24T22:30:00Z"), "2026-10-25");
    assert.equal(siteDay("2026-10-24T10:00:00Z"), "2026-10-24");
  });

  it("accepts only days that exist", () => {
    assert.equal(isDayInput("2026-10-24"), true);
    assert.equal(isDayInput("2026-02-30"), false);
    assert.equal(isDayInput("24/10/2026"), false);
    assert.equal(isDayInput(""), false);
  });

  it("reads a console datetime as Nairobi wall time", () => {
    // 10:00 at the gate is 07:00 UTC.
    assert.equal(eatInstant("2026-10-24T10:00"), "2026-10-24T07:00:00.000Z");
    assert.equal(eatInstant("2026-10-24"), null);
    assert.equal(eatInstant("24/10/2026 10:00"), null);
  });
});

describe("deliveryUrlOk", () => {
  it("accepts only links a client can open", () => {
    assert.equal(deliveryUrlOk("https://drive.google.com/abc"), true);
    assert.equal(deliveryUrlOk("  http://atro.ke/clip.mp4 "), true);
    assert.equal(deliveryUrlOk("ftp://atro.ke/clip.mp4"), false);
    assert.equal(deliveryUrlOk("drive.google.com/abc"), false);
    assert.equal(deliveryUrlOk(""), false);
  });
});
