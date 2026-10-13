import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toPhoneForOtp } from "./config.ts";

describe("phone numbers for OTP", () => {
  it("accepts the local form a Kenyan types", () => {
    assert.equal(toPhoneForOtp("0799 034 712"), "+254799034712");
    assert.equal(toPhoneForOtp("0799034712"), "+254799034712");
    assert.equal(toPhoneForOtp("0799-034-712"), "+254799034712");
  });

  it("accepts a number that already carries its country code", () => {
    assert.equal(toPhoneForOtp("+254799034712"), "+254799034712");
    assert.equal(toPhoneForOtp("254799034712"), "+254799034712");
    assert.equal(toPhoneForOtp("00254799034712"), "+254799034712");
  });

  it("keeps a diaspora number on its own country code", () => {
    assert.equal(toPhoneForOtp("+44 7700 900123"), "+447700900123");
  });

  it("refuses a number it cannot deliver to", () => {
    // Supabase charges per SMS and silently drops undeliverable ones, so a
    // number has to be right before it is ever sent.
    assert.equal(toPhoneForOtp("799034712"), null);
    assert.equal(toPhoneForOtp("call the studio"), null);
    assert.equal(toPhoneForOtp("+1234567"), null);
    assert.equal(toPhoneForOtp(""), null);
    assert.equal(toPhoneForOtp(null), null);
  });
});
