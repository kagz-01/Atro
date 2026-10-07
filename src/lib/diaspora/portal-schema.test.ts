import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DecisionActionInput,
  MilestoneActionInput,
  PaymentActionInput,
  ProjectInput,
  ProjectRefInput,
} from "./portal-schema.ts";
import {
  TRACKS,
  TRACK_IDS,
  TRACK_LIST,
  isTrackId,
  normalisedWeights,
  paymentSchedule,
  paymentsTotal,
  programmeDays,
  stageWindows,
  trackById,
} from "./tracks.ts";

const BRIEF = {
  title: "4-bedroom maisonette",
  plot: "LR 11842/201",
  area: "312 m²",
  contractValue: 41_800_000,
  startDate: "2026-01-12",
  targetDate: "2026-12-18",
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe("ProjectInput", () => {
  it("accepts a bare brief and fills the optional fields", () => {
    const parsed = ProjectInput.parse({
      title: "House",
      contractValue: 9_000_000,
      startDate: "2026-01-01",
      targetDate: "2026-09-01",
    });
    assert.equal(parsed.plot, "");
    assert.equal(parsed.track, "construction", "the build track is the default");
    assert.equal(parsed.serviceSlug, "");
  });

  it("accepts every service track", () => {
    for (const track of TRACK_IDS) {
      const parsed = ProjectInput.parse({ ...BRIEF, track });
      assert.equal(parsed.track, track);
    }
  });

  it("rejects a track the studio does not run", () => {
    assert.equal(ProjectInput.safeParse({ ...BRIEF, track: "spacecraft" }).success, false);
  });

  it("trims whitespace rather than storing it in the record", () => {
    const parsed = ProjectInput.parse({ ...BRIEF, title: "  Maisonette  ", plot: "  LR 1 " });
    assert.equal(parsed.title, "Maisonette");
    assert.equal(parsed.plot, "LR 1");
  });

  it("rejects a title too short to identify the project", () => {
    assert.equal(ProjectInput.safeParse({ ...BRIEF, title: "ab" }).success, false);
  });

  it("rejects a contract value outside the workable range", () => {
    assert.equal(ProjectInput.safeParse({ ...BRIEF, contractValue: 1000 }).success, false);
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
  });
});

describe("action input validators", () => {
  it("require a project id on every action", () => {
    assert.equal(ProjectRefInput.safeParse({ projectId: "p1" }).success, true);
    assert.equal(ProjectRefInput.safeParse({ projectId: "" }).success, false);
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

describe("track registry", () => {
  it("covers design, construction, advisory, specialist and aftercare", () => {
    assert.deepEqual(TRACK_IDS.slice().sort(), [
      "advisory",
      "construction",
      "design",
      "maintenance",
      "renovation",
      "specialist",
    ]);
  });

  it("gives every track stages, a summary and services from the registry", () => {
    for (const track of TRACK_LIST) {
      assert.ok(track.stages.length >= 2, `${track.id} needs stages`);
      assert.ok(track.label.length > 0, `${track.id} needs a label`);
      assert.ok(track.summary.length > 10, `${track.id} needs a real summary`);
      assert.ok(track.services.length > 0, `${track.id} must name the services it covers`);
    }
  });

  it("names no stage or tranche twice", () => {
    for (const track of TRACK_LIST) {
      assert.equal(
        new Set(track.stages.map((s) => s.name)).size,
        track.stages.length,
        `${track.id} repeats a stage name`,
      );
      assert.equal(
        new Set(track.payments.map((p) => p.label)).size,
        track.payments.length,
        `${track.id} repeats a payment label`,
      );
    }
  });

  it("allocates exactly 100% of the contract across each track", () => {
    for (const track of TRACK_LIST) {
      const total = track.payments.reduce((sum, tranche) => sum + tranche.pct, 0);
      assert.equal(total, 100, `${track.id} allocates ${total}%`);
    }
  });

  it("gives every stage a positive weight", () => {
    for (const track of TRACK_LIST) {
      for (const stage of track.stages) {
        assert.ok(stage.weight > 0, `${track.id}: ${stage.name} has no weight`);
      }
    }
  });

  it("falls back to the build track for an unknown id", () => {
    assert.equal(isTrackId("construction"), true);
    assert.equal(isTrackId("nope"), false);
    assert.equal(trackById("nope").id, "construction");
  });
});

describe("programme planning", () => {
  it("normalises weights so each track covers the whole programme", () => {
    for (const track of TRACK_LIST) {
      const weights = normalisedWeights(track);
      assert.equal(weights.length, track.stages.length);
      const total = weights.reduce((sum, w) => sum + w, 0);
      assert.ok(Math.abs(total - 1) < 1e-9, `${track.id} weights sum to ${total}`);
    }
  });

  it("gives every stage in every track a dated window", () => {
    const start = new Date("2026-01-12T00:00:00Z");
    for (const track of TRACK_LIST) {
      const windows = stageWindows(track, start, 310, iso);
      assert.equal(windows.length, track.stages.length, `${track.id} stage count`);
      for (const window of windows) {
        assert.ok(window.spanDays >= 7, `${track.id}: a stage shorter than a week`);
        assert.match(window.start, /^\d{4}-\d{2}-\d{2}$/);
        assert.match(window.end, /^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("chains stages end to start with no gap or overlap", () => {
    const start = new Date("2026-01-12T00:00:00Z");
    for (const track of TRACK_LIST) {
      const windows = stageWindows(track, start, 310, iso);
      for (let i = 1; i < windows.length; i += 1) {
        assert.equal(
          windows[i]?.start,
          windows[i - 1]?.end,
          `${track.id}: stage ${i + 1} starts where stage ${i} ended`,
        );
      }
    }
  });

  it("never leaves the programme short, even when the floor trims stages", () => {
    const start = new Date("2026-01-12T00:00:00Z");
    for (const track of TRACK_LIST) {
      const windows = stageWindows(track, start, 60, iso);
      const last = windows[windows.length - 1];
      assert.ok(last, `${track.id} has a final stage`);
      assert.ok(
        new Date(`${last.end}T00:00:00Z`).getTime() >=
          start.getTime() + 60 * 86_400_000,
        `${track.id} is not left short`,
      );
    }
  });

  it("gives a shorter engagement a shorter programme", () => {
    const short = stageWindows(TRACKS.advisory, new Date("2026-01-01T00:00:00Z"), 90, iso);
    const long = stageWindows(TRACKS.construction, new Date("2026-01-01T00:00:00Z"), 340, iso);
    const totalOf = (w: { spanDays: number }[]) => w.reduce((sum, x) => sum + x.spanDays, 0);
    assert.ok(totalOf(short) < totalOf(long));
  });

  it("never proposes a programme shorter than a workable minimum", () => {
    assert.equal(programmeDays(new Date("2026-01-01"), new Date("2026-01-20")), 60);
    // 2026 is not a leap year: 1 Jan → 18 Dec is 351 days.
    assert.equal(programmeDays(new Date("2026-01-01"), new Date("2026-12-18")), 351);
  });
});

describe("payment planning", () => {
  it("produces tranches that sum exactly to the contract value, on every track", () => {
    for (const track of TRACK_LIST) {
      for (const value of [500_000, 9_000_000, 41_800_000, 137_500_000]) {
        assert.equal(
          paymentsTotal(track, value),
          value,
          `${track.id} tranches for ${value} must add back to the contract`,
        );
      }
    }
  });

  it("keeps every tranche a whole shilling and worth releasing", () => {
    for (const track of TRACK_LIST) {
      for (const tranche of paymentSchedule(track, 41_800_000)) {
        assert.equal(Number.isInteger(tranche.amount), true);
        assert.ok(tranche.amount > 0, `${track.id}: ${tranche.label} is worth releasing`);
      }
    }
  });

  it("never asks for most of the money before the work is done", () => {
    // A client should never have handed over half the fee before ATRO has
    // produced anything they can use.
    for (const track of TRACK_LIST) {
      for (const tranche of paymentSchedule(track, 41_800_000)) {
        assert.ok(
          tranche.amount <= 41_800_000 / 2,
          `${track.id}: ${tranche.label} takes more than half up front`,
        );
      }
    }
  });

  it("keeps advisory fees spread across the engagement, with money still due at the end", () => {
    const advisory = paymentSchedule(TRACKS.advisory, 4_000_000);
    assert.ok(advisory.length >= 3, "advisory is staged, not one fee");
    const last = advisory[advisory.length - 1];
    assert.ok(last && last.amount > 0, "the final report still has to be paid for");
    assert.ok((advisory[0]?.amount ?? 0) < 4_000_000 / 2, "no majority demanded up front");
  });
});