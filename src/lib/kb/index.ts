// ATRO Knowledge Base — Index
// Single import for all knowledge. Agent uses this to answer any question about ATRO.
//
// Usage:
//   import { KB } from "@/lib/kb";
//   const services = KB.design.services;
//   const phases = KB.construction.phases;
//   const faqs = KB.consultancy.faqs;
//   const prices = KB.reference.materialPriceGuide;
//   const diaspora = KB.diaspora;

export { DESIGN_KB } from "./design";
export { CONSTRUCTION_KB } from "./construction";
export { CONSULTANCY_KB } from "./consultancy";
export { REFERENCE_KB } from "./reference";
export { DIASPORA_KB } from "./diaspora";
export { AGENT_OPERATING_MANUAL } from "./operating-manual";

import { DESIGN_KB } from "./design";
import { CONSTRUCTION_KB } from "./construction";
import { CONSULTANCY_KB } from "./consultancy";
import { REFERENCE_KB } from "./reference";
import { DIASPORA_KB } from "./diaspora";
import { AGENT_OPERATING_MANUAL } from "./operating-manual";

/**
 * Unified knowledge base.
 *
 * Structure:
 *   KB.design         — What we do: services, process, standards, building types, finish levels
 *   KB.construction   — How we build: phases, methods, QC, site management, specs, programmes
 *   KB.consultancy    — What we advise: cost planning, BOQ, project management, FAQs, regulations
 *   KB.reference      — Dated material prices, source notes and pricing guardrails
 *   KB.diaspora       — Kenyans abroad: market, pain points, trust, communication, payments
 */
export const KB = {
  design: DESIGN_KB,
  construction: CONSTRUCTION_KB,
  consultancy: CONSULTANCY_KB,
  reference: REFERENCE_KB,
  diaspora: DIASPORA_KB,
  operatingManual: AGENT_OPERATING_MANUAL,
  serviceIndex: [
    ...DESIGN_KB.services.map((s) => ({
      id: s.id,
      category: "design",
      name: s.name,
      summary: s.description,
      tags: ["design", s.name.toLowerCase(), ...s.deliverables.map((d) => d.toLowerCase())],
      terms: [s.name, "design", s.description.toLowerCase()],
    })),
    ...CONSTRUCTION_KB.phases.map((p) => ({
      id: p.id,
      category: "construction",
      name: p.name,
      summary: p.description,
      tags: ["construction", p.name.toLowerCase(), ...p.activities.map((a) => a.toLowerCase())],
      terms: [p.name, "construction", p.description.toLowerCase()],
    })),
    ...CONSULTANCY_KB.services.map((s) => ({
      id: s.id,
      category: "consultancy",
      name: s.name,
      summary: s.description,
      tags: ["consultancy", s.name.toLowerCase(), ...s.deliverables.map((d) => d.toLowerCase())],
      terms: [s.name, "consultancy", s.description.toLowerCase()],
    })),
    {
      id: "zone-map",
      category: "tool",
      name: "Zone Map",
      summary: "Delivery and coverage status across Kenyan counties and remote service access.",
      tags: ["zone", "map", "coverage", "county", "delivery", "service area"],
      terms: ["zone map", "coverage", "county", "service area", "where we build"],
    },
    {
      id: "material-prices",
      category: "tool",
      name: "PPRA Material Price Reference",
      summary: "Dated PPRA unit-price references for selected materials in five surveyed towns; not a whole-project estimate or live quote.",
      tags: ["materials", "prices", "price reference", "cement", "tiles", "steel", "build package"],
      terms: ["material price", "materials", "price reference", "PPRA", "cement", "tiles", "steel"],
    },
    {
      id: "boq-generator",
      category: "tool",
      name: "BOQ Worksheet",
      summary: "Unpriced scope prompts and subtotals for lines with entered quantities and rates; not a complete project estimate or contract BOQ.",
      tags: ["boq", "quantities", "worksheet", "bill of quantities", "cost plan"],
      terms: ["boq", "bill of quantities", "quantities", "worksheet", "cost plan"],
    },
  ],
  decisionModel: {
    defaultApproach: "Start with scope, site, drawings and finish preferences. Use the dated PPRA table only for listed material unit prices, then use measured quantities and current local quotations for project pricing.",
    routeToHuman: [
      "The client wants a fixed price or a signed quotation",
      "The project requires a measured BOQ before commitment",
      "The site has unusual ground or service conditions",
      "A county, authority or professional registration issue needs clarity",
      "The brief is outside standard ATRO service offerings",
    ],
  },
} as const;

export type KBType = typeof KB;
export const KB_SEARCH_TERMS = [
  "design",
  "construction",
  "consultancy",
  "material prices",
  "zone map",
  "boq",
  "diaspora",
  "project management",
  "feasibility",
  "site supervision",
  "NCA",
  "NEMA",
  "county approval",
  "project lifecycle",
] as const;
