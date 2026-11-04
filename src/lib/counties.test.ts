import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countyBySlug, KENYA_COUNTIES } from "./counties.ts";

describe("Kenya county directory", () => {
  it("contains all 47 counties with unique slugs", () => {
    assert.equal(KENYA_COUNTIES.length, 47);
    assert.equal(new Set(KENYA_COUNTIES.map((county) => county.slug)).size, 47);
  });

  it("keeps the existing multi-county Coast coverage grouped", () => {
    const coastCounties = KENYA_COUNTIES.filter(
      (county) => county.serviceZoneSlug === "coast",
    );

    assert.deepEqual(
      coastCounties.map((county) => county.name),
      ["Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta"],
    );
  });

  it("does not imply coverage for counties without a confirmed area mapping", () => {
    assert.equal(countyBySlug("nairobi")?.serviceZoneSlug, "nairobi");
    assert.equal(countyBySlug("garissa")?.serviceZoneSlug, undefined);
    assert.equal(countyBySlug("not-a-county"), undefined);
  });
});
