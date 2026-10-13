import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatPhone, toAfricaTalking, toE164 } from "./phone.ts";

describe("phone normalisation", () => {
  describe("toE164 — the way Kenyans actually type", () => {
    it("accepts the local form", () => {
      assert.equal(toE164("0799034712"), "+254799034712");
    });

    it("accepts the local form with spaces", () => {
      assert.equal(toE164("0799 034 712"), "+254799034712");
    });

    it("accepts the local form with dashes", () => {
      assert.equal(toE164("0799-034-712"), "+254799034712");
    });

    it("accepts the country code without a plus", () => {
      assert.equal(toE164("254799034712"), "+254799034712");
    });

    it("accepts a spaced international form", () => {
      assert.equal(toE164("+254 799 034 712"), "+254799034712");
    });

    it("accepts the 00 international prefix", () => {
      assert.equal(toE164("00254799034712"), "+254799034712");
    });

    it("ignores surrounding whitespace", () => {
      assert.equal(toE164("  +254799034712  "), "+254799034712");
    });

    it("accepts other Kenyan prefixes, not just 07", () => {
      assert.equal(toE164("0734123456"), "+254734123456");
      assert.equal(toE164("0765123456"), "+254765123456");
    });
  });

  describe("toE164 — diaspora numbers must survive", () => {
    it("keeps a UK number as-is", () => {
      assert.equal(toE164("+44 7700 900123"), "+447700900123");
    });

    it("keeps a US number as-is", () => {
      assert.equal(toE164("+1 (415) 555-0132"), "+14155550132");
    });

    it("reads 00 as the international prefix", () => {
      assert.equal(toE164("00447700900123"), "+447700900123");
    });
  });

  describe("toE164 — refuses rather than guesses", () => {
    it("rejects a number with no country code that is not Kenyan-shaped", () => {
      // A bare 9-digit string is ambiguous: it could be any country. Guessing
      // wrong sends client money updates to a stranger's handset.
      assert.equal(toE164("799034712"), null);
    });

    it("rejects a Kenyan-looking number that is too short", () => {
      assert.equal(toE164("07990347"), null);
    });

    it("rejects a Kenyan-looking number that is too long", () => {
      assert.equal(toE164("07990347123"), null);
    });

    it("rejects letters and symbols", () => {
      assert.equal(toE164("call me"), null);
      assert.equal(toE164("+"), null);
    });

    it("rejects empty and missing input", () => {
      assert.equal(toE164(""), null);
      assert.equal(toE164(null), null);
      assert.equal(toE164(undefined), null);
    });

    it("rejects an out-of-range international number", () => {
      assert.equal(toE164("+1234567"), null);
    });
  });

  describe("toAfricaTalking", () => {
    it("strips the plus, which that API rejects", () => {
      assert.equal(toAfricaTalking("+254799034712"), "254799034712");
    });

    it("normalises a local number first", () => {
      assert.equal(toAfricaTalking("0799034712"), "254799034712");
    });

    it("returns null rather than sending a malformed number", () => {
      assert.equal(toAfricaTalking("799034712"), null);
    });
  });

  describe("formatPhone", () => {
    it("groups a Kenyan number the way it is written locally", () => {
      assert.equal(formatPhone("0799034712"), "+254 799 034 712");
    });

    it("leaves an international number alone", () => {
      assert.equal(formatPhone("+447700900123"), "+447700900123");
    });

    it("falls back to the raw input rather than showing nothing", () => {
      assert.equal(formatPhone("07990347"), "07990347");
    });
  });
});