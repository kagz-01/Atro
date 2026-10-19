import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  awaitingClient,
  awaitingStudio,
  canTransition,
  daysLeft,
  daysToRenewal,
  fmtDate,
  inPeriod,
  isStalled,
  isOpen,
  retainerLine,
  retainerState,
  statusLabel,
  summariseDefects,
  type Defect,
  type Retainer,
} from "./defects.ts";

const TODAY = new Date("2026-10-19T09:00:00Z");

const defect = (over: Partial<Defect> = {}): Defect => ({
  id: "d1",
  projectId: "p1",
  ord: 1,
  title: "Crack above the ensuite door",
  detail: "Hairline, on the reveal.",
  area: "Ensuite",
  severity: "minor",
  status: "reported",
  reportedOn: "2026-10-10",
  acceptedOn: "",
  fixedOn: "",
  verifiedOn: "",
  rejectReason: "",
  note: "",
  reportedBy: "client",
  updatedAt: "2026-10-10T10:00:00Z",
  ...over,
});

const retainer = (over: Partial<Retainer> = {}): Retainer => ({
  projectId: "p1",
  name: "Annual care",
  covers: "Roof, gutters, waterproofing, two visits a year.",
  annualAmount: 150000,
  renewsOn: "2026-12-14",
  status: "active",
  lastPaidOn: "2025-12-14",
  ...over,
});

describe("status transitions", () => {
  it("lets the studio accept a fresh report", () => {
    assert.equal(canTransition("reported", "accepted"), true);
    assert.equal(canTransition("reported", "rejected"), true);
  });

  it("does not let the studio skip straight to fixed", () => {
    assert.equal(canTransition("reported", "fixed"), false);
    assert.equal(canTransition("reported", "verified"), false);
  });

  it("hands the close to the person who reported it", () => {
    assert.equal(canTransition("fixed", "verified"), true);
    assert.equal(canTransition("fixed", "in_progress"), true);
  });

  it("does not let the studio close its own homework", () => {
    assert.equal(canTransition("accepted", "verified"), false);
    assert.equal(canTransition("in_progress", "verified"), false);
  });

  it("allows a rejection to be reconsidered", () => {
    assert.equal(canTransition("rejected", "accepted"), true);
  });

  it("leaves a closed defect closed — a recurrence is a new report", () => {
    assert.equal(canTransition("verified", "accepted"), false);
    assert.equal(canTransition("verified", "in_progress"), false);
  });

  it("refuses a move to the same status", () => {
    assert.equal(canTransition("accepted", "accepted"), false);
  });
});

describe("who it is waiting on", () => {
  it("treats everything but closed and rejected as open", () => {
    assert.equal(isOpen("reported"), true);
    assert.equal(isOpen("in_progress"), true);
    assert.equal(isOpen("fixed"), true);
    assert.equal(isOpen("verified"), false);
    assert.equal(isOpen("rejected"), false);
  });

  it("separates the two desks", () => {
    assert.equal(awaitingStudio("reported"), true);
    assert.equal(awaitingStudio("fixed"), false);
    assert.equal(awaitingClient("fixed"), true);
    assert.equal(awaitingClient("accepted"), false);
  });
});

describe("the defect period", () => {
  it("counts days remaining", () => {
    assert.equal(daysLeft("2026-10-29", TODAY), 11);
  });

  it("never goes negative — a closed period reads as closed", () => {
    assert.equal(daysLeft("2026-09-01", TODAY), 0);
  });

  it("is null when the studio has not set one", () => {
    assert.equal(daysLeft("", TODAY), null);
  });

  it("counts a report on the last day as in period", () => {
    assert.equal(inPeriod("2026-10-29", "2026-10-29"), true);
  });

  it("counts the day after as out of period", () => {
    assert.equal(inPeriod("2026-10-30", "2026-10-29"), false);
  });

  it("treats no period as open rather than blocking a report", () => {
    assert.equal(inPeriod("2026-10-30", ""), true);
  });
});

