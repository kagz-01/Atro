import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { clientZone, isHomeZone, zonedClock } from "./tz.ts";

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
