import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  VARIATION_STATUSES,
  amountLabel,
  approvedDays,
  approvedDelta,
  awaitingClient,
  canTransition,
  countAwaiting,
  daysLabel,
  fmtDate,
  inFlight,
  kes,
  originalContract,
  signedKes,
  sourceLabel,
  statusLabel,
  summariseVariations,
  validateVariation,
  type Variation,
} from "./variations.ts";

const variation = (over: Partial<Variation> = {}): Variation => ({
  id: "v1",
  projectId: "p1",
  ord: 1,
  title: "Bigger roof overhang to the east terrace",
  detail: "Extend the eave from 600 to 900 mm.",
  reason: "The terrace bakes in the afternoon sun.",
  sourceKind: "studio",
  sourceId: null,
  amount: 275000,
  days: 7,
  status: "proposed",
  proposedOn: "2026-10-17",
  decidedOn: "",
  decisionNote: "",
  decidedBy: "",
  updatedAt: "2026-10-17T10:00:00Z",
  ...over,
});

const SETTLED = ["approved", "declined", "withdrawn"] as const;

describe("who can move a variation", () => {
  it("lets the client approve or decline the price put to them", () => {
    assert.equal(canTransition("proposed", "approved", "client"), true);
    assert.equal(canTransition("proposed", "declined", "client"), true);
  });

  it("does not let the client withdraw — that is the studio's call", () => {
    assert.equal(canTransition("proposed", "withdrawn", "client"), false);
  });

  it("lets the studio withdraw before the client has spoken", () => {
    assert.equal(canTransition("proposed", "withdrawn", "studio"), true);
  });

  it("never lets the studio decide the money", () => {
    assert.equal(canTransition("proposed", "approved", "studio"), false);
    assert.equal(canTransition("proposed", "declined", "studio"), false);
  });

  it("refuses a move to the same status", () => {
    assert.equal(canTransition("proposed", "proposed", "client"), false);
    assert.equal(canTransition("approved", "approved", "client"), false);
  });

  for (const s of SETTLED) {
    it(`treats “${s}” as settled — for both parties`, () => {
      for (const to of ["proposed", "approved", "declined", "withdrawn"] as const) {
        assert.equal(canTransition(s, to, "client"), false, `${s} → ${to} client`);
        assert.equal(canTransition(s, to, "studio"), false, `${s} → ${to} studio`);
      }
    });
  }
});

describe("awaiting a decision", () => {
  it("counts only what sits with the client", () => {
    assert.equal(awaitingClient(variation()), true);
    assert.equal(awaitingClient(variation({ status: "approved" })), false);
    assert.equal(countAwaiting([
      variation(),
      variation({ id: "v2" }),
      variation({ id: "v3", status: "withdrawn" }),
    ]), 2);
  });
});

describe("the money", () => {
  it("signs an addition and a credit so neither can read as the other", () => {
    assert.equal(signedKes(275000), "+KES 275,000");
    assert.equal(signedKes(-85000), "-KES 85,000");
    assert.equal(signedKes(0), "KES 0");
  });

  it("says plainly when nothing changes", () => {
    assert.equal(amountLabel(0), "No cost change");
    assert.equal(amountLabel(-85000), "-KES 85,000");
  });

  it("formats the contract sum the client can check", () => {
    assert.equal(kes(42150000), "KES 42,150,000");
    assert.equal(kes(-3), "KES 3");
  });

  it("labels time only when there is time to label", () => {
    assert.equal(daysLabel(7), "+7 days");
    assert.equal(daysLabel(-2), "-2 days");
    assert.equal(daysLabel(1), "+1 day");
    assert.equal(daysLabel(0), "");
  });

  it("sums approved changes and ignores everything else", () => {
    const vs = [
      variation({ status: "approved", amount: 150000, days: 4 }),
      variation({ id: "v2", status: "proposed", amount: 275000, days: 7 }),
      variation({ id: "v3", status: "declined", amount: 430000, days: 10 }),
      variation({ id: "v4", status: "withdrawn", amount: 320000 }),
      variation({ id: "v5", status: "approved", amount: -85000, days: -2 }),
    ];
    assert.equal(approvedDelta(vs), 65000);
    assert.equal(approvedDays(vs), 2);
    assert.equal(inFlight(vs), 275000);
  });

  it("recovers the original contract from the amended sum", () => {
    // The project row carries 42,150,000 because a +150,000 change was
    // approved into it; the signed figure is what comes back out.
    const vs = [variation({ status: "approved", amount: 150000 })];
    assert.equal(originalContract(42150000, vs), 42000000);
    assert.equal(originalContract(42000000, []), 42000000);
  });
});

