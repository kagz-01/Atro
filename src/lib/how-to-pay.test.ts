import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pickInstructions } from "./how-to-pay.ts";

const LOCAL = "M-Pesa Paybill 247247, Account ATRO-2401. KCB Karen Branch, Account 1234567890.";
const INTERNATIONAL =
  "SWIFT KCBKENAXXX, KCB Kenya, Branch Nairobi Karen. Quote ATRO-2401 as the reference.";

describe("pickInstructions", () => {
  it("shows a local client the local sheet, never the wire one", () => {
    assert.equal(pickInstructions(LOCAL, INTERNATIONAL, false), LOCAL);
    assert.equal(pickInstructions("", INTERNATIONAL, false), "");
  });

  it("shows an abroad client the international sheet when there is one", () => {
    assert.equal(pickInstructions(LOCAL, INTERNATIONAL, true), INTERNATIONAL);
  });

  it("falls back to the local sheet for an abroad client with no wire sheet", () => {
    assert.equal(pickInstructions(LOCAL, "", true), LOCAL);
  });

  it("trims, and treats a blank sheet as absent", () => {
    assert.equal(pickInstructions("  \n ", "  ", true), "");
    assert.equal(pickInstructions(`\n  ${LOCAL}\n  `, "", false), LOCAL);
  });
});
