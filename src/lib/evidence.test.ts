import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  checkPhotoCount,
  groupByMilestone,
  proofLine,
  stagesWithProof,
  validateCaption,
  type EvidencePhoto,
} from "./evidence.ts";

const photo = (over: Partial<EvidencePhoto> = {}): EvidencePhoto => ({
  id: "p1",
  projectId: "proj",
  milestoneId: "m1",
  ord: 1,
  caption: "Ring beam before the pour",
  detail: "",
  takenOn: "2026-03-06",
  mime: "image/jpeg",
  hasImage: true,
  uploadedBy: "staff",
  uploadedAt: "2026-03-06T10:00:00Z",
  ...over,
});

describe("validateCaption", () => {
  it("accepts a caption that says what is in the frame", () => {
    const r = validateCaption("  Ring beam   before the pour  ");
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.caption, "Ring beam before the pour");
  });

  it("rejects a caption that is only a word", () => {
    const r = validateCaption("photo");
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.match(r.reason, /what is in the photograph/i);
  });

  it("rejects an empty caption", () => {
    assert.equal(validateCaption("   ").ok, false);
  });

  it("rejects a caption that is only a word and a number", () => {
    assert.equal(validateCaption("photo 1").ok, false);
  });

  it("rejects a camera filename", () => {
    assert.equal(validateCaption("IMG_4821").ok, false);
  });

  it("accepts a real caption that happens to contain a number", () => {
    assert.equal(validateCaption("Beam 3 before the pour").ok, true);
  });

  it("rejects one that is padded out well past the limit", () => {
    assert.equal(validateCaption("a".repeat(200)).ok, false);
  });
});

describe("checkPhotoCount", () => {
  it("allows photographs while there is room", () => {
    assert.equal(checkPhotoCount(3).ok, true);
  });

  it("allows the last one exactly", () => {
    assert.equal(checkPhotoCount(11).ok, true);
  });

  it("refuses one too many, and says how many are there", () => {
    const r = checkPhotoCount(12);
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.match(r.reason, /12 photographs/);
  });
});

describe("groupByMilestone", () => {
  it("puts photographs under the stage they prove", () => {
    const groups = groupByMilestone([
      photo({ id: "a", milestoneId: "m1", ord: 1 }),
      photo({ id: "b", milestoneId: "m2", ord: 1 }),
      photo({ id: "c", milestoneId: "m1", ord: 2 }),
    ]);
    assert.equal(groups.length, 2);
    const m1 = groups.find((g) => g.milestoneId === "m1");
    assert.deepEqual(m1?.photos.map((x) => x.id), ["a", "c"]);
  });

  it("omits stages with no photographs", () => {
    const groups = groupByMilestone([photo({ milestoneId: "m7" })]);
    assert.deepEqual(groups.map((g) => g.milestoneId), ["m7"]);
  });

  it("is empty when there are none", () => {
    assert.deepEqual(groupByMilestone([]), []);
  });
});

describe("stagesWithProof", () => {
  it("counts distinct stages, not photographs", () => {
    const n = stagesWithProof(
      [
        photo({ milestoneId: "m1" }),
        photo({ milestoneId: "m1", ord: 2 }),
        photo({ milestoneId: "m2" }),
      ],
      9,
    );
    assert.equal(n, 2);
  });

  it("never counts more stages than exist", () => {
    assert.equal(stagesWithProof([photo({ milestoneId: "m1" })], 0), 0);
  });
});

describe("proofLine", () => {
  it("says nothing when there are no stages", () => {
    assert.equal(proofLine([], 0), "");
  });

  it("is honest about having nothing", () => {
    assert.match(proofLine([], 9), /No photographs have been posted/);
  });

  it("names the gap rather than implying full coverage", () => {
    const line = proofLine([photo({ milestoneId: "m1" })], 9);
    assert.match(line, /1 of 9 stages/);
    assert.match(line, /still to come/);
  });

  it("says so when everything is covered", () => {
    const photos = ["m1", "m2", "m3"].map((id, i) => photo({ milestoneId: id, ord: i }));
    assert.match(proofLine(photos, 3), /Every one of the 3 stages/);
  });
});
