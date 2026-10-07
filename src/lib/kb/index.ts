// ATRO Knowledge Base — Index
// Single import for all knowledge. Agent uses this to answer any question about ATRO.
//
// Usage:
//   import { KB } from "@/lib/kb";
//   const services = KB.design.services;
//   const phases = KB.construction.phases;
//   const faqs = KB.consultancy.faqs;
//   const rates = KB.reference.rates;
//   const diaspora = KB.diaspora;

export { DESIGN_KB } from "./design";
export { CONSTRUCTION_KB } from "./construction";
export { CONSULTANCY_KB } from "./consultancy";
export { REFERENCE_KB } from "./reference";
export { DIASPORA_KB } from "./diaspora";

import { DESIGN_KB } from "./design";
import { CONSTRUCTION_KB } from "./construction";
import { CONSULTANCY_KB } from "./consultancy";
import { REFERENCE_KB } from "./reference";
import { DIASPORA_KB } from "./diaspora";

/**
 * Unified knowledge base.
 *
 * Structure:
 *   KB.design         — What we do: services, process, standards, building types, finish levels
 *   KB.construction   — How we build: phases, methods, QC, site management, specs, programmes
 *   KB.consultancy    — What we advise: cost planning, BOQ, project management, FAQs, regulations
 *   KB.reference      — Numbers: rates, fees, utilities, location notes
 *   KB.diaspora       — Kenyans abroad: market, pain points, trust, communication, payments
 */
export const KB = {
  design: DESIGN_KB,
  construction: CONSTRUCTION_KB,
  consultancy: CONSULTANCY_KB,
  reference: REFERENCE_KB,
  diaspora: DIASPORA_KB,
} as const;

export type KBType = typeof KB;
