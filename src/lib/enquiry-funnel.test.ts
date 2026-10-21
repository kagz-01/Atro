import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { claimState, enquiryTransitions, statusLabel } from "./enquiry-funnel.ts";

describe("enquiryTransitions", () => {
  it("offers the full live funnel from new", () => {
    assert.deepEqual(
      enquiryTransitions("new").map((t) => t.status),
      ["contacted", "quoted", "won", "lost"],
    );
  });

  it("drops 'contacted' once the lead has moved on", () => {
    assert.deepEqual(
      enquiryTransitions("contacted").map((t) => t.status),
      ["quoted", "won", "lost"],
    );
  });

  it("only offers won or lost from quoted", () => {
    assert.deepEqual(
      enquiryTransitions("quoted").map((t) => t.status),
      ["won", "lost"],
    );
  });

  it("offers nothing from a closed or converted lead", () => {
    assert.deepEqual(enquiryTransitions("won"), []);
    assert.deepEqual(enquiryTransitions("lost"), []);
    assert.deepEqual(enquiryTransitions("converted"), []);
  });

  it("offers nothing for an unknown status rather than guessing", () => {
    assert.deepEqual(enquiryTransitions("nonsense"), []);
  });

  it("gives every transition a human label", () => {
    for (const status of ["new", "contacted", "quoted"]) {
      for (const t of enquiryTransitions(status)) {
        assert.ok(t.label.length > 0, `${status} → ${t.status} has no label`);
      }
    }
  });
});

describe("claimState", () => {
  it("is unclaimed when nobody owns the lead", () => {
    assert.equal(claimState("", "ada@atro.ke"), "unclaimed");
    assert.equal(claimState("   ", "ada@atro.ke"), "unclaimed");
  });

  it("is mine when the owner is me, ignoring case and padding", () => {
    assert.equal(claimState("Ada@Atro.ke", "ada@atro.ke"), "mine");
    assert.equal(claimState(" ada@atro.ke ", "ADA@atro.ke"), "mine");
  });

  it("is theirs when someone else owns it", () => {
    assert.equal(claimState("ben@atro.ke", "ada@atro.ke"), "theirs");
  });
});

describe("statusLabel", () => {
  it("capitalises a plain status", () => {
    assert.equal(statusLabel("quoted"), "Quoted");
  });

  it("keeps 'new' short", () => {
    assert.equal(statusLabel("new"), "New");
  });
});
