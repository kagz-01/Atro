import assert from "node:assert/strict";
import test from "node:test";
import {
  canAcceptCircleInvite,
  hasActiveCircleAccess,
  normaliseCircleEmail,
} from "./project-circle.ts";

const now = new Date("2026-10-26T17:00:00.000Z");

test("normalises invite email addresses", () => {
  assert.equal(normaliseCircleEmail("  Amina@Example.COM "), "amina@example.com");
});

test("circle access requires an active, unexpired membership", () => {
  assert.equal(hasActiveCircleAccess("active", "2026-10-27T00:00:00.000Z", now), true);
  assert.equal(hasActiveCircleAccess("active", "2026-10-26T16:59:59.000Z", now), false);
  assert.equal(hasActiveCircleAccess("revoked", "2026-10-27T00:00:00.000Z", now), false);
  assert.equal(hasActiveCircleAccess("active", "not a date", now), false);
});

test("acceptance requires a pending unexpired invite and the matching verified email", () => {
  const invite = {
    status: "pending",
    expiresAt: "2026-10-27T00:00:00.000Z",
    inviteEmail: "Wanjiku@example.com",
    sessionEmail: "wanjiku@example.com",
    emailVerified: true,
    now,
  };

  assert.equal(canAcceptCircleInvite(invite), true);
  assert.equal(canAcceptCircleInvite({ ...invite, emailVerified: false }), false);
  assert.equal(canAcceptCircleInvite({ ...invite, sessionEmail: "other@example.com" }), false);
  assert.equal(canAcceptCircleInvite({ ...invite, status: "revoked" }), false);
  assert.equal(canAcceptCircleInvite({ ...invite, expiresAt: "2026-10-26T16:00:00.000Z" }), false);
});
