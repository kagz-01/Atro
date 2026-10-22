import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  demotesLastAdmin,
  grantDemotesAdmin,
  inviteRefusal,
  roleAfterAccept,
} from "./staff-access-rules.ts";

describe("demotesLastAdmin", () => {
  it("blocks demoting the only admin down to staff", () => {
    assert.equal(
      demotesLastAdmin({ currentRole: "admin", nextRole: "staff", otherAdminCount: 0 }),
      true,
    );
  });

  it("allows the same demotion while another admin remains", () => {
    assert.equal(
      demotesLastAdmin({ currentRole: "admin", nextRole: "staff", otherAdminCount: 1 }),
      false,
    );
  });

  it("is unbothered by promotions and by people who were nobody", () => {
    assert.equal(
      demotesLastAdmin({ currentRole: "staff", nextRole: "admin", otherAdminCount: 0 }),
      false,
    );
    assert.equal(
      demotesLastAdmin({ currentRole: null, nextRole: "staff", otherAdminCount: 0 }),
      false,
    );
  });
});

describe("grantDemotesAdmin", () => {
  it("sees 'staff' for an existing admin as a demotion", () => {
    assert.equal(grantDemotesAdmin({ currentRole: "admin", nextRole: "staff" }), true);
  });

  it("leaves an admin re-granting admin alone", () => {
    assert.equal(grantDemotesAdmin({ currentRole: "admin", nextRole: "admin" }), false);
  });

  it("is unbothered by ordinary grants", () => {
    assert.equal(grantDemotesAdmin({ currentRole: "staff", nextRole: "staff" }), false);
    assert.equal(grantDemotesAdmin({ currentRole: null, nextRole: "staff" }), false);
  });
});

describe("inviteRefusal", () => {
  it("refuses to invite someone who can already open the console", () => {
    assert.equal(
      inviteRefusal({ alreadyStaff: true }),
      "That address is already on the studio access list.",
    );
  });

  it("lets anyone else be invited", () => {
    assert.equal(inviteRefusal({ alreadyStaff: false }), null);
  });
});

describe("roleAfterAccept", () => {
  it("resolves a new person to staff", () => {
    assert.equal(roleAfterAccept(null), "staff");
  });

  it("never lowers a role already held", () => {
    assert.equal(roleAfterAccept("staff"), "staff");
    assert.equal(roleAfterAccept("admin"), "admin");
  });
});
