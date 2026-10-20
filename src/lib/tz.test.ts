import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clientZone,
  insideQuietHours,
  isHomeZone,
  nextMorningAt,
  quietHoldUntil,
  stampIn,
  zonedClock,
} from "./tz.ts";

// 15:00 in Nairobi (EAT, UTC+3) on a Friday in March — the seed's own call time.
const CALL = "2025-03-14T15:00:00+03:00";

describe("zonedClock", () => {
  it("converts to London in winter, one hour behind EAT", () => {
    assert.deepEqual(zonedClock(CALL, "Europe/London"), { clock: "12:00", zone: "GMT" });
  });

  it("converts to London in summer — the clocks change, the instant does not", () => {
    const july = "2025-07-14T15:00:00+03:00";
    assert.deepEqual(zonedClock(july, "Europe/London"), { clock: "13:00", zone: "BST" });
  });

  it("converts to Dubai, one hour ahead of EAT", () => {
    assert.deepEqual(zonedClock(CALL, "Asia/Dubai"), { clock: "16:00", zone: "GST" });
  });

  it("renders Nairobi in its own zone", () => {
    assert.deepEqual(zonedClock(CALL, "Africa/Nairobi"), { clock: "15:00", zone: "GMT+3" });
  });

  it("reads midnight as 00:00, never 24:00", () => {
    const londonMidnight = "2025-03-14T03:00:00+03:00";
    assert.equal(zonedClock(londonMidnight, "Europe/London")?.clock, "00:00");
  });

  it("refuses an unknown zone instead of guessing", () => {
    assert.equal(zonedClock(CALL, "Mars/Olympus"), null);
  });

  it("refuses an unparseable instant instead of rendering epoch", () => {
    assert.equal(zonedClock("next Tuesday", "Europe/London"), null);
  });

  it("refuses empty input", () => {
    assert.equal(zonedClock("", "Europe/London"), null);
    assert.equal(zonedClock(CALL, ""), null);
  });
});

describe("clientZone", () => {
  it("prefers the profile's stated zone", () => {
    assert.equal(clientZone("Europe/London", "Africa/Nairobi"), "Europe/London");
  });

  it("falls back to the project's zone", () => {
    assert.equal(clientZone("", "Asia/Dubai"), "Asia/Dubai");
  });

  it("trims both", () => {
    assert.equal(clientZone("  ", " Europe/London "), "Europe/London");
  });
});

describe("isHomeZone", () => {
  it("treats Nairobi and a missing zone as the site's own clock", () => {
    assert.equal(isHomeZone("Africa/Nairobi"), true);
    assert.equal(isHomeZone(""), true);
  });

  it("knows any other zone is not home", () => {
    assert.equal(isHomeZone("Europe/London"), false);
  });
});

describe("insideQuietHours", () => {
  it("reads Nairobi's working day: 08:00 in, 20:00 out", () => {
    assert.equal(insideQuietHours("2025-03-14T07:59:00+03:00", "Africa/Nairobi"), false);
    assert.equal(insideQuietHours("2025-03-14T08:00:00+03:00", "Africa/Nairobi"), true);
    assert.equal(insideQuietHours("2025-03-14T12:00:00+03:00", "Africa/Nairobi"), true);
    assert.equal(insideQuietHours("2025-03-14T19:59:00+03:00", "Africa/Nairobi"), true);
    assert.equal(insideQuietHours("2025-03-14T20:00:00+03:00", "Africa/Nairobi"), false);
  });

  it("reads London's clock, summer and winter both", () => {
    assert.equal(insideQuietHours("2025-07-14T19:00:00+01:00", "Europe/London"), true);
    assert.equal(insideQuietHours("2025-07-14T21:00:00+01:00", "Europe/London"), false);
    assert.equal(insideQuietHours("2025-03-14T19:00:00+00:00", "Europe/London"), true);
  });

  it("sends rather than guesses when the zone or instant is unreadable", () => {
    assert.equal(insideQuietHours("2025-03-14T12:00:00+03:00", "Mars/Olympus"), false);
    assert.equal(insideQuietHours("next Tuesday", "Europe/London"), false);
    assert.equal(insideQuietHours("2025-03-14T12:00:00+03:00", ""), false);
  });
});

describe("nextMorningAt", () => {
  it("before the window, the morning is the same day", () => {
    assert.equal(
      nextMorningAt("2025-03-14T03:00:00+03:00", "Africa/Nairobi"),
      "2025-03-14T05:00:00.000Z",
    );
  });

  it("inside the window, the next morning is tomorrow", () => {
    assert.equal(
      nextMorningAt("2025-03-14T09:00:00+03:00", "Africa/Nairobi"),
      "2025-03-15T05:00:00.000Z",
    );
  });

  it("lands on London's 08:00 in summer, an hour behind EAT's", () => {
    assert.equal(
      nextMorningAt("2025-07-14T22:00:00+01:00", "Europe/London"),
      "2025-07-15T07:00:00.000Z",
    );
  });

  it("crosses the night the clocks go back — 08:00 reads GMT, not BST", () => {
    // London leaves BST at 02:00 on 26 October 2025; the morning after that
    // night is still 08:00 on the wall, now one UTC hour later.
    assert.equal(
      nextMorningAt("2025-10-25T23:00:00+01:00", "Europe/London"),
      "2025-10-26T08:00:00.000Z",
    );
  });

  it("keeps half-hour zones honest", () => {
    assert.equal(
      nextMorningAt("2025-03-14T03:00:00+05:30", "Asia/Kolkata"),
      "2025-03-14T02:30:00.000Z",
    );
  });

  it("refuses when the zone or instant cannot be read", () => {
    assert.equal(nextMorningAt("2025-03-14T03:00:00+03:00", "Mars/Olympus"), null);
    assert.equal(nextMorningAt("tomorrow", "Europe/London"), null);
    assert.equal(nextMorningAt("2025-03-14T03:00:00+03:00", ""), null);
  });
});

describe("quietHoldUntil", () => {
  it("returns null inside the window — the message may go now", () => {
    assert.equal(quietHoldUntil("2025-07-14T12:00:00+01:00", "Europe/London"), null);
  });

  it("returns the client's next morning when it is the small hours there", () => {
    assert.equal(
      quietHoldUntil("2025-03-14T22:00:00+03:00", "Africa/Nairobi"),
      "2025-03-15T05:00:00.000Z",
    );
  });

  it("returns null for an unreadable zone — never hold on a guess", () => {
    assert.equal(quietHoldUntil("2025-03-14T22:00:00+03:00", "Mars/Olympus"), null);
  });
});

describe("stampIn", () => {
  it("stamps a home-zone row in EAT, the site's own name for its clock", () => {
    assert.equal(stampIn(CALL, "Africa/Nairobi"), "14 Mar 2025 · 15:00 EAT");
  });

  it("stamps in the reader's own zone", () => {
    assert.equal(stampIn(CALL, "Europe/London"), "14 Mar 2025 · 12:00 GMT");
    assert.equal(stampIn("2025-07-14T15:00:00+03:00", "Europe/London"), "14 Jul 2025 · 13:00 BST");
  });

  it("falls back to the site's clock when no zone is given", () => {
    assert.equal(stampIn(CALL, ""), "14 Mar 2025 · 15:00 EAT");
  });

  it("returns empty rather than a stamp it cannot trust", () => {
    assert.equal(stampIn("", "Europe/London"), "");
    assert.equal(stampIn("next Tuesday", "Europe/London"), "");
    assert.equal(stampIn(CALL, "Mars/Olympus"), "");
  });
});
