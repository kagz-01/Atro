import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { demotesLastAdmin, grantDemotesAdmin } from "./staff-access-rules.ts";

describe("staff access allowlist", () => {
  describe("demotesLastAdmin", () => {
    it("blocks demoting the only admin", () => {
      assert.equal(
        demotesLastAdmin({ currentRole: "admin", nextRole: "staff", otherAdminCount: 0 }),
        true,
      );
    });

    it("blocks demoting the only admin by re-granting it as staff", () => {
      // This is the actual hole: grantStaff is an upsert, so choosing "staff"
      // for an existing admin demotes them without ever going through revoke.
      assert.equal(
        demotesLastAdmin({ currentRole: "admin", nextRole: "staff", otherAdminCount: 0 }),
        true,
      );
    });

    it("allows it once another admin exists", () => {
      assert.equal(
        demotesLastAdmin({ currentRole: "admin", nextRole: "staff", otherAdminCount: 1 }),
        false,
      );
    });

    it("allows an admin to change another admin's role", () => {
      assert.equal(
        demotesLastAdmin({ currentRole: "staff", nextRole: "staff", otherAdminCount: 0 }),
        false,
      );
    });

    it("does not treat a non-admin as someone who can empty the bench", () => {
      assert.equal(
        demotesLastAdmin({ currentRole: "staff", nextRole: "staff", otherAdminCount: 0 }),
        false,
      );
      assert.equal(
        demotesLastAdmin({ currentRole: null, nextRole: "staff", otherAdminCount: 0 }),
        false,
      );
    });

    it("allows promoting the last admin's peer, and self-promotion", () => {
      assert.equal(
        demotesLastAdmin({ currentRole: "staff", nextRole: "admin", otherAdminCount: 0 }),
        false,
      );
      assert.equal(
        demotesLastAdmin({ currentRole: "admin", nextRole: "admin", otherAdminCount: 0 }),
        false,
      );
    });
  });

  describe("grantDemotesAdmin", () => {
    it("blocks demoting any existing admin, even when others exist", () => {
      // demotesLastAdmin let this through once a second admin existed; the
      // grant form is still the wrong place to demote anyone.
      assert.equal(
        grantDemotesAdmin({ currentRole: "admin", nextRole: "staff" }),
        true,
      );
    });

    it("blocks demoting the last admin via the grant form", () => {
      assert.equal(
        grantDemotesAdmin({ currentRole: "admin", nextRole: "staff" }),
        true,
      );
    });

    it("allows re-granting admin (a note update, not a demotion)", () => {
      assert.equal(
        grantDemotesAdmin({ currentRole: "admin", nextRole: "admin" }),
        false,
      );
    });

    it("allows granting staff to a non-admin or a new account", () => {
      assert.equal(
        grantDemotesAdmin({ currentRole: "staff", nextRole: "staff" }),
        false,
      );
      assert.equal(
        grantDemotesAdmin({ currentRole: null, nextRole: "staff" }),
        false,
      );
      assert.equal(
        grantDemotesAdmin({ currentRole: null, nextRole: "admin" }),
        false,
      );
    });
  });
});