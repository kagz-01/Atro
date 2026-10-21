import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isPreviewPersonaKey,
  personaCookieAssignment,
  personaKeyFromCookieHeader,
  PREVIEW_PERSONA_COOKIE,
  PREVIEW_PERSONAS,
  previewPersona,
} from "./preview-personas.ts";

describe("preview personas", () => {
  it("pins each seat's identity so seeded rows stay findable", () => {
    const byKey = Object.fromEntries(
      PREVIEW_PERSONAS.map((p) => [p.key, `${p.userId}|${p.email}`]),
    );
    assert.deepEqual(byKey, {
      boss: "dev-user|hello@atro.ke",
      office: "dev-staff|juma@atro.ke",
      local: "dev-local|wanjiku@example.com",
      abroad: "dev-abroad|b.otieno@example.com",
    });
  });

  it("resolves each known key to itself", () => {
    for (const persona of PREVIEW_PERSONAS) {
      assert.equal(previewPersona(persona.key).key, persona.key);
      assert.equal(previewPersona(persona.key).userId, persona.userId);
    }
  });

  it("falls back to the boss for anything unknown", () => {
    assert.equal(previewPersona("nope").key, "boss");
    assert.equal(previewPersona("").key, "boss");
    assert.equal(previewPersona(null).key, "boss");
    assert.equal(previewPersona(undefined).key, "boss");
    assert.equal(previewPersona().key, "boss");
  });

  it("recognises exactly the four seat keys", () => {
    assert.equal(isPreviewPersonaKey("boss"), true);
    assert.equal(isPreviewPersonaKey("office"), true);
    assert.equal(isPreviewPersonaKey("local"), true);
    assert.equal(isPreviewPersonaKey("abroad"), true);
    assert.equal(isPreviewPersonaKey("root"), false);
    assert.equal(isPreviewPersonaKey(7), false);
  });

  it("names the cookie the switcher writes", () => {
    assert.equal(PREVIEW_PERSONA_COOKIE, "atro-preview-persona");
  });

  it("gives every seat a one-word switcher label", () => {
    assert.deepEqual(
      PREVIEW_PERSONAS.map((p) => p.short),
      ["Boss", "Office", "Local", "Abroad"],
    );
  });

  it("reads the persona key out of a raw cookie header", () => {
    assert.equal(
      personaKeyFromCookieHeader("token=abc; atro-preview-persona=local; a=1"),
      "local",
    );
    assert.equal(
      personaKeyFromCookieHeader("atro-preview-persona=abroad"),
      "abroad",
    );
    assert.equal(personaKeyFromCookieHeader("session=xyz"), null);
    assert.equal(
      personaKeyFromCookieHeader("atro-preview-persona=stale"),
      null,
    );
    assert.equal(personaKeyFromCookieHeader("atro-preview-persona=boss"), "boss");
    assert.equal(personaKeyFromCookieHeader(null), null);
    assert.equal(personaKeyFromCookieHeader(""), null);
    assert.equal(personaKeyFromCookieHeader(undefined), null);
  });

  it("writes the switcher cookie site-wide for a year", () => {
    assert.equal(
      personaCookieAssignment("office"),
      "atro-preview-persona=office; path=/; max-age=31536000; samesite=lax",
    );
    assert.equal(
      personaCookieAssignment("local").startsWith("atro-preview-persona="),
      true,
    );
  });
});
