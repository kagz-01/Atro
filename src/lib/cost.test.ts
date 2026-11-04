import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { estimateCost, type CostInput } from "./cost.ts";

const BASE_INPUT: CostInput = {
  type: "Residential",
  zone: "garissa",
  sqm: 100,
  finish: "standard",
};

describe("indicative cost model", () => {
  it("uses a neutral baseline and names counties without an area factor", () => {
    const result = estimateCost(BASE_INPUT);

    assert.equal(result.zoneName, "Garissa");
    assert.match(result.locationNote, /neutral baseline/);
    assert.equal(result.perSqm, 55_000);
  });

  it("uses the existing Coast factor for counties in the Coast group", () => {
    const countyEstimate = estimateCost({ ...BASE_INPUT, zone: "mombasa" });
    const regionEstimate = estimateCost({ ...BASE_INPUT, zone: "coast" });

    assert.equal(countyEstimate.zoneName, "Mombasa");
    assert.equal(countyEstimate.perSqm, regionEstimate.perSqm);
  });

  it("makes the displayed midpoint breakdown add up exactly", () => {
    const result = estimateCost({ ...BASE_INPUT, zone: "kiambu", sqm: 220 });
    const breakdownTotal = Object.values(result.breakdown).reduce(
      (total, amount) => total + amount,
      0,
    );

    assert.equal(breakdownTotal, result.perSqm * 220);
  });

  it("uses the minimum modelled floor area consistently", () => {
    const result = estimateCost({ ...BASE_INPUT, sqm: 10 });
    const breakdownTotal = Object.values(result.breakdown).reduce(
      (total, amount) => total + amount,
      0,
    );

    assert.equal(breakdownTotal, result.perSqm * 40);
  });
});
