// ATRO Knowledge Base — REFERENCE DATA
// Rates, zones, regulations, contact info — the numbers the agent reaches for first

export const REFERENCE_KB = {
  // ─── Construction Rates (Q1 2026) ───
  rates: {
    note: "Indicative rates for Nairobi. Outside Nairobi, apply zone multipliers.",
    baseCosts: {
      residential: {
        essential: { min: 35000, max: 45000 },
        standard: { min: 50000, max: 65000 },
        premium: { min: 70000, max: 95000 },
        signature: { min: 100000, max: 120000 },
      },
      commercial: {
        shell: { min: 30000, max: 45000 },
        standard: { min: 55000, max: 75000 },
        premium: { min: 80000, max: 130000 },
        highSpec: { min: 120000, max: 180000 },
      },
      industrial: {
        warehouse: { min: 25000, max: 40000 },
        factory: { min: 40000, max: 65000 },
        coldStorage: { min: 70000, max: 110000 },
      },
    },
    zoneMultipliers: {
      nairobi: 1.10,
      kiambu: 1.03,
      machakos: 0.98,
      kajiado: 0.98,
      coast: 1.18,
      nakuru: 0.92,
      kisumu: 0.90,
      diaspora: 1.40,
    },
    stageMultipliers: {
      feasibility: 0.0,
      concept: 0.6,
      developed: 0.85,
      technical: 1.0,
    },
    breakdown: {
      structure: 35,
      finishes: 25,
      services: 18,
      external: 10,
      professional: 7,
      contingency: 5,
    },
  },

  // ─── Professional Fees (AAK / Market) ───
  professionalFees: {
    architect: { pctRange: "5-8%", basis: "Of construction cost", note: "AAK recommended schedule" },
    quantitySurveyor: { pctRange: "0.8-1.5%", basis: "Of construction cost" },
    structuralEngineer: { pctRange: "3-5%", basis: "Of construction cost" },
    mepEngineer: { pctRange: "3-5%", basis: "Of construction cost" },
    projectManager: { pctRange: "3-6%", basis: "Of construction cost" },
    landscapeArchitect: { pctRange: "3-5%", basis: "Of landscape cost" },
    ncaRegistration: { fixed: "0.5-1% of project value", note: "Paid by contractor" },
    nema: { fixed: "KES 50,000-100,000", note: "Depends on project size" },
    countyApproval: { fixed: "KES 80,000-200,000", note: "Depends on county and project size" },
  },

  // ─── Utility Connections (Typical) ───
  utilities: {
    water: { range: "KES 50,000-100,000", note: "Varies by county and distance to main" },
    electricity: { range: "KES 35,000-85,000", note: "Depends on load and distance" },
    sewer: { range: "KES 60,000-150,000", note: "Where available; septic tank alternative" },
    internet: { range: "KES 15,000-30,000", note: "Fibre installation if available" },
  },

  // ─── Zambia Cost Plan Reference (from previous conversation) ───
  // Kept for context — not actively used
  zambiaBenchmark: {
    note: "Zambia reference rates — kept for comparison only. Actual rates in site.ts and cost.ts",
    residentialPerSqm: { min: 7000, max: 25000 },
    commercialPerSqm: { min: 15000, max: 50000 },
    industrialPerSqm: { min: 8000, max: 25000 },
  },

  // ─── Location Notes ───
  locationNotes: {
    nairobi: "Hub of construction activity. Highest rates. Best access to materials, skilled labour and contractors. County government is functional but slow.",
    kiambu: "Greater Nairobi metro. Rates close to Nairobi. Good for residential estates. County process similar to Nairobi.",
    machakos: "Satellite towns growing fast. Lower labour rates. Some materials transported from Nairobi.",
    kajiado: "Athi River, Ngong growing. Lower rates. Some materials local (stone). Water may be a constraint.",
    coast: "Mombasa and surrounding. 10-20% premium over Nairobi due to transport, moisture-resistant materials, and coastal regulations. Swahili architecture considerations.",
    nakuru: "Regional hub. Good material availability. Rates 5-10% below Nairobi. Growing construction activity.",
    kisumu: "Lake region. Lower labour rates. Some material transport costs. Growing demand for quality construction.",
    diaspora: "Clients outside Kenya. Budget 30-40% above Nairobi rates for the same specification. Premium covers communication overhead, risk management, and remote supervision.",
  },
} as const;
