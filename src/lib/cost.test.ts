import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MATERIALS,
  MATERIAL_PRICE_SOURCE,
  PPRA_PRICE_TOWNS,
} from "./materials.ts";
import { BOQ_TEMPLATES, calculatePricedSubtotal } from "./boq.ts";

describe("PPRA material price reference", () => {
  it("records the source and survey period", () => {
    assert.equal(MATERIAL_PRICE_SOURCE.published, "June 2026");
    assert.equal(MATERIAL_PRICE_SOURCE.surveyStart, "25 May 2026");
    assert.equal(MATERIAL_PRICE_SOURCE.surveyEnd, "6 June 2026");
    assert.deepEqual(PPRA_PRICE_TOWNS, [
      "Eldoret",
      "Kisumu",
      "Mombasa",
      "Nakuru",
      "Nairobi",
    ]);
  });

  it("matches the cited PPRA cement and reinforcement reference prices", () => {
    assert.equal(
      MATERIALS.find((item) => item.id === "cement-ordinary-50kg")?.allTownPrice,
      868.09,
    );
    assert.equal(
      MATERIALS.find((item) => item.id === "reinforcement-d12-12m")?.allTownPrice,
      1320.65,
    );
  });

  it("keeps every location value explicit and represents unpublished town values as null", () => {
    for (const item of MATERIALS) {
      assert.deepEqual(Object.keys(item.townPrices), PPRA_PRICE_TOWNS);
      assert.ok(item.allTownPrice > 0);
      for (const price of Object.values(item.townPrices)) {
        assert.ok(price === null || price > 0);
      }
    }

    assert.equal(
      MATERIALS.find((item) => item.id === "tile-porcelain-600x600")?.townPrices.Nakuru,
      null,
    );
  });

  it("does not prefill BOQ template quantities or rates", () => {
    for (const template of BOQ_TEMPLATES) {
      assert.ok(
        template.items.every((item) => item.quantity === 0 && item.rate === 0),
        `${template.name} should be unpriced and unmeasured`,
      );
      assert.equal(
        calculatePricedSubtotal(
          template.items.map((item, index) => ({ ...item, id: `${template.id}-${index}` })),
        ),
        0,
      );
    }
  });

  it("only totals explicitly entered quantities and rates", () => {
    assert.equal(
      calculatePricedSubtotal([
        {
          id: "priced",
          categoryId: "finishes",
          description: "Measured tile work",
          unit: "m²",
          quantity: 12,
          rate: 2500,
        },
        {
          id: "unpriced",
          categoryId: "finishes",
          description: "Unpriced plumbing",
          unit: "LS",
          quantity: 1,
          rate: 0,
        },
      ]),
      30_000,
    );
  });
});
