import { strict as assert } from "node:assert";
import { test, describe } from "node:test";
import { leadLocality, leadProfile, usableZone } from "./enquiry-lead.ts";

const ABROAD = {
  name: "Amina Noor",
  email: "Amina@Example.com",
  phone: "+447700900123",
  diaspora: true,
  country: "United Kingdom",
  timezone: "Europe/London",
};

const LOCAL = {
  name: "Kipchoge Rotich",
  email: "kip@example.com",
  phone: "+254799034712",
  diaspora: false,
  country: "",
  timezone: "",
};

describe("usableZone", () => {
  test("a real IANA zone passes through", () => {
    assert.equal(usableZone("Europe/London"), "Europe/London");
    assert.equal(usableZone("  Asia/Dubai "), "Asia/Dubai");
  });

  test("the wizard's explicit Other is not a zone", () => {
    assert.equal(usableZone("other"), "");
  });

  test("anything the runtime cannot place is refused, not guessed", () => {
    assert.equal(usableZone("Somewhere/Far"), "");
    assert.equal(usableZone(""), "");
    assert.equal(usableZone("   "), "");
  });
});

describe("leadLocality", () => {
  test("an abroad lead's country and zone become the project's own", () => {
    assert.deepEqual(leadLocality(ABROAD), {
      clientCity: "United Kingdom",
      clientTz: "Europe/London",
    });
  });

  test("a local lead keeps the empty locality it always had", () => {
    assert.deepEqual(leadLocality(LOCAL), { clientCity: "", clientTz: "" });
  });

  test("country Other and zone other both land as unset, never as labels", () => {
    const locality = leadLocality({
      diaspora: true,
      country: "Other",
      timezone: "other",
    });
    assert.deepEqual(locality, { clientCity: "", clientTz: "" });
  });
});

describe("leadProfile", () => {
  test("the abroad lead arrives typed for the Abroad view, name and zone intact", () => {
    const profile = leadProfile(ABROAD);
    assert.equal(profile.clientType, "diaspora");
    assert.equal(profile.country, "United Kingdom");
    assert.equal(profile.timezone, "Europe/London");
    assert.equal(profile.displayName, "Amina Noor");
    assert.equal(profile.initials, "AN");
    assert.equal(profile.email, "Amina@Example.com");
    assert.equal(profile.phone, "+447700900123");
  });

  test("a local lead stays an ordinary profile with no invented abroad facts", () => {
    const profile = leadProfile(LOCAL);
    assert.equal(profile.clientType, "individual");
    assert.equal(profile.country, "");
    assert.equal(profile.timezone, "");
    assert.equal(profile.initials, "KR");
  });

  test("a lead who declined both abroad questions still gets a usable profile", () => {
    const profile = leadProfile({
      ...ABROAD,
      country: "Other",
      timezone: "other",
    });
    assert.equal(profile.clientType, "diaspora");
    assert.equal(profile.country, "");
    assert.equal(profile.timezone, "");
    assert.equal(profile.displayName, "Amina Noor");
  });
});
