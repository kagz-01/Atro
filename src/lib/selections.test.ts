import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  allowanceVerdict,
  canChoose,
  daysUntil,
  summariseAllowances,
  verdictLine,
  type Selection,
  type SelectionOption,
} from "./selections.ts";

const option = (over: Partial<SelectionOption> = {}): SelectionOption => ({
  id: "o1",
  label: "Stone-coated tile",
  description: "",
  supplier: "",
  price: 1_000_000,
  leadTime: "",
  recommended: false,
  ...over,
});

const selection = (over: Partial<Selection> = {}): Selection => ({
  id: "s1",
  ord: 1,
  title: "Roof covering",
  category: "Roof",
  stage: "",
  allowance: 1_000_000,
  deadline: "",
  status: "open",
  note: "",
  options: [option()],
  chosenOptionId: null,
  chosenAt: null,
  chosenBy: "",
  ...over,
});

describe("allowanceVerdict", () => {
  it("is empty until something is chosen", () => {
    const v = allowanceVerdict(selection());
    assert.equal(v.state, "none");
    assert.equal(v.chosen, null);
    assert.equal(v.needsVariation, false);
  });

  it("reads a choice exactly on the allowance as within", () => {
    const v = allowanceVerdict(selection({ chosenOptionId: "o1" }));
    assert.equal(v.state, "within");
    assert.equal(v.delta, 0);
    assert.equal(v.needsVariation, false);
  });

  it("flags a choice over the allowance, and asks for a variation", () => {
    const v = allowanceVerdict(
      selection({ allowance: 800_000, chosenOptionId: "o1" }),
    );
    assert.equal(v.state, "over");
    assert.equal(v.delta, 200_000);
    assert.equal(v.needsVariation, true);
  });

  it("reads a cheaper choice as under, and never as a variation", () => {
    const v = allowanceVerdict(
      selection({ allowance: 1_500_000, chosenOptionId: "o1" }),
    );
    assert.equal(v.state, "under");
    assert.equal(v.delta, -500_000);
    assert.equal(v.needsVariation, false);
  });

  it("ignores a chosen id that is not on this selection", () => {
    const v = allowanceVerdict(selection({ chosenOptionId: "missing" }));
    assert.equal(v.state, "none");
  });
});

describe("canChoose", () => {
  const now = new Date("2026-03-10T09:00:00Z");

  it("allows an open selection with no deadline", () => {
    assert.equal(canChoose(selection(), now).ok, true);
  });

  it("refuses once a choice is recorded", () => {
    const r = canChoose(selection({ status: "chosen" }), now);
    assert.equal(r.ok, false);
  });

  it("refuses once the studio has closed it", () => {
    const r = canChoose(selection({ status: "closed" }), now);
    assert.equal(r.ok, false);
  });

  it("refuses after the deadline and names it", () => {
    const r = canChoose(selection({ deadline: "2026-03-01" }), now);
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.match(r.reason, /2026-03-01/);
    assert.match(r.reason, /reopen/);
  });

  it("allows right up to the deadline", () => {
    assert.equal(canChoose(selection({ deadline: "2026-03-10" }), now).ok, true);
  });

  it("ignores an unparseable deadline rather than locking the client out", () => {
    assert.equal(canChoose(selection({ deadline: "end of the month" }), now).ok, true);
  });
});

describe("daysUntil", () => {
  const now = new Date("2026-03-10T09:00:00Z");

  it("counts whole days, and goes negative once past", () => {
    assert.equal(daysUntil("2026-03-13", now), 3);
    assert.equal(daysUntil("2026-03-08", now), -2);
  });

  it("is null when there is no usable deadline", () => {
    assert.equal(daysUntil("", now), null);
    assert.equal(daysUntil("soon", now), null);
  });
});

describe("summariseAllowances", () => {
  it("counts only chosen options as committed", () => {
    const s = summariseAllowances([
      selection({ id: "a", allowance: 1_000_000, status: "chosen", chosenOptionId: "o1" }),
      selection({ id: "b", allowance: 500_000, status: "open" }),
    ]);
    assert.equal(s.count, 2);
    assert.equal(s.chosen, 1);
    assert.equal(s.open, 1);
    assert.equal(s.allowance, 1_500_000);
    assert.equal(s.committed, 1_000_000);
    assert.equal(s.variance, -500_000);
  });

  it("reports a positive variance when choices ran over", () => {
    const s = summariseAllowances([
      selection({
        id: "a",
        allowance: 800_000,
        status: "chosen",
        chosenOptionId: "o1",
      }),
    ]);
    assert.equal(s.variance, 200_000);
  });

  it("lists what is still waiting on the client, in order", () => {
    const s = summariseAllowances([
      selection({ id: "b", ord: 2 }),
      selection({ id: "a", ord: 1 }),
    ]);
    assert.deepEqual(
      s.awaitingChoice.map((x) => x.id),
      ["a", "b"],
    );
  });

  it("handles no selections at all", () => {
    const s = summariseAllowances([]);
    assert.equal(s.count, 0);
    assert.equal(s.variance, 0);
    assert.deepEqual(s.awaitingChoice, []);
  });
});

describe("verdictLine", () => {
  it("is silent before a choice", () => {
    assert.equal(verdictLine(allowanceVerdict(selection())), "");
  });

  it("promises a variation when the choice is over", () => {
    const line = verdictLine(
      allowanceVerdict(selection({ allowance: 800_000, chosenOptionId: "o1" })),
    );
    assert.match(line, /KES 200,000 over the allowance/);
    assert.match(line, /variation to approve/);
  });

  it("does not promise a variation for a saving", () => {
    const line = verdictLine(
      allowanceVerdict(selection({ allowance: 2_000_000, chosenOptionId: "o1" })),
    );
    assert.doesNotMatch(line, /variation/);
    assert.match(line, /not being spent/);
  });
});
