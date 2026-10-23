import assert from "node:assert/strict";
import { test } from "node:test";
import {
  lifecycleTransitionError,
  nextProjectLifecycleState,
  portfolioLifecycleLabel,
  type ProjectLifecycleState,
} from "./project-lifecycle.ts";

const ready = {
  allMilestonesComplete: true,
  defectPeriodEnd: "2026-10-01",
  defectPeriodExpired: true,
  openDefects: 0,
  retentionHeld: 0,
};

test("lifecycle follows the defined forward sequence", () => {
  const states: ProjectLifecycleState[] = [
    "pre_construction",
    "active_build",
    "handover",
    "defects_period",
    "closed",
    "archived",
  ];
  assert.deepEqual(states.slice(0, -1).map(nextProjectLifecycleState), states.slice(1));
  assert.equal(nextProjectLifecycleState("archived"), null);
});

test("a complete build is not labelled as handed over or closed", () => {
  assert.equal(portfolioLifecycleLabel("active_build", true), "Build complete");
  assert.equal(portfolioLifecycleLabel("handover", true), "Handover");
  assert.equal(portfolioLifecycleLabel("closed", true), "Closed");
});

test("handover requires every tracked milestone to be complete", () => {
  assert.match(
    lifecycleTransitionError({
      ...ready,
      from: "active_build",
      to: "handover",
      allMilestonesComplete: false,
    }) ?? "",
    /Complete all tracked milestones/,
  );
});

test("defects period requires its end date", () => {
  assert.match(
    lifecycleTransitionError({
      ...ready,
      from: "handover",
      to: "defects_period",
      defectPeriodEnd: "",
    }) ?? "",
    /Set the defect-period end date/,
  );
  assert.match(
    lifecycleTransitionError({
      ...ready,
      from: "handover",
      to: "defects_period",
      defectPeriodExpired: true,
    }) ?? "",
    /must be in the future/,
  );
});

test("close-out requires an expired defect period, no open defects, and no retention", () => {
  const close = (overrides: Partial<typeof ready> = {}) =>
    lifecycleTransitionError({
      ...ready,
      ...overrides,
      from: "defects_period",
      to: "closed",
    });

  assert.match(close({ defectPeriodExpired: false }) ?? "", /must have ended/);
  assert.match(close({ openDefects: 1 }) ?? "", /open defect reports/);
  assert.match(close({ retentionHeld: 1 }) ?? "", /remaining retention/);
  assert.equal(close(), null);
});

test("skipping a lifecycle state is rejected", () => {
  assert.match(
    lifecycleTransitionError({
      ...ready,
      from: "active_build",
      to: "closed",
    }) ?? "",
    /cannot move to Closed/,
  );
});
