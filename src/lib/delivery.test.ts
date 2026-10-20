import { strict as assert } from "node:assert";
import { test, describe } from "node:test";
import { ALL_CHANNELS, CHANNEL_NAMES, clientStatusLine, partitionChannels } from "./delivery.ts";

const ON = { email: true, whatsapp: true, sms: true };
const OFF = { email: false, whatsapp: false, sms: false };
const DEFAULTS = { email: true, whatsapp: true, sms: false };

describe("partitionChannels", () => {
  test("everything consented to is wanted, nothing suppressed", () => {
    const { wanted, suppressed } = partitionChannels(ALL_CHANNELS, ON);
    assert.deepEqual(wanted, ["inapp", "email", "whatsapp", "sms"]);
    assert.deepEqual(suppressed, []);
  });

  test("switched-off channels land in suppressed, not vanished", () => {
    const { wanted, suppressed } = partitionChannels(ALL_CHANNELS, OFF);
    assert.deepEqual(wanted, ["inapp"]);
    assert.deepEqual(suppressed, ["email", "whatsapp", "sms"]);
  });

  test("the defaults suppress SMS and keep the portal — the common case", () => {
    const { wanted, suppressed } = partitionChannels(ALL_CHANNELS, DEFAULTS);
    assert.deepEqual(wanted, ["inapp", "email", "whatsapp"]);
    assert.deepEqual(suppressed, ["sms"]);
  });

  test("a caller aiming only at the portal suppresses nothing", () => {
    const { wanted, suppressed } = partitionChannels(["inapp"], OFF);
    assert.deepEqual(wanted, ["inapp"]);
    assert.deepEqual(suppressed, []);
  });

  test("consent still fences an explicit choice", () => {
    const { wanted, suppressed } = partitionChannels(["email", "sms"], {
      email: false,
      whatsapp: false,
      sms: true,
    });
    assert.deepEqual(wanted, ["sms"]);
    assert.deepEqual(suppressed, ["email"]);
  });

  test("inapp is never suppressed — the portal is not a channel to consent to", () => {
    const { suppressed } = partitionChannels(ALL_CHANNELS, OFF);
    assert.ok(!suppressed.includes("inapp"));
  });
});

describe("clientStatusLine", () => {
  test("a portal delivery says what it means", () => {
    assert.equal(clientStatusLine("sent", "", "inapp"), "Shown in your portal");
    assert.equal(clientStatusLine("sent", "", "email"), "Sent");
  });

  test("suppression quotes the client's own switch back to them", () => {
    assert.equal(
      clientStatusLine("suppressed", "switched off in your profile", "sms"),
      "switched off in your profile",
    );
    assert.equal(clientStatusLine("suppressed", "", "email"), "Switched off in your profile");
  });

  test("missing credentials never leak as environment variables", () => {
    assert.equal(
      clientStatusLine("skipped", "RESEND_API_KEY not set", "email"),
      "The studio has not set this channel up yet",
    );
    assert.equal(
      clientStatusLine("skipped", "WhatsApp credentials not set", "whatsapp"),
      "The studio has not set this channel up yet",
    );
    assert.equal(
      clientStatusLine("skipped", "no contact on file", "whatsapp"),
      "No contact details on file",
    );
  });

  test("queued and failed read as plain English", () => {
    assert.equal(clientStatusLine("pending", "", "email"), "Queued");
    assert.equal(
      clientStatusLine("failed", "resend 429: rate limited", "email"),
      "Did not go through — the studio can retry",
    );
  });

  test("a hold for the client's morning says when, in their clock's terms", () => {
    assert.equal(
      clientStatusLine("pending", "outside your waking hours (Europe/London)", "email"),
      "Held until 08:00 your time",
    );
    assert.equal(
      clientStatusLine("pending", "outside your waking hours (Pacific/Auckland)", "whatsapp"),
      "Held until 08:00 your time",
    );
  });

  test("every channel has a spoken name", () => {
    for (const c of ALL_CHANNELS) assert.ok(CHANNEL_NAMES[c]);
  });
});
