import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { staffInviteUrl, staffInviteWhatsAppUrl } from "./staff-invites.server.ts";

describe("staff invitations", () => {
  it("builds the staff link from the configured public site origin", () => {
    const previous = process.env.ATRO_SITE_URL;
    process.env.ATRO_SITE_URL = "https://staff.example.test/some/path";
    try {
      assert.equal(staffInviteUrl(), "https://staff.example.test/staff");
    } finally {
      if (previous === undefined) delete process.env.ATRO_SITE_URL;
      else process.env.ATRO_SITE_URL = previous;
    }
  });

  it("prepares a WhatsApp message for the normalized recipient", () => {
    const url = new URL(
      staffInviteWhatsAppUrl("0799 034 712", "Invitation for name@example.test: https://atro.ke/staff"),
    );
    assert.equal(url.origin + url.pathname, "https://wa.me/254799034712");
    assert.equal(
      url.searchParams.get("text"),
      "Invitation for name@example.test: https://atro.ke/staff",
    );
  });

  it("refuses ambiguous WhatsApp numbers", () => {
    assert.throws(() => staffInviteWhatsAppUrl("799034712", "Invitation"));
  });
});
