import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canPerform, refusalFor, requiresAdmin, type PrivilegedOp } from "./privileges.ts";

// The matrix itself: these are the writes that move money, cancel money, or
// change who holds the keys. If a new privileged operation is added to the
// union, it lands in ADMIN_ONLY here by construction — the tests below pin
// the behaviour of each one.
const ADMIN_ONLY: PrivilegedOp[] = [
  "certify-payment",
  "release-retention",
  "issue-statement",
  "void-document",
  "set-retainer",
  "grant-access",
  "revoke-access",
];

describe("privilege matrix", () => {
  describe("requiresAdmin", () => {
    it("reserves every money and access write for admins", () => {
      for (const op of ADMIN_ONLY) {
        assert.equal(requiresAdmin(op), true, `${op} should require admin`);
      }
    });
  });

  describe("canPerform", () => {
    it("lets an admin do everything", () => {
      for (const op of ADMIN_ONLY) {
        assert.equal(canPerform("admin", op), true, `admin should do ${op}`);
      }
    });

    it("refuses a staff account every privileged write", () => {
      for (const op of ADMIN_ONLY) {
        assert.equal(canPerform("staff", op), false, `staff should not do ${op}`);
      }
    });

    it("refuses nobody at all", () => {
      for (const op of ADMIN_ONLY) {
        assert.equal(canPerform(null, op), false, `null role should not do ${op}`);
      }
    });
  });

  describe("refusalFor", () => {
    it("names the operation in the refusal, so the error teaches the matrix", () => {
      assert.equal(
        refusalFor("certify-payment"),
        "Only an admin can certify a payment.",
      );
      assert.equal(
        refusalFor("release-retention"),
        "Only an admin can release retention.",
      );
      assert.equal(
        refusalFor("void-document"),
        "Only an admin can void a document.",
      );
      assert.equal(
        refusalFor("set-retainer"),
        "Only an admin can set the annual care fee.",
      );
      assert.equal(
        refusalFor("grant-access"),
        "Only an admin can change studio access.",
      );
      assert.equal(
        refusalFor("revoke-access"),
        "Only an admin can change studio access.",
      );
      assert.equal(
        refusalFor("issue-statement"),
        "Only an admin can issue a statement.",
      );
    });
  });
});
