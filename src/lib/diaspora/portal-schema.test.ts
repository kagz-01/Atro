import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DecisionActionInput,
  MilestoneActionInput,
  PAYMENT_PLAN,
  PaymentActionInput,
  ProjectInput,
  ProjectRefInput,
  STAGE_WEIGHTS,
  daysBetween,
  paymentsTotal,
  planPayments,
  planStages,
} from "./portal-schema.ts";

const BRIEF = {
  title: "4-bedroom maisonette",
  plot: "LR 11842/201",
  area: "312 m²",
  contractValue: 41_800_000,
  startDate: "2026-01-12",
  targetDate: "2026-12-18",
  clientCity: "London",
  clientTz: "Europe/London",
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe("ProjectInput", () => {
  it("accepts a complete brief and fills the optional fields", () => {
    const parsed = ProjectInput.parse({
      title: "House",
      contractValue: 9_000_000,
      startDate: "2026-01-01",
      targetDate: "2026-09-01",
    });
    assert.equal(parsed.plot, "");
    assert.equal(parsed.clientCity, "");
    assert.equal(parsed.clientTz, "");
  });

  it("trims whitespace rather than storing it in the record", () => {
    const parsed = ProjectInput.parse({ ...BRIEF, title: "  Maisonette  ", plot: "  LR 1 " });
    assert.equal(parsed.title, "Maisonette");
    assert.equal(parsed.plot, "LR 1");
  });

  it("rejects a title too short to identify the project", () => {
    assert.equal(ProjectInput.safeParse({ ...BRIEF, title: "ab" }).success, false);
  });

  it("rejects a contract value below the practical minimum", () => {
    assert.equal(ProjectInput.safeParse({ ...BRIEF, contractValue: 1000 }).success, false);
  });

  it("rejects a non-integer or absurd contract value", () => {
    assert.equal(ProjectInput.safeParse({ ...BRIEF, contractValue: 41_800_000.5 }).success, false);
    assert.equal(
      ProjectInput.safeParse({ ...BRIEF, contractValue: 900_000_000_000 }).success,
      false,
    );
  });

  it("rejects a date that is not ISO calendar format", () => {
    assert.equal(ProjectInput.safeParse({ ...BRIEF, startDate: "05/01/2026" }).success, false);
  });

  it("rejects a field that overruns its column", () => {
    assert.equal(ProjectInput.safeParse({ ...BRIEF, plot: "x".repeat(201) }).success, false);
    assert.equal(ProjectInput.safeParse({ ...BRIEF, title: "x".repeat(121) }).success, false);
  });
});

describe("action input validators", () => {
  it("require a project id on every action", () => {
    assert.equal(ProjectRefInput.safeParse({ projectId: "p1" }).success, true);
    assert.equal(ProjectRefInput.safeParse({ projectId: "" }).success, false);
    assert.equal(ProjectRefInput.safeParse({}).success, false);
  });

  it("pair the milestone and payment ids with the project id", () => {
    assert.equal(
      MilestoneActionInput.safeParse({ projectId: "p1", milestoneId: "m1" }).success,
      true,
    );
    assert.equal(MilestoneActionInput.safeParse({ projectId: "p1" }).success, false);
    assert.equal(
      PaymentActionInput.safeParse({ projectId: "p1", paymentId: "pay1" }).success,
      true,
    );
    assert.equal(PaymentActionInput.safeParse({ projectId: "p1" }).success, false);
  });

  it("bound the length of a recorded decision", () => {
    assert.equal(
      DecisionActionInput.safeParse({ projectId: "p1", decisionId: "d1", choice: "Tile" })
        .success,
      true,
    );
    assert.equal(
      DecisionActionInput.safeParse({
        projectId: "p1",
        decisionId: "d1",
        choice: "x".repeat(201),
      }).success,
      false,
    );
  });
});

describe("programme planning", () => {
  it("weights the nine stages to the whole programme", () => {
    const total = STAGE_WEIGHTS.reduce((sum, w) => sum + w, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `weights sum to ${total}`);
    assert.equal(STAGE_WEIGHTS.length, 9);
  });

  it("gives every stage a window, and each at least a week", () => {
    const windows = planStages(new Date("2026-01-12T00:00:00Z"), 310, 9, iso);
    assert.equal(windows.length, 9);
    for (const w of windows) {
      assert.ok(w.spanDays >= 7, `stage span ${w.spanDays} days`);
      assert.match(w.start, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(w.end, /^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("chains the stages end to start with no gap or overlap", () => {
    const windows = planStages(new Date("2026-01-12T00:00:00Z"), 310, 9, iso);
    for (let i = 1; i < windows.length; i += 1) {
      assert.equal(
        windows[i]?.start,
        windows[i - 1]?.end,
        `stage ${i + 1} starts where stage ${i} ended`,
      );
    }
  });

  it("covers at least the programme even when rounding trims each stage", () => {
    const windows = planStages(new Date("2026-01-12T00:00:00Z"), 90, 9, iso);
    const last = windows[windows.length - 1];
    assert.ok(last, "a final stage exists");
    assert.ok(
      new Date(`${last.end}T00:00:00Z`).getTime() >=
        new Date("2026-01-12T00:00:00Z").getTime() + 90 * 86_400_000,
      "the programme is not left short",
    );
  });

  it("never proposes a programme shorter than a workable minimum", () => {
    assert.equal(daysBetween(new Date("2026-01-01"), new Date("2026-01-20")), 60);
    // 2026 is not a leap year: 1 Jan → 18 Dec is 351 days.
    assert.equal(daysBetween(new Date("2026-01-01"), new Date("2026-12-18")), 351);
  });
});

describe("payment planning", () => {
  it("allocates the full contract value across the tranches", () => {
    assert.equal(PAYMENT_PLAN.reduce((sum, p) => sum + p.pct, 0), 100);
  });

  it("produces tranches that sum exactly to the contract value", () => {
    for (const value of [500_000, 9_000_000, 41_800_000, 137_500_000]) {
      assert.equal(
        paymentsTotal(value),
        value,
        `tranches for ${value} must add back to the contract`,
      );
    }
  });

  it("keeps every tranche a whole shilling", () => {
    for (const tranche of planPayments(41_800_000)) {
      assert.equal(Number.isInteger(tranche.amount), true);
      assert.ok(tranche.amount > 0, `${tranche.label} is worth releasing`);
    }
  });

  it("spreads the money rather than front-loading it", () => {
    const tranches = planPayments(41_800_000);
    const first = tranches[0];
    assert.ok(first, "a first tranche exists");
    const biggest = Math.max(...tranches.map((t) => t.amount));
    assert.ok(
      first.amount < biggest,
      "no single mobilisation payment carries the schedule",
    );
  });
});