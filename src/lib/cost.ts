import { ZONES } from "@/lib/site";
import { formatKesRange } from "@/lib/utils";

export const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Institutional",
  "Church",
  "School",
  "Renovation",
] as const;

export type CostProjectType = (typeof PROJECT_TYPES)[number];

export const FINISHES = [
  { id: "essential", label: "Essential", hint: "Sound, simple, no waste" },
  { id: "standard", label: "Standard", hint: "The honest mid-range house" },
  { id: "premium", label: "Premium", hint: "Specified materials, quieter detailing" },
  { id: "signature", label: "Signature", hint: "High-touch finishes, tight tolerances" },
] as const;

export type FinishId = (typeof FINISHES)[number]["id"];

export const STAGES = [
  "Just exploring",
  "Have a plot",
  "Have drawings",
  "Ready to build",
  "Already on site",
] as const;

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

export type CostResult = {
  min: number;
  max: number;
  perSqm: number;
  label: string;
  zoneName: string;
  caveat: string;
};

export const COST_CAVEAT =
  "Indicative construction range only — not a quotation. Excludes land, statutory fees, professional sign-off where separately appointed, furniture and extraordinary ground conditions. A site visit and a BOQ come before any figure you should trust.";

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
  };
}
