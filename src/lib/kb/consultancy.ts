// ATRO Knowledge Base — CONSULTANCY
// Cost planning, project management, advisory

export const CONSULTANCY_KB = {
  // ─── What Consultancy Means at ATRO ───
  definition:
    "Consultancy at ATRO is the layer between 'I want to build' and 'the building is finished'. We provide the decisions, numbers and documentation that prevent budgets from collapsing and timelines from drifting.",

  // ─── Advisory Services ───
  services: [
    {
      id: "cost-planning",
      name: "Cost Planning",
      description: "Turning a brief into a number you can fund. If the sketch and the money disagree, the money wins until the sketch is rewritten.",
      deliverables: ["Preliminary cost plan", "Elemental cost plan", "Detailed cost plan", "Value engineering options"],
      feeBasis: "Fixed fee or percentage of construction cost",
      whenNeeded: "Before design is finalised — the earlier, the better",
    },
    {
      id: "boq",
      name: "Bill of Quantities (BOQ)",
      description: "A document listing every material, labour item and cost. The basis for tendering, payment valuations and cost control.",
      deliverables: ["Priced BOQ (for tender)", "Unpriced BOQ (for contractor pricing)", "Interim payment certificates", "Final account"],
      feeBasis: "0.8-1.5% of construction cost",
      standard: "SMM2 — Standard Method of Measurement, 2nd Edition (2008)",
    },
    {
      id: "project-management",
      name: "Project Management",
      description: "You know what happened this week, what is next, and what needs a decision. Especially if you are not in the country.",
      deliverables: ["Programme (Gantt chart)", "Weekly written reports", "Photo timeline", "Decision log", "Variation management", "Payment certification"],
      feeBasis: "3-6% of construction cost",
      reportingFrequency: "Weekly written reports with photographs",
    },
    {
      id: "tender-management",
      name: "Tender Management",
      description: "Getting competitive bids from contractors and evaluating them on merit — not just the lowest number.",
      deliverables: ["Tender documentation", "Bill of Quantities", "Tender advertisement", "Site visit coordination", "Tender evaluation report", "Contract award recommendation"],
      feeBasis: "Fixed fee",
      process: ["Pre-qualification of contractors", "Tender issue", "Clarifications", "Tender opening", "Evaluation", "Award"],
    },
    {
      id: "contract-administration",
      name: "Contract Administration",
      description: "Managing the contract between client and contractor. Payments, variations, extensions of time, disputes.",
      deliverables: ["Interim payment certificates", "Variation orders", "Extension of time assessments", "Defects liability management", "Final account"],
      feeBasis: "2-4% of construction cost",
      contractForms: ["JCT", "NEC", "FIDIC", "AAK form", "Growth Sustain"],
    },
    {
      id: "site-supervision",
      name: "Site Supervision",
      description: "Someone is on site, checking that the work matches the drawings and the specifications. Not just taking photographs.",
      deliverables: ["Regular site inspections", "Inspection reports", "Material approval", "Workmanship assessment", "Progress monitoring"],
      feeBasis: "2-4% of construction cost",
      frequency: "Weekly or bi-weekly visits depending on project stage",
    },
    {
      id: "diaspora-management",
      name: "Diaspora Project Management",
      description: "For Kenyans building at home from the UK, Gulf, US and the region. The product is the same — the communication is built for time zones, video and WhatsApp.",
      deliverables: ["EAT working hours calls", "Photo timelines", "Written decision logs", "WhatsApp updates", "Named site contact"],
      feeBasis: "Same as project management + communication overhead",
      communicationTools: ["Scheduled video calls", "WhatsApp group", "Photo timeline", "Written decision log"],
    },
    {
      id: "feasibility-study",
      name: "Feasibility Study",
      description: "Before you buy the plot or start the design — does this project make sense financially and logistically?",
      deliverables: ["Site assessment", "Market analysis", "Financial feasibility", "Risk assessment", "Go/no-go recommendation"],
      feeBasis: "Fixed fee",
      whenNeeded: "Before purchase, before design, before committing capital",
    },
  ],

  // ─── Cost Planning Stages ───
  costPlanningStages: [
    {
      stage: "Feasibility Estimate",
      description: "Rough order of magnitude. Based on area, type and location. Accuracy: ±30-40%.",
      when: "Before design starts",
      method: "Area-based rate × floor area × zone multiplier",
    },
    {
      stage: "Elemental Cost Plan",
      description: "Broken down by building element. Based on concept design. Accuracy: ±20-25%.",
      when: "After concept design",
      method: "Element rates × quantities from concept drawings",
    },
    {
      stage: "Detailed Cost Plan",
      description: "Item-by-item costing. Based on developed design. Accuracy: ±10-15%.",
      when: "After developed design",
      method: "Measured quantities × market rates",
    },
    {
      stage: "Bill of Quantities",
      description: "Full measurement and pricing. Based on technical design. Accuracy: ±5-10%.",
      when: "Before tender",
      method: "SMM2 measurement × contractor rates",
    },
    {
      stage: "Final Account",
      description: "Actual cost based on completed work. No accuracy range — this is the real number.",
      when: "After handover",
      method: "Measured work + agreed variations",
    },
  ],

  // ─── What We Cost ───
  costBreakdown: {
    structure: { pct: "30-35%", description: "Foundations, frame, floor slabs, roof structure" },
    finishes: { pct: "25-32%", description: "Tiles, paint, doors, windows, joinery, sanitaryware" },
    services: { pct: "15-20%", description: "Plumbing, electrical, drainage, solar" },
    external: { pct: "8-12%", description: "Fencing, paving, landscaping, external drainage" },
    professional: { pct: "8-15%", description: "Architect, engineer, QS, NEMA, county fees" },
    contingency: { pct: "5-15%", description: "For unforeseen conditions and scope changes" },
  },

  // ─── What's NOT in a Construction Quote ───
  exclusions: [
    "Land cost",
    "Stamp duty and legal fees",
    "County building permits (KES 80,000–200,000)",
    "NEMA licence (KES 50,000–100,000)",
    "Utility connections — water (KES 50,000–100,000), electricity (KES 35,000–85,000), sewer (KES 60,000–150,000)",
    "Furniture, fixtures and equipment (FF&E)",
    "Landscaping (unless specified)",
    "Swimming pool, generator, solar panels (unless specified)",
    "Extraordinary ground conditions (rock, high water table, contaminated soil)",
  ],

  // ─── Regulations ───
  regulations: [
    { body: "National Construction Authority (NCA)", requirement: "All construction projects must be registered. Contractors must be registered by category.", website: "nca.go.ke" },
    { body: "National Environment Management Authority (NEMA)", requirement: "Environmental Impact Assessment (EIA) required for projects above certain thresholds.", website: "nema.go.ke" },
    { body: "County Governments", requirement: "Building plans approval, development permission, occupation certificate.", website: "Varies by county" },
    { body: "Architectural Association of Kenya (AAK)", requirement: "Architects must be registered. Fee schedules reference.", website: "aak.or.ke" },
    { body: "Board of Registration of Architects and Quantity Surveyors (BORAQS)", requirement: "Professional registration and practice standards.", website: "boraqs.go.ke" },
    { body: "Engineers Board of Kenya (EBK)", requirement: "Engineers must be registered. Professional indemnity requirements.", website: "ebk.go.ke" },
  ],

  // ─── FAQs ───
  faqs: [
    {
      q: "How long does it take to build a house in Kenya?",
      a: "A standard 3-bedroom house takes 6-9 months. A 4-bedroom maisonette takes 9-14 months. Commercial projects take 12-24 months. These assume no major delays in approvals or financing.",
    },
    {
      q: "How much does it cost to build in Kenya?",
      a: "Residential construction ranges from KES 35,000 to KES 120,000 per square metre depending on finish level and location. A standard 3-bedroom house (150 m²) in Nairobi costs KES 6-8 million to build (excluding land).",
    },
    {
      q: "Do I need an architect?",
      a: "Yes. For any building that requires county approval, an architect must sign the drawings. Beyond legality, an architect prevents costly mistakes — wrong orientation, poor ventilation, wasted space, and designs that cost more to build than they should.",
    },
    {
      q: "What is a BOQ and do I need one?",
      a: "A Bill of Quantities lists every material, labour item and cost in a building project. You need one for accurate tendering, cost control, and payment verification. Without a BOQ, you are building on guesswork.",
    },
    {
      q: "Can I build from abroad?",
      a: "Yes. Many of our clients manage projects from the UK, Gulf, US and elsewhere. We provide scheduled video calls, photo timelines, written decision logs and a named site contact. We recommend at least one site visit at structural stage.",
    },
    {
      q: "How do I choose a contractor?",
      a: "Check NCA registration, visit completed projects, get at least 3 competitive bids (with a BOQ), check references, and never award on price alone. The cheapest contractor is often the most expensive in the long run.",
    },
    {
      q: "What is the biggest risk in building in Kenya?",
      a: "Starting without proper drawings, quantities and a locked scope. Most budget overruns come from design changes during construction, not from material price increases. Plan properly, then build.",
    },
    {
      q: "How do I manage a build from abroad?",
      a: "Appoint a project manager you trust. Insist on weekly written reports with photographs. Use a decision log. Lock the scope with a BOQ. Budget for at least one site visit at structural stage.",
    },
  ],
} as const;

export type ConsultancyService = (typeof CONSULTANCY_KB.services)[number];
export type CostPlanningStage = (typeof CONSULTANCY_KB.costPlanningStages)[number];
