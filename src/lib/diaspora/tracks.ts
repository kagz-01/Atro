// ATRO service tracks.
//
// The portal used to assume every project was a nine-stage build. ATRO sells
// design, advisory, specialist and post-construction work too, and a client who
// bought only a BOQ or a feasibility study has nothing to track under that
// assumption. A track is the shape of one kind of engagement: its stages, how the
// programme is shared out, and how the money is scheduled.
//
// Pure data and pure functions — no I/O — so the planning rules are unit-tested
// directly. Weights are relative and normalised here, so a track can be edited
// without re-balancing the whole programme by hand.

export type TrackId =
  | "construction"
  | "renovation"
  | "design"
  | "advisory"
  | "specialist"
  | "maintenance";

export type TrackStage = {
  name: string;
  summary: string;
  /** Relative share of the programme. Normalised, so these need not sum to 1. */
  weight: number;
};

export type TrackPayment = {
  /** Percentage of the contract value. Every track's payments sum to 100. */
  pct: number;
  label: string;
};

export type Track = {
  id: TrackId;
  label: string;
  summary: string;
  /** The service slugs in `site.ts` this track covers. */
  services: string[];
  stages: TrackStage[];
  payments: TrackPayment[];
};

export const TRACKS: Record<TrackId, Track> = {
  construction: {
    id: "construction",
    label: "Full build (design and build)",
    summary:
      "Land and design through to handover. The default for a house you are having built.",
    services: ["construction", "building-from-abroad"],
    stages: [
      { name: "Land and due diligence", summary: "Confirming the land is genuinely owned, genuinely for sale, and genuinely the size it claims.", weight: 0.08 },
      { name: "Concept and cost options", summary: "Design and cost planning happen together, so the sketch and the budget agree before you commit.", weight: 0.1 },
      { name: "Developed design and approvals", summary: "Structural and architectural design, then the statutory approvals that depend on it.", weight: 0.12 },
      { name: "Bill of Quantities and contract", summary: "A measured, priced document and a contract with a locked scope and payment terms.", weight: 0.1 },
      { name: "Site establishment and substructure", summary: "Setting out, excavation, foundations and slab to the agreed drawings.", weight: 0.06 },
      { name: "Superstructure", summary: "Walls, columns, ring beams and slabs to roof level, inspected as each level completes.", weight: 0.28 },
      { name: "Roof, first fix and finishes", summary: "Covering, services rough-in, plaster, joinery and painting to the specification.", weight: 0.14 },
      { name: "Second fix, testing and approvals", summary: "Commissioning, statutory inspections and the paperwork the county requires.", weight: 0.08 },
      { name: "Snagging and handover", summary: "Defects closed, keys, O&M manuals, warranties and the certificate of occupation.", weight: 0.04 },
    ],
    payments: [
      { pct: 10, label: "Mobilisation and design completion" },
      { pct: 10, label: "Substructure complete" },
      { pct: 15, label: "Superstructure — ground floor" },
      { pct: 15, label: "Superstructure — first floor" },
      { pct: 15, label: "Roof complete" },
      { pct: 15, label: "First fix — services" },
      { pct: 10, label: "Finishes and second fix" },
      { pct: 10, label: "Practical completion" },
    ],
  },

  renovation: {
    id: "renovation",
    label: "Renovation or adaptive reuse",
    summary: "Existing building, so the first work is finding out what you actually have.",
    services: ["renovation-restoration"],
    stages: [
      { name: "Condition survey", summary: "What is there now, what is unsafe, and what can be saved. Photographs and a written report.", weight: 0.1 },
      { name: "Structural assessment", summary: "Existing frame, foundations and elements tested against the new use you want.", weight: 0.12 },
      { name: "Design and services plan", summary: "New layout, and where the water, power and drainage have to go.", weight: 0.15 },
      { name: "Demolition and making good", summary: "Strip-out to the structural line, with the reuse plan settled before anything goes.", weight: 0.13 },
      { name: "Structure and envelope", summary: "New walls, slab, roof or openings where the survey found them necessary.", weight: 0.25 },
      { name: "Services and finishes", summary: "Rough-in, finishes, joinery, painting — to the agreed specification.", weight: 0.17 },
      { name: "Commissioning and handover", summary: "Testing, defects, manuals and warranties.", weight: 0.08 },
    ],
    payments: [
      { pct: 15, label: "Survey and assessment" },
      { pct: 15, label: "Design and services plan" },
      { pct: 20, label: "Demolition and making good" },
      { pct: 25, label: "Structure and envelope" },
      { pct: 15, label: "Services and finishes" },
      { pct: 10, label: "Commissioning and handover" },
    ],
  },

  design: {
    id: "design",
    label: "Design only",
    summary: "Drawings, approvals and a bill of quantities — you appoint your own contractor.",
    services: ["architectural-design", "structural-design", "interior-spatial", "landscape-architecture", "master-planning"],
    stages: [
      { name: "Brief and site survey", summary: "What you want to build, what the site allows, and what you can afford.", weight: 0.12 },
      { name: "Concept options with costs", summary: "Two or three directions, each with an indicative cost, not just a mood.", weight: 0.18 },
      { name: "Developed design", summary: "The chosen option drawn properly, coordinated with structure and services.", weight: 0.25 },
      { name: "Statutory approvals", summary: "County building approval and anything else the drawings need.", weight: 0.2 },
      { name: "Construction drawings and BOQ", summary: "The set a contractor prices and builds from, with a measured bill of quantities.", weight: 0.17 },
      { name: "Tender support and drawing handover", summary: "We help you compare bids and hand over a complete, coordinated package.", weight: 0.08 },
    ],
    payments: [
      { pct: 20, label: "Brief, survey and concept options" },
      { pct: 30, label: "Developed design" },
      { pct: 25, label: "Approvals" },
      { pct: 25, label: "Construction drawings and BOQ" },
    ],
  },

  advisory: {
    id: "advisory",
    label: "BOQ, feasibility or due diligence",
    summary: "A decision-support engagement. You leave with a document you can act on.",
    services: ["boq-cost-planning", "feasibility-due-diligence", "real-estate-advisory", "project-financing"],
    stages: [
      { name: "Engagement and scope", summary: "What decision you need to make, and what evidence it will take.", weight: 0.1 },
      { name: "Data gathering", summary: "Official land search, survey, drawings, site measurement or market data.", weight: 0.22 },
      { name: "Analysis", summary: "Quantities, rates, options, or viability — worked through, not asserted.", weight: 0.28 },
      { name: "Findings and recommendations", summary: "What we found, what it means, and what we would do about it.", weight: 0.22 },
      { name: "Final report and review meeting", summary: "The issued document, and a walkthrough so nothing is misread.", weight: 0.18 },
    ],
    payments: [
      { pct: 40, label: "Scope and data gathering" },
      { pct: 40, label: "Analysis and recommendations" },
      { pct: 20, label: "Final report and review" },
    ],
  },

  specialist: {
    id: "specialist",
    label: "Specialist service",
    summary: "Sustainability, smart systems, BIM or environmental assessment, scoped on its own.",
    services: [
      "sustainability-green-building",
      "smart-home-integration",
      "construction-technology-bim",
      "environmental-impact-assessment",
    ],
    stages: [
      { name: "Scoping", summary: "The standard you are being held to, and who holds it.", weight: 0.12 },
      { name: "Site audit or assessment", summary: "Measured on site, with the readings or observations recorded.", weight: 0.26 },
      { name: "Specification or model", summary: "What to install or what to change, specified tightly enough to price.", weight: 0.24 },
      { name: "Installation or implementation", summary: "Carried out and witnessed, not merely recommended.", weight: 0.26 },
      { name: "Commissioning and sign-off", summary: "Tested, documented, and handed over with the certificates.", weight: 0.12 },
    ],
    payments: [
      { pct: 30, label: "Scoping and audit" },
      { pct: 30, label: "Specification" },
      { pct: 30, label: "Installation and commissioning" },
      { pct: 10, label: "Handover documentation" },
    ],
  },

  maintenance: {
    id: "maintenance",
    label: "Maintenance and inspections",
    summary: "After handover. Finding defects early is cheaper than finding them late.",
    services: ["maintenance-inspections", "ffep-procurement", "construction-training"],
    stages: [
      { name: "Inspection cycle", summary: "A scheduled walk of the building against the handover condition.", weight: 0.25 },
      { name: "Defects list and risk ranking", summary: "What needs attention now, what can wait, and what is getting worse.", weight: 0.25 },
      { name: "Remedial plan and quote", summary: "Priced works, so you can approve, defer or decline each item.", weight: 0.2 },
      { name: "Remedial works", summary: "Only what you approved, carried out and witnessed.", weight: 0.2 },
      { name: "Re-inspection and report", summary: "Confirmation the works held, and the next cycle scheduled.", weight: 0.1 },
    ],
    payments: [
      { pct: 25, label: "Inspection and defects list" },
      { pct: 25, label: "Remedial works — first call-off" },
      { pct: 25, label: "Remedial works — subsequent call-offs" },
      { pct: 25, label: "Annual programme retainer" },
    ],
  },
};

