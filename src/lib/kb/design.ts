// ATRO Knowledge Base — DESIGN
// What we do, how we do it, what clients get

export const DESIGN_KB = {
  company: "ATRO Design & Construction",
  location: "Nairobi, Kenya",
  founded: 2018,
  tagline: "Designing & building better structures",

  // ─── What Design Means at ATRO ───
  definition:
    "Design at ATRO is not decoration. It is the act of making a building buildable — structure, cost, services and envelope considered together before a line is drawn on site.",

  // ─── Design Services ───
  services: [
    {
      id: "concept-design",
      name: "Concept Design",
      description: "Taking a brief from words to a buildable direction. Options, not a single precious sketch.",
      deliverables: ["Site analysis", "Concept sketches (2-3 options)", "Massing and spatial layout", "Indicative cost range", "Planning feasibility"],
      timeline: "2-4 weeks",
      feeBasis: "Fixed fee or percentage of construction cost",
    },
    {
      id: "architectural-design",
      name: "Architectural Design",
      description: "Full architectural drawings — plans, sections, elevations, details. Ready for statutory submission and construction.",
      deliverables: ["Floor plans", "Sections", "Elevations", "Roof plan", "Site plan", "Key details", "Specification outline"],
      timeline: "4-8 weeks",
      feeBasis: "5-8% of construction cost (AAK schedule)",
    },
    {
      id: "interior-design",
      name: "Interior Design",
      description: "Space planning, material selection, joinery design, lighting layout. Function first, aesthetics second.",
      deliverables: ["Space plans", "Material palettes", "Joinery drawings", "Lighting layout", "FF&E schedule"],
      timeline: "3-6 weeks",
      feeBasis: "Fixed fee per room or area",
    },
    {
      id: "structural-engineering",
      name: "Structural Engineering",
      description: "Foundation design, frame design, structural details. The invisible work that keeps the building standing.",
      deliverables: ["Foundation design", "Structural frame details", "Slab design", "Beam and column schedule", "Structural calculations"],
      timeline: "3-6 weeks",
      feeBasis: "3-5% of construction cost",
    },
    {
      id: "mep-design",
      name: "MEP Design (Mechanical, Electrical, Plumbing)",
      description: "Services design that integrates with the architecture — not an afterthought drawn over someone else's plan.",
      deliverables: ["Electrical layout", "Plumbing layout", "Drainage design", "HVAC layout", "Load schedule", "BoQ for services"],
      timeline: "3-5 weeks",
      feeBasis: "3-5% of construction cost",
    },
    {
      id: "landscape-design",
      name: "Landscape Design",
      description: "Site layout, planting, hardworks, drainage, outdoor lighting. The building does not end at the wall.",
      deliverables: ["Landscape plan", "Planting schedule", "Hardworks details", "Drainage layout", "Outdoor lighting"],
      timeline: "2-4 weeks",
      feeBasis: "Fixed fee or percentage",
    },
    {
      id: "statutory-approvals",
      name: "Statutory Approvals",
      description: "County submissions, NEMA, NCA — the paperwork that allows you to build legally.",
      deliverables: ["Architectural drawings for submission", "Structural drawings", "NEMA application", "NCA registration", "County approval follow-up"],
      timeline: "4-12 weeks (county dependent)",
      feeBasis: "Fixed fee per application",
    },
  ],

  // ─── Design Process ───
  process: [
    {
      phase: 1,
      name: "Brief",
      description: "We listen to what you want the building to do, where it sits, and what you can spend. This is a conversation, not a pitch deck.",
      duration: "1-2 weeks",
      activities: ["Client interview", "Site visit", "Budget discussion", "Programme agreement"],
    },
    {
      phase: 2,
      name: "Site Analysis",
      description: "Access, soil, neighbours, services, county process. The constraints that will decide the building if we ignore them.",
      duration: "1-2 weeks",
      activities: ["Topographical survey", "Soil investigation", "Neighbour analysis", "Services mapping", "County requirements"],
    },
    {
      phase: 3,
      name: "Concept Design",
      description: "A direction that can be built. Options, not a single precious sketch. Cost sits in the room while we draw.",
      duration: "2-4 weeks",
      activities: ["2-3 concept options", "Massing studies", "Cost estimate", "Client review"],
    },
    {
      phase: 4,
      name: "Cost Planning",
      description: "Quantities, a range, then a scope you can fund. If the sketch and the money disagree, the money wins until the sketch is rewritten.",
      duration: "1-2 weeks",
      activities: ["Preliminary BOQ", "Cost plan", "Value engineering", "Scope confirmation"],
    },
    {
      phase: 5,
      name: "Technical Design",
      description: "Documentation, the professionals the law requires, procurement. We do not start a site on a promise.",
      duration: "4-8 weeks",
      activities: ["Full drawing set", "Specifications", "Statutory submissions", "Tender documentation"],
    },
  ],

  // ─── Design Standards ───
  standards: {
    buildingCode: "Kenya Building Code (2020 edition)",
    structuralCode: "BS 8110 / Kenya Structural Code",
    fireCode: "BS 9999 / County fire safety requirements",
    accessibility: "Kenya Building Code Part VIII — access for disabled persons",
    energyCode: "Energy Act 2019, EPRA regulations",
    measurement: "SMM2 — Standard Method of Measurement, 2nd Edition (2008)",
    professionalBodies: ["Architectural Association of Kenya (AAK)", "Board of Registration of Architects and Quantity Surveyors (BORAQS)", "Engineers Board of Kenya (EBK)", "Institution of Engineers of Kenya (IEK)"],
  },

  // ─── Building Types We Design ───
  buildingTypes: [
    {
      type: "Residential",
      examples: ["Family houses", "Apartments", "Villas", "Apartments", "Staff quarters"],
      considerations: ["Orientation for light and ventilation", "Privacy from neighbours", "Parking ratios", "Security", "Garden/outdoor space"],
    },
    {
      type: "Commercial",
      examples: ["Offices", "Retail", "Mixed-use", "Shopping centres"],
      considerations: ["Floor plate efficiency", "Services capacity", "Fire escape routes", "Loading and logistics", "Brand identity"],
    },
    {
      type: "Institutional",
      examples: ["Schools", "Hospitals", "Community centres", "Government buildings"],
      considerations: ["Accessibility", "Fire safety", "Acoustics", "Infection control (healthcare)", "Flexible spaces"],
    },
    {
      type: "Religious",
      examples: ["Churches", "Mosques", "Parish halls"],
      considerations: ["Acoustic design", "Congregation flow", "Parking", "Multi-use flexibility", "Symbolic elements"],
    },
    {
      type: "Industrial",
      examples: ["Warehouses", "Factories", "Cold storage"],
      considerations: ["Structural spans", "Loading access", "Floor loading", "Ventilation", "Fire separation"],
    },
  ],

  // ─── Finish Levels ───
  finishLevels: [
    {
      id: "essential",
      name: "Essential",
      description: "Sound, simple, no waste. Cement floors, basic paint, standard materials. Good for budget homes, rental properties, rural areas.",
      costRange: "KES 35,000–45,000 per m²",
      typicalItems: ["Cement screed floors", "Basic emulsion paint", "Standard sanitaryware", "Mild steel windows", "Iron sheet roofing"],
    },
    {
      id: "standard",
      name: "Standard",
      description: "The honest mid-range house. Ceramic tiles, good paint, decent fixtures. Most family homes in Kenya sit here.",
      costRange: "KES 50,000–65,000 per m²",
      typicalItems: ["Ceramic floor tiles", "Quality emulsion paint", "Branded sanitaryware", "Aluminium windows", "Gauge 28 roofing"],
    },
    {
      id: "premium",
      name: "Premium",
      description: "Specified materials, quieter detailing. Porcelain tiles, premium fixtures, better finishes throughout.",
      costRange: "KES 70,000–95,000 per m²",
      typicalItems: ["Porcelain floor tiles", "Premium paint", "Designer sanitaryware", "Powder-coated aluminium", "Stone-coated roofing"],
    },
    {
      id: "signature",
      name: "Signature",
      description: "High-touch finishes, tight tolerances. Imported materials, custom joinery, everything specified.",
      costRange: "KES 100,000+ per m²",
      typicalItems: ["Imported tiles", "Custom joinery", "Premium fixtures", "Smart home provisions", "Bespoke detailing"],
    },
  ],
} as const;

export type DesignService = (typeof DESIGN_KB.services)[number];
export type FinishLevel = (typeof DESIGN_KB.finishLevels)[number];