describe("isStalled", () => {
  it("flags a report nobody has touched for two weeks", () => {
    assert.equal(isStalled(defect({ updatedAt: "2026-09-01T10:00:00Z" }), TODAY), true);
  });

  it("leaves a report from this morning alone", () => {
    assert.equal(isStalled(defect({ updatedAt: "2026-10-19T08:00:00Z" }), TODAY), false);
  });

  it("leaves work alone that moved yesterday", () => {
    assert.equal(
      isStalled(defect({ status: "in_progress", updatedAt: "2026-10-18T10:00:00Z" }), TODAY),
      false,
    );
  });

  it("flags work that stopped moving — accepted a month ago, still open", () => {
    assert.equal(
      isStalled(defect({ status: "in_progress", updatedAt: "2026-09-01T10:00:00Z" }), TODAY),
      true,
    );
  });

  it("does not flag a closed or rejected item", () => {
    assert.equal(isStalled(defect({ status: "verified" }), TODAY), false);
    assert.equal(isStalled(defect({ status: "rejected" }), TODAY), false);
  });
});

describe("summariseDefects", () => {
  it("names the deadline when nothing is open", () => {
    const s = summariseDefects([defect({ status: "verified" })], "2026-11-01", TODAY);
    assert.equal(s.open, 0);
    assert.match(s.headline, /Nothing open/);
    assert.match(s.headline, /days left/);
  });

  it("puts a fix waiting on the client first", () => {
    const s = summariseDefects(
      [defect({ status: "fixed" }), defect({ id: "d2", status: "accepted" })],
      "2026-11-01",
      TODAY,
    );
    assert.match(s.headline, /waiting for you to check/);
    assert.equal(s.awaitingClient, 1);
  });

  it("says so when nobody has responded", () => {
    const s = summariseDefects(
      [defect({ updatedAt: "2026-09-01T10:00:00Z" })],
      "2026-11-01",
      TODAY,
    );
    assert.equal(s.stalled, 1);
    assert.match(s.headline, /no response/);
  });

  it("says goodwill once the period has closed", () => {
    const s = summariseDefects([defect({ status: "reported" })], "2026-09-01", TODAY);
    assert.match(s.headline, /closed on/);
    assert.match(s.headline, /goodwill/);
  });

  it("is honest that no period exists yet", () => {
    const s = summariseDefects([], "", TODAY);
    assert.match(s.headline, /not set/);
    assert.equal(s.daysRemaining, null);
  });
});

describe("the retainer", () => {
  it("is active with time on it", () => {
    assert.equal(retainerState(retainer(), TODAY), "active");
    // 19 Oct → 14 Dec counted to the end of the renewal day: 57.
    assert.equal(daysToRenewal(retainer(), TODAY), 57);
  });

  it("warns inside thirty days so it does not lapse by accident", () => {
    assert.equal(retainerState(retainer({ renewsOn: "2026-11-10" }), TODAY), "due_soon");
  });

  it("reports lapsed once the renewal date passes", () => {
    assert.equal(retainerState(retainer({ renewsOn: "2026-10-01" }), TODAY), "lapsed");
    assert.match(retainerLine(retainer({ renewsOn: "2026-10-01" }), TODAY), /was due/);
  });

  it("is none when cancelled or missing", () => {
    assert.equal(retainerState(retainer({ status: "cancelled" }), TODAY), "none");
    assert.equal(retainerState(null, TODAY), "none");
    assert.match(retainerLine(null, TODAY), /No maintenance retainer/);
  });

  it("dates a live renewal the client can check", () => {
    assert.match(retainerLine(retainer(), TODAY), /Renews 14 Dec 2026/);
    assert.match(retainerLine(retainer(), TODAY), /57 days/);
  });
});

describe("display", () => {
  it("formats a date the client can compare with their records", () => {
    assert.equal(fmtDate("2026-10-29"), "29 Oct 2026");
    assert.equal(fmtDate(""), "");
  });

  it("gives every status a human label", () => {
    assert.equal(statusLabel("in_progress"), "Being fixed");
    assert.equal(statusLabel("fixed"), "Fixed — check it");
    assert.equal(statusLabel("rejected"), "Not covered");
  });
});
