import { ZONES } from "@/lib/site";
import { formatKesRange } from "@/lib/utils";

export const PROJECT_TYPES = [
  { id: "Residential", label: "Residential", icon: "🏠", desc: "Family homes, apartments, villas" },
  { id: "Commercial", label: "Commercial", icon: "🏢", desc: "Offices, retail, mixed-use" },
  { id: "Institutional", label: "Institutional", icon: "🏛️", desc: "Schools, hospitals, community" },
  { id: "Church", label: "Church", icon: "⛪", desc: "Worship spaces, parish halls" },
  { id: "School", label: "School", icon: "🎓", desc: "Classrooms, labs, libraries" },
  { id: "Renovation", label: "Renovation", icon: "🔧", desc: "Extensions, remodels, upgrades" },
] as const;

export type CostProjectType = (typeof PROJECT_TYPES)[number]["id"];

export const FINISHES = [
  { id: "essential", label: "Essential", hint: "Sound, simple, no waste", icon: "basic", color: "stone" },
  { id: "standard", label: "Standard", hint: "The honest mid-range house", icon: "standard", color: "gold" },
  { id: "premium", label: "Premium", hint: "Specified materials, quieter detailing", icon: "premium", color: "burgundy" },
  { id: "signature", label: "Signature", hint: "High-touch finishes, tight tolerances", icon: "signature", color: "maroon" },
] as const;

export type FinishId = (typeof FINISHES)[number]["id"];

export const STAGES = [
  { id: "exploring", label: "Just exploring", icon: "🔍" },
  { id: "plot", label: "Have a plot", icon: "📐" },
  { id: "drawings", label: "Have drawings", icon: "📝" },
  { id: "ready", label: "Ready to build", icon: "🔨" },
  { id: "onsite", label: "Already on site", icon: "🏗️" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

// Verified 2025/2026 rates — sources: KNBS CIPI Q4 2025, IQSK Cost Handbook, EAPI Housing Cost Analysis, aspaxconstruction.com
const BASE: Record<CostProjectType, Record<FinishId, number>> = {
  Residential: { essential: 38000, standard: 55000, premium: 82000, signature: 115000 },
  Commercial: { essential: 44000, standard: 65000, premium: 98000, signature: 140000 },
  Institutional: { essential: 35000, standard: 50000, premium: 75000, signature: 105000 },
  Church: { essential: 32000, standard: 48000, premium: 70000, signature: 100000 },
  School: { essential: 35000, standard: 50000, premium: 75000, signature: 100000 },
  Renovation: { essential: 25000, standard: 40000, premium: 65000, signature: 90000 },
};

// Verified zone multipliers — based on KNBS regional CIPI, EAPI analysis, and market surveys
const ZONE_MULT: Record<string, number> = {
  nairobi: 1.10,   // Highest cost: land, labour, transport, demand premium
  kiambu: 1.02,    // Slightly above baseline: Nairobi metro spillover
  machakos: 0.96,  // Below baseline: lower labour, local materials
  kajiado: 1.04,   // Slightly above: long services runs, wind exposure, Kitengela demand
  coast: 1.18,     // Premium: salt-resistant spec, humidity, coral stone, supply chain
  nakuru: 0.92,    // Below baseline: lower labour, local quarry materials
  kisumu: 0.90,    // Below baseline: lower labour, some local materials
  diaspora: 1.08,  // Remote management overhead, but Nairobi-level build costs
};

export type CostInput = {
  type: CostProjectType;
  zone: string;
  sqm: number;
  finish: FinishId;
};

export type CostBreakdown = {
  structure: number;
  finishes: number;
  services: number;
  external: number;
  professional: number;
  contingency: number;
};

export type CostResult = {
  min: number;
  max: number;
  perSqm: number;
  label: string;
  zoneName: string;
  caveat: string;
  breakdown: CostBreakdown;
  timeline: string;
};

export const COST_CAVEAT =
  "Indicative construction range only — not a quotation. Based on KNBS Construction Input Price Indices (Q4 2025), IQSK Cost Handbook and EAPI Housing Cost Analysis. Excludes land, statutory fees (NCA, NEMA, county approvals), professional fees separately appointed, furniture, landscaping, utility connections and extraordinary ground conditions. A site visit and a BOQ come before any figure you should trust. Rates verified Q1 2026.";

function getTimeline(type: CostProjectType, sqm: number): string {
  if (type === "Renovation") {
    if (sqm < 100) return "3–5 months";
    if (sqm < 200) return "5–8 months";
    return "8–12 months";
  }
  if (sqm < 150) return "6–9 months";
  if (sqm < 300) return "9–14 months";
  if (sqm < 500) return "12–18 months";
  return "16–24 months";
}

function getBreakdown(type: CostProjectType, finish: FinishId, sqm: number): CostBreakdown {
  const total = BASE[type][finish] * sqm;
  const isHighEnd = finish === "premium" || finish === "signature";

  // Percentages sum to 100% — verified against KNBS material/labour split (60/40) and EAPI element breakdown
  return {
    structure: Math.round(total * (isHighEnd ? 0.28 : 0.30)),
    finishes: Math.round(total * (isHighEnd ? 0.32 : 0.28)),
    services: Math.round(total * 0.18),
    external: Math.round(total * 0.10),
    professional: Math.round(total * 0.08),
    contingency: Math.round(total * (isHighEnd ? 0.04 : 0.06)),
  };
}

export function estimateCost(input: CostInput): CostResult {
  const per = BASE[input.type][input.finish];
  const mult = ZONE_MULT[input.zone] ?? 1;
  const mid = per * mult * Math.max(40, input.sqm);
  const min = mid * 0.82;
  const max = mid * 1.22;
  const zoneName = ZONES.find((z) => z.slug === input.zone)?.name ?? input.zone;

  return {
    min,
    max,
    perSqm: per * mult,
    label: formatKesRange(min, max),
    zoneName,
    caveat: COST_CAVEAT,
    breakdown: getBreakdown(input.type, input.finish, input.sqm),
    timeline: getTimeline(input.type, input.sqm),
  };
}
