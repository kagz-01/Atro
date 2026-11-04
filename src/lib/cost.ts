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
  { id: "standard", label: "Standard", hint: "Practical, durable finishes", icon: "standard", color: "gold" },
  { id: "premium", label: "Premium", hint: "Specified materials and detailing", icon: "premium", color: "burgundy" },
  { id: "signature", label: "Signature", hint: "High-touch, bespoke finishes", icon: "signature", color: "maroon" },
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

export const COST_CAVEAT =
  "ATRO does not generate a whole-project construction total from floor area or finish level. A reliable project cost needs a defined scope, measured quantities, current local supplier and contractor quotations, delivery and site conditions. The PPRA material prices are dated survey references for selected individual items only, not a BOQ or a live quote.";
