import { ZONES } from "./site.ts";
import { countyBySlug } from "./counties.ts";
import { formatKesRange } from "./utils.ts";

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

// Indicative planning assumptions only; these are not live supplier rates or a
// substitute for a project-specific cost plan.
const BASE: Record<CostProjectType, Record<FinishId, number>> = {
  Residential: { essential: 38000, standard: 55000, premium: 82000, signature: 115000 },
  Commercial: { essential: 44000, standard: 65000, premium: 98000, signature: 140000 },
  Institutional: { essential: 35000, standard: 50000, premium: 75000, signature: 105000 },
  Church: { essential: 32000, standard: 48000, premium: 70000, signature: 100000 },
  School: { essential: 35000, standard: 50000, premium: 75000, signature: 100000 },
  Renovation: { essential: 25000, standard: 40000, premium: 65000, signature: 90000 },
};

// Existing planning factors. Counties without a mapped factor use the neutral
// baseline and must not be presented as having county-specific pricing.
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
  locationNote: string;
  caveat: string;
  breakdown: CostBreakdown;
  timeline: string;
};

export const COST_CAVEAT =
  "Indicative planning model only — not a quotation, BOQ or live supplier price. The rates and existing area factors are broad assumptions, not verified county market rates. Where no area factor is set, this range uses a neutral baseline with no county-specific adjustment. Excludes land, statutory fees (NCA, NEMA, county approvals), furniture, landscaping, utility connections and extraordinary ground conditions. Any professional-fee allowance is provisional; separately appointed fees may differ. Confirm scope, rates and site conditions with ATRO before relying on a figure.";

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

function getBreakdown(type: CostProjectType, finish: FinishId, total: number): CostBreakdown {
  const isHighEnd = finish === "premium" || finish === "signature";

  const structure = Math.round(total * (isHighEnd ? 0.28 : 0.30));
  const finishes = Math.round(total * (isHighEnd ? 0.32 : 0.28));
  const services = Math.round(total * 0.18);
  const external = Math.round(total * 0.10);
  const professional = Math.round(total * 0.08);

  return {
    structure,
    finishes,
    services,
    external,
    professional,
    contingency: total - structure - finishes - services - external - professional,
  };
}

export function estimateCost(input: CostInput): CostResult {
  const per = BASE[input.type][input.finish];
  const county = countyBySlug(input.zone);
  const pricingZone = county?.serviceZoneSlug ?? input.zone;
  const regionalFactor = ZONE_MULT[pricingZone];
  const mult = regionalFactor ?? 1;
  const area = Math.max(40, input.sqm);
  const mid = per * mult * area;
  const min = mid * 0.82;
  const max = mid * 1.22;
  const zoneName =
    county?.name ?? ZONES.find((z) => z.slug === input.zone)?.name ?? input.zone;

  return {
    min,
    max,
    perSqm: per * mult,
    label: formatKesRange(min, max),
    zoneName,
    locationNote: regionalFactor
      ? `This planning model uses its existing ${ZONES.find((zone) => zone.slug === pricingZone)?.name ?? pricingZone} area factor. It is not a verified local rate.`
      : `No county-specific planning factor is set for ${zoneName}; this range uses a neutral baseline and needs a site-specific review.`,
    caveat: COST_CAVEAT,
    breakdown: getBreakdown(input.type, input.finish, mid),
    timeline: getTimeline(input.type, area),
  };
}
