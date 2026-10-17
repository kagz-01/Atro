import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  approvalsHeadline,
  blocksTheProject,
  daysSince,
  feeOutstanding,
  isSettled,
  isStalled,
  needsChase,
  summariseApprovals,
  type Approval,
} from "./approvals.ts";

const NOW = new Date("2026-10-17T09:00:00Z");

const approval = (over: Partial<Approval> = {}): Approval => ({
  id: "a1",
  ord: 1,
  kind: "ncc",
  title: "Planning consent",
  authority: "Nairobi City County",
  reference: "",
  status: "submitted",
  submittedOn: "2026-10-01",
  decidedOn: "",
  feeAmount: 0,
  feePaid: 0,
  blocking: true,
  chasedOn: "",
  chaseNote: "",
  note: "",
  updatedAt: "2026-10-01T09:00:00Z",
  ...over,
});

describe("daysSince", () => {
  it("counts whole days, and is null without a usable date", () => {
    assert.equal(daysSince("2026-10-10T09:00:00Z", NOW), 7);
    assert.equal(daysSince("", NOW), null);
    assert.equal(daysSince("not a date", NOW), null);
  });
});

describe("isSettled", () => {
  it("an approval is done when it is approved or not required", () => {
    assert.equal(isSettled("approved"), true);
    assert.equal(isSettled("not_required"), true);
    assert.equal(isSettled("rejected"), false);
    assert.equal(isSettled("under_review"), false);
  });
});

describe("blocksTheProject", () => {
  it("a blocking approval that is not settled holds the build", () => {
    assert.equal(blocksTheProject(approval()), true);
  });

  it("a non-blocking approval holds nothing", () => {
    assert.equal(blocksTheProject(approval({ blocking: false })), false);
  });

  it("an approved approval holds nothing", () => {
    assert.equal(blocksTheProject(approval({ status: "approved" })), false);
  });

  it("one that is not required holds nothing", () => {
    assert.equal(blocksTheProject(approval({ status: "not_required" })), false);
  });
});

describe("isStalled", () => {
  it("is not stalled three weeks in", () => {
    assert.equal(isStalled(approval(), NOW), false);
  });

  it("is stalled after the window with no movement", () => {
    const old = approval({ updatedAt: "2026-09-20T09:00:00Z" });
    assert.equal(isStalled(old, NOW), true);
  });

  it("is not stalled once approved", () => {
    const old = approval({ updatedAt: "2026-09-20T09:00:00Z", status: "approved" });
    assert.equal(isStalled(old, NOW), false);
  });

  it("is not stalled if it has not been submitted yet", () => {
    const old = approval({ updatedAt: "2026-09-20T09:00:00Z", status: "not_started" });
    assert.equal(isStalled(old, NOW), false);
  });
});

describe("needsChase", () => {
  const stalled = approval({ updatedAt: "2026-09-20T09:00:00Z" });

  it("wants a chase when it has stalled and nobody has chased", () => {
    assert.equal(needsChase(stalled, NOW), true);
  });

  it("does not want a chase the same week it was chased", () => {
    const chased = approval({
      updatedAt: "2026-09-20T09:00:00Z",
      chasedOn: "2026-10-15",
    });
    assert.equal(needsChase(chased, NOW), false);
  });

  it("wants another chase a week later", () => {
    const chased = approval({
      updatedAt: "2026-09-20T09:00:00Z",
      chasedOn: "2026-10-01",
    });
    assert.equal(needsChase(chased, NOW), true);
  });

  it("does not want a chase when it is moving", () => {
    assert.equal(needsChase(approval(), NOW), false);
  });
});

describe("feeOutstanding", () => {
  it("is the amount not yet paid", () => {
    assert.equal(feeOutstanding(approval({ feeAmount: 250_000, feePaid: 100_000 })), 150_000);
  });

  it("is never negative", () => {
    assert.equal(feeOutstanding(approval({ feeAmount: 100_000, feePaid: 250_000 })), 0);
  });

  it("is nothing when there is no fee", () => {
    assert.equal(feeOutstanding(approval()), 0);
  });
});

describe("summariseApprovals", () => {
  it("handles an empty list", () => {
    const s = summariseApprovals([], NOW);
    assert.equal(s.count, 0);
    assert.equal(s.feesOutstanding, 0);
    assert.deepEqual(s.holding, []);
  });

  it("counts settled, in flight, and what is holding the build", () => {
    const s = summariseApprovals(
      [
        approval({ id: "a", status: "approved" }),
        approval({ id: "b", status: "under_review", blocking: true }),
        approval({ id: "c", status: "not_started", blocking: false }),
      ],
      NOW,
    );
    assert.equal(s.count, 3);
    assert.equal(s.settled, 1);
    assert.equal(s.inFlight, 2);
    assert.equal(s.blocking, 1);
    assert.deepEqual(s.holding, ["Planning consent"]);
  });

  it("adds up the fees and what is outstanding on them", () => {
    const s = summariseApprovals(
      [
        approval({ id: "a", feeAmount: 300_000, feePaid: 300_000 }),
        approval({ id: "b", feeAmount: 120_000, feePaid: 20_000 }),
      ],
      NOW,
    );
    assert.equal(s.feesTotal, 420_000);
    assert.equal(s.feesPaid, 320_000);
    assert.equal(s.feesOutstanding, 100_000);
  });

  it("counts the ones worth chasing", () => {
    const s = summariseApprovals(
      [
        approval({ id: "a", updatedAt: "2026-09-20T09:00:00Z" }),
        approval({ id: "b" }),
      ],
      NOW,
    );
    assert.equal(s.stalled, 1);
    assert.equal(s.toChase, 1);
  });
});

describe("approvalsHeadline", () => {
  it("says nothing when there is nothing", () => {
    assert.match(approvalsHeadline(summariseApprovals([], NOW)), /Nothing is being chased/);
  });

  it("names what is holding the build", () => {
    const s = summariseApprovals(
      [approval({ title: "Planning consent", blocking: true })],
      NOW,
    );
    const line = approvalsHeadline(s);
    assert.match(line, /holding the build/);
    assert.match(line, /Planning consent/);
  });

  it("says when everything is in hand", () => {
    const s = summariseApprovals([approval({ status: "approved" })], NOW);
    assert.match(approvalsHeadline(s), /Every approval is in hand/);
  });

  it("says when nothing is holding it up but work is in flight", () => {
    const s = summariseApprovals(
      [approval({ blocking: false, status: "under_review" })],
      NOW,
    );
    assert.match(approvalsHeadline(s), /Nothing is holding the build/);
  });
});