describe("validateVariation", () => {
  it("accepts a price and a time impact", () => {
    const r = validateVariation({ title: "Bigger roof overhang", amount: 275000, days: 7 });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.title, "Bigger roof overhang");
  });

  it("accepts a credit, and a change that only costs time", () => {
    assert.equal(validateVariation({ title: "Cheaper roof sheet", amount: -85000, days: 0 }).ok, true);
    assert.equal(validateVariation({ title: "Reopen the joint", amount: 0, days: 3 }).ok, true);
  });

  it("refuses a title that says nothing", () => {
    const r = validateVariation({ title: "add", amount: 1000, days: 0 });
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.reason, /Say what is changing/);
  });

  it("refuses a change with neither a price nor time", () => {
    const r = validateVariation({ title: "Shift the gully", amount: 0, days: 0 });
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.reason, /price or a time impact/);
  });

  it("refuses a price no contract could carry", () => {
    assert.equal(
      validateVariation({ title: "Whole new wing", amount: 900_000_000, days: 0 }).ok,
      false,
    );
  });

  it("refuses fractional or outsize time", () => {
    assert.equal(validateVariation({ title: "Small delay", amount: 0, days: 2.5 }).ok, false);
    assert.equal(validateVariation({ title: "Very long delay", amount: 0, days: 400 }).ok, false);
  });

  it("collapses whitespace so a padded title still counts", () => {
    const r = validateVariation({ title: "  Bigger   overhang  ", amount: 1, days: 0 });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.title, "Bigger overhang");
  });
});

describe("summariseVariations", () => {
  it("puts the waiting price in the headline", () => {
    const s = summariseVariations([variation()]);
    assert.equal(s.awaiting, 1);
    assert.match(s.headline, /A change worth KES 275,000/);
    assert.match(s.headline, /waiting for your approval/);
  });

  it("counts several without pretending they are one", () => {
    const s = summariseVariations([variation(), variation({ id: "v2", amount: 40000 })]);
    assert.match(s.headline, /^2 changes worth KES 315,000/);
  });

  it("says so when nothing is waiting", () => {
    const s = summariseVariations([variation({ status: "approved" })]);
    assert.equal(s.awaiting, 0);
    assert.match(s.headline, /Nothing waiting/);
  });

  it("rolls every state up", () => {
    const s = summariseVariations([
      variation({ status: "approved", amount: 150000, days: 4 }),
      variation({ id: "v2", status: "declined" }),
      variation({ id: "v3", status: "withdrawn" }),
      variation({ id: "v4" }),
    ]);
    assert.deepEqual(
      { total: s.total, approved: s.approved, declined: s.declined, withdrawn: s.withdrawn, proposed: s.proposed },
      { total: 4, approved: 1, declined: 1, withdrawn: 1, proposed: 1 },
    );
    assert.equal(s.approvedDelta, 150000);
    assert.equal(s.approvedDays, 4);
    assert.equal(s.inFlight, 275000);
  });
});

describe("display", () => {
  it("names every status for the badge", () => {
    for (const s of VARIATION_STATUSES) assert.ok(statusLabel(s.value).length > 0);
    assert.equal(statusLabel("approved"), "Approved");
    assert.equal(statusLabel("proposed"), "Waiting on you");
  });

  it("says where the change came from", () => {
    assert.equal(sourceLabel("selection"), "From your choice");
    assert.equal(sourceLabel("studio"), "Raised by the studio");
  });

  it("formats a date both sides can read", () => {
    assert.equal(fmtDate("2026-10-17"), "17 Oct 2026");
    assert.equal(fmtDate(""), "");
  });
});