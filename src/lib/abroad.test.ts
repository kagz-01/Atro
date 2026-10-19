import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  channelsFor,
  isAbroad,
  journeyStageFor,
  reachLine,
} from "./abroad.ts";

describe("isAbroad", () => {
  it("recognises the profile's diaspora type and nothing else", () => {
    assert.equal(isAbroad("diaspora"), true);
    assert.equal(isAbroad("individual"), false);
    assert.equal(isAbroad("owner"), false);
    assert.equal(isAbroad(""), false);
  });
});

describe("journeyStageFor", () => {
  it("maps every construction milestone name to its journey stage", () => {
    const cases: [string, string][] = [
      ["Land and due diligence", "land"],
      ["Concept and cost options", "design"],
      ["Developed design and approvals", "approvals"],
      ["Bill of Quantities and contract", "team"],
      ["Site establishment and substructure", "foundation"],
      ["Superstructure", "frame"],
      ["Roof, first fix and finishes", "roof"],
      ["Second fix, testing and approvals", "mep"],
      ["Snagging and handover", "handover"],
    ];
    for (const [milestone, stageId] of cases) {
      assert.equal(
        journeyStageFor(milestone)?.id,
        stageId,
        `${milestone} should map to ${stageId}`,
      );
    }
  });

  it("falls back to keywords for names outside the construction vocabulary", () => {
    assert.equal(journeyStageFor("Cost options")?.id, "team");
    assert.equal(journeyStageFor("Structural assessment")?.id, "frame");
  });

  it("refuses names it does not recognise rather than guessing a stage", () => {
    assert.equal(journeyStageFor("Condition survey"), null);
    assert.equal(journeyStageFor("Something the studio invented"), null);
    assert.equal(journeyStageFor(""), null);
  });
});

describe("channelsFor", () => {
  it("always includes the portal feed", () => {
    assert.deepEqual(
      channelsFor({ email: false, whatsapp: false, sms: false }),
      ["inapp"],
    );
  });

  it("opens every consented channel, in a stable order", () => {
    assert.deepEqual(
      channelsFor({ email: true, whatsapp: true, sms: true }),
      ["inapp", "email", "whatsapp", "sms"],
    );
  });

  it("leaves switched-off channels out entirely — consent is a ceiling", () => {
    assert.deepEqual(channelsFor({ email: true, whatsapp: false, sms: false }), [
      "inapp",
      "email",
    ]);
    assert.deepEqual(channelsFor({ email: false, whatsapp: false, sms: true }), [
      "inapp",
      "sms",
    ]);
    assert.deepEqual(channelsFor({ email: true, whatsapp: true, sms: false }), [
      "inapp",
      "email",
      "whatsapp",
    ]);
  });
});

describe("reachLine", () => {
  it("says portal-only when everything else is off", () => {
    assert.match(reachLine(["inapp"]), /^The portal only/);
  });

  it("lists one channel plainly", () => {
    assert.equal(reachLine(["inapp", "email"]), "The portal and email.");
    assert.equal(reachLine(["inapp", "sms"]), "The portal and SMS.");
  });

  it("joins several with an Oxford comma and 'and'", () => {
    assert.equal(
      reachLine(["inapp", "email", "whatsapp", "sms"]),
      "The portal, email, WhatsApp and SMS.",
    );
  });
});
