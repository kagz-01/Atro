// ATRO Knowledge Base — REFERENCE DATA
// Dated references, zones, regulations, and contact info.

import { MATERIALS, MATERIAL_PRICE_SOURCE, PPRA_PRICE_TOWNS } from "@/lib/materials";

export const REFERENCE_KB = {
  // ─── Pricing policy ───
  pricingPolicy: {
    principle: "The PPRA June 2026 table is a dated reference for selected material unit prices only, not a live quote or whole-project estimate. Do not describe an unverified price as current.",
    sourceHierarchy: [
      "Dated supplier or contractor quotations that match the project's location, specification and scope",
      "PPRA June 2026 only for an item and surveyed town explicitly listed in the reference table",
      "Official indices and published market benchmarks as context only, not as direct project rates",
      "Earlier ATRO history only as a baseline, never as a current quote",
    ],
    updateTriggers: [
      "A newer official reference or dated supplier quotation is available",
      "Supplier price movement or material shortages are confirmed",
      "Fuel, transport or logistics shifts affect a project-specific quotation",
      "A change in project specification, site conditions or delivery requirements",
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
