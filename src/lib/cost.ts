import { ZONES } from "@/lib/site";
import { formatKes, formatKesRange } from "@/lib/utils";

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

const BASE: Record<CostProjectType, Record<FinishId, number>> = {
  Residential: { essential: 42000, standard: 62000, premium: 95000, signature: 140000 },
  Commercial: { essential: 48000, standard: 72000, premium: 110000, signature: 160000 },
  Institutional: { essential: 40000, standard: 58000, premium: 88000, signature: 120000 },
  Church: { essential: 38000, standard: 55000, premium: 82000, signature: 115000 },
  School: { essential: 40000, standard: 56000, premium: 80000, signature: 110000 },
  Renovation: { essential: 28000, standard: 45000, premium: 70000, signature: 100000 },
};

const ZONE_MULT: Record<string, number> = {
  nairobi: 1.08,
  kiambu: 1.0,
  machakos: 0.96,
  kajiado: 1.02,
  coast: 1.14,
  nakuru: 0.94,
  kisumu: 0.95,
  diaspora: 1.06,
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
  "Indicative construction range only — not a quotation. Excludes land, statutory fees, professional sign-off where separately appointed, furniture and extraordinary ground conditions. A site visit and a BOQ come before any figure you should trust.";

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

  return {
    structure: Math.round(total * 0.35),
    finishes: Math.round(total * (isHighEnd ? 0.32 : 0.28)),
    services: Math.round(total * 0.18),
    external: Math.round(total * 0.10),
    professional: Math.round(total * 0.08),
    contingency: Math.round(total * 0.07),
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
