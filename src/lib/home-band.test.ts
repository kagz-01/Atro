import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nextCallLine, type NextCall } from "./home-band.ts";

const call = (over: Partial<NextCall> = {}): NextCall => ({
  when: "Friday 14 March, 15:00 EAT",
  localTimeForYou: "Friday 14 March, 12:00 your time",
  at: "2025-03-14 15:00:00+03",
  ...over,
});

describe("nextCallLine", () => {
  it("the local home shows the site's own wording", () => {
    assert.equal(nextCallLine(call(), false), "Friday 14 March, 15:00 EAT");
  });

  it("the abroad home shows the converted line, never EAT first", () => {
    assert.equal(nextCallLine(call(), true), "Friday 14 March, 12:00 your time");
  });

  it("abroad falls back to the studio's wording when nothing was converted", () => {
    assert.equal(
      nextCallLine(call({ localTimeForYou: "To be scheduled" }), true),
      "Friday 14 March, 15:00 EAT",
    );
    assert.equal(nextCallLine(call({ localTimeForYou: "" }), true), "Friday 14 March, 15:00 EAT");
  });

  it("an unscheduled call renders empty so the band can say so", () => {
    assert.equal(
      nextCallLine(call({ when: "To be scheduled", localTimeForYou: "To be scheduled" }), false),
      "",
    );
    assert.equal(nextCallLine(call({ when: "", localTimeForYou: "" }), true), "");
  });
});
