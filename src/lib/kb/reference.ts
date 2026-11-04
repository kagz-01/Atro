// ATRO Knowledge Base — REFERENCE DATA
// Rates, zones, regulations, contact info — the numbers the agent reaches for first

import { MATERIALS, MATERIAL_PRICE_SOURCE, PPRA_PRICE_TOWNS } from "@/lib/materials";

export const REFERENCE_KB = {
  // ─── Dynamic pricing policy ───
  pricingPolicy: {
    principle: "Material, labour and utility prices are planning references, not fixed quotations. They must be refreshed against live market conditions before a figure is treated as current.",
    updateCadence: {
      materials: "Every 30-90 days, or sooner if supply conditions change",
      labour: "Quarterly review with site conditions and productivity assumptions",
      utilityConnections: "As county or utility tariffs change",
      professionalFees: "Review at each project and annually as standards update",
    },
    sourceHierarchy: [
      "Current supplier quotations and delivery notes",
      "ATRO market pricing files and recent project cost data",
      "Kenya market benchmarks (KNBS, industry publications, local price lists)",
      "Earlier ATRO history only as a baseline, never as a current quote",
    ],
    updateTriggers: [
      "Supplier price movement or material shortages",
      "Fuel, transport or logistics shifts",
      "County permit or utility tariff changes",
      "A change in project specification or finish level",
      "New site conditions, geotechnical findings or remote delivery constraints",
    ],
    decisionRule: "Only quote a material unit price when it appears in the dated PPRA table, with its town and survey date. Never derive a whole-project total from floor area, finish level or a town multiplier. Project totals require measured quantities and current project-specific quotations.",
  },

  materialPriceGuide: {
    source: MATERIAL_PRICE_SOURCE,
    surveyedTowns: PPRA_PRICE_TOWNS,
    allTownPriceMethod:
      "PPRA's All column is its overall mean across valid survey prices, not an arithmetic average of the five town prices. Where a town-level mean is not reported, PPRA says the All reference applies.",
    items: MATERIALS,
  },

  professionalFees: {
    note:
      "No generic fee percentages or statutory charge figures are published here. Confirm current professional fees, authority requirements and county charges from the relevant current schedule and project-specific proposal.",
  },

  utilities: {
    note:
      "Do not give a generic connection-cost allowance. Obtain a current quote from the relevant utility or service provider after confirming location, load, distance and connection requirements.",
  },

  locationNotes: {
    nairobi: "PPRA June 2026 town-level material prices are available for Nairobi. Confirm current supplier prices, delivery and site-specific requirements.",
    kiambu: "No direct PPRA June 2026 town sample is listed for Kiambu. Do not copy Nairobi prices as a county quote; request current supplier quotations for the site.",
    machakos: "No direct PPRA June 2026 town sample is listed for Machakos. Confirm current local supplier and delivery prices for the site.",
    kajiado: "No direct PPRA June 2026 town sample is listed for Kajiado. Confirm current local supplier, water and delivery requirements for the site.",
    coast: "PPRA June 2026 includes Mombasa town prices, not every coastal location. Confirm current supplier rates, delivery and project specification for the site.",
    nakuru: "PPRA June 2026 town-level material prices are available for Nakuru. Confirm current supplier prices, delivery and site-specific requirements.",
    kisumu: "PPRA June 2026 town-level material prices are available for Kisumu. Confirm current supplier prices, delivery and site-specific requirements.",
    diaspora: "Diaspora describes the client service and communication arrangement, not a construction-price multiplier. Use the actual project location in Kenya and current local quotations.",
  },
} as const;