export const TRACK_LIST: Track[] = Object.values(TRACKS);

export const TRACK_IDS = Object.keys(TRACKS) as TrackId[];

export function isTrackId(value: string): value is TrackId {
  return value in TRACKS;
}

export function trackById(id: string): Track {
  const track = isTrackId(id) ? TRACKS[id] : undefined;
  return track ?? TRACKS.construction;
}

/** The programme share of each stage, normalised so the whole programme is covered. */
export function normalisedWeights(track: Track): number[] {
  const total = track.stages.reduce((sum, stage) => sum + stage.weight, 0);
  if (total <= 0) return track.stages.map(() => 1 / Math.max(1, track.stages.length));
  return track.stages.map((stage) => stage.weight / total);
}

export type StageWindow = { start: string; end: string; spanDays: number };

/**
 * Spread a track across a programme. Each stage gets at least a week, because a
 * stage shorter than that is not a thing a client can see happening.
 */
export function stageWindows(
  track: Track,
  start: Date,
  totalDays: number,
  toLabel: (d: Date) => string,
): StageWindow[] {
  const weights = normalisedWeights(track);
  const windows: StageWindow[] = [];
  let cursor = start.getTime();

  weights.forEach((weight, index) => {
    const requested = Math.round(totalDays * weight);
    const spanDays = Math.max(7, requested);
    const end = cursor + spanDays * 86_400_000;
    windows.push({ start: toLabel(new Date(cursor)), end: toLabel(new Date(end)), spanDays });
    cursor = end;
    void index;
  });

  return windows;
}

/** Tranches that sum exactly to the contract value — no rounding drift. */
export function paymentSchedule(track: Track, contractValue: number) {
  return track.payments.map((plan) => ({
    label: plan.label,
    pct: plan.pct,
    amount: Math.round((contractValue * plan.pct) / 100),
  }));
}

export function paymentsTotal(track: Track, contractValue: number): number {
  return paymentSchedule(track, contractValue).reduce((sum, tranche) => sum + tranche.amount, 0);
}

/** Programme length in days, with a floor so a track is never a single week. */
export function programmeDays(from: Date, to: Date): number {
  return Math.max(60, Math.round((to.getTime() - from.getTime()) / 86_400_000));
}