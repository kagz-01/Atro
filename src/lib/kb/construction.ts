// ATRO Knowledge Base — CONSTRUCTION
// How we build, what we use, how we manage sites

export const CONSTRUCTION_KB = {
  // ─── Construction Philosophy ───
  philosophy:
    "Construction at ATRO is not separate from design. The drawing is not thrown over a wall. One team holds design, quantities and construction together so decisions do not fragment between three parties.",

  // ─── Construction Phases ───
  phases: [
    {
      id: "preliminaries",
      name: "Preliminaries",
      description: "Site establishment, temporary works, health and safety. The work before the work.",
      duration: "1-2 weeks",
      activities: [
        "Site handover and possession",
        "Temporary fencing and security",
        "Site office and storage",
        "Temporary water and power",
        "Setting out and benchmarks",
        "Health and safety plan",
        "NCA registration",
      ],
      holdPoints: ["Site possession confirmed", "Temporary works complete", "H&S plan approved"],
    },
    {
      id: "substructure",
      name: "Substructure",
      description: "Excavation, foundations, underground drainage. The part nobody photographs but everyone depends on.",
      duration: "3-6 weeks",
      activities: [
        "Topsoil stripping",
        "Excavation to formation level",
        "Soil investigation verification",
        "Mass concrete blinding",
        "Reinforced concrete foundations",
        "Damp-proof course",
        "Backfilling and compaction",
        "Underground drainage",
      ],
      holdPoints: ["Excavation inspection", "Foundation concrete pour", "DPC installation", "Drainage test"],
      materials: ["Concrete (1:2:4 for RC, 1:3:6 for mass)", "Reinforcement steel (Y12, Y16, Y20)", "DPC membrane", "PVC drainage pipes"],
    },
    {
      id: "superstructure",
      name: "Superstructure",
      description: "The frame, walls, floors, roof. The building takes shape.",
      duration: "8-16 weeks",
      activities: [
        "RC columns and beams",
        "Floor slabs (suspended or ground)",
        "Masonry walls — stone, block or brick",
        "Plastering — internal and external",
        "Roof structure — timber or steel",
        "Roof covering — iron sheets, tiles or membrane",
        "Windows and external doors",
      ],
      holdPoints: ["Column reinforcement check", "Slab pour", "Wall alignment check", "Roof structure inspection", "Waterproofing test"],
      materials: ["Machine-cut stone or concrete blocks", "Cement mortar (1:4 plaster, 1:6 mortar)", "Timber roof trusses", "Roofing sheets or tiles", "Aluminium or timber windows"],
    },
    {
      id: "finishes",
      name: "Finishes",
      description: "The unphotogenic work that decides whether a house lasts. Joints, levels, waterproofing.",
      duration: "6-12 weeks",
      activities: [
        "Floor tiling or screeding",
        "Wall tiling (wet areas)",
        "Painting — primer, undercoat, finish coats",
        "Ceiling installation",
        "Joinery — doors, frames, built-in furniture",
        "Sanitaryware installation",
        "Lighting and socket installation",
        "Kitchen fitting",
      ],
      holdPoints: ["Floor level check", "Tile adhesion test", "Paint finish inspection", "Joinery alignment check"],
      materials: ["Ceramic or porcelain tiles", "Emulsion or oil-based paint", "Gypsum or timber ceiling boards", "Solid wood or steel doors", "Sanitaryware and fittings"],
    },
    {
      id: "services",
      name: "MEP Services",
      description: "Plumbing, electrical, mechanical. The invisible systems that make a building habitable.",
      duration: "4-8 weeks (overlaps with finishes)",
      activities: [
        "First fix — pipes and cables in walls/floors",
        "Second fix — fixtures and fittings",
        "Distribution board and wiring",
        "Hot and cold water supply",
        "Foul and storm drainage",
        "Solar water heating (if specified)",
        "Alarm and data cabling",
        "Testing and commissioning",
      ],
      holdPoints: ["First fix inspection", "Pressure test (water)", "Insulation resistance test (electrical)", "Final test and commissioning"],
    },
    {
      id: "external",
      name: "External Works",
      description: "Fencing, paving, landscaping, external drainage. The building does not end at the wall.",
      duration: "2-4 weeks",
      activities: [
        "Perimeter wall or fencing",
        "Driveway and parking surfaces",
        "Pathways and paving",
        "Soft landscaping — grass, plants, trees",
        "External lighting",
        "External drainage connections",
        "Gate and access control",
      ],
      holdPoints: ["Perimeter wall completion", "Surface drainage test", "Landscaping completion"],
    },
    {
      id: "handover",
      name: "Inspection & Handover",
      description: "Inspected, snagged, closed. Keys, documents, and a building you can occupy without a hidden list.",
      duration: "1-2 weeks",
      activities: [
        "Snagging list compilation",
        "Snagging rectification",
        "Final inspection",
        "O&M manuals compilation",
        "Warranty documentation",
        "Key handover",
        "County Certificate of Occupation",
      ],
      holdPoints: ["Snagging complete", "Final inspection passed", "Certificate of Occupation issued"],
    },
  ],

  // ─── Construction Methods ───
  methods: [
    {
      id: "conventional",
      name: "Conventional (RC Frame + Masonry)",
      description: "Reinforced concrete frame with stone, block or brick infill walls. The most common method in Kenya.",
      pros: ["Proven, familiar to all contractors", "Flexible for design changes", "Wide range of finishes available"],
      cons: ["Slower than precast", "Weather dependent", "Requires skilled labour"],
      costLevel: "Baseline",
      typicalFor: ["Residential", "Low-rise commercial", "Institutional"],
    },
    {
      id: "precast",
      name: "Precast Concrete",
      description: "Factory-made panels and elements assembled on site. Faster, more consistent, but less flexible.",
      pros: ["Faster erection", "Better quality control", "Less site labour"],
      cons: ["Requires crane access", "Less design flexibility", "Transport constraints"],
      costLevel: "5-10% premium over conventional",
      typicalFor: ["Apartments", "Warehouses", "Industrial"],
    },
    {
      id: "steel-frame",
      name: "Steel Frame",
      description: "Structural steel with cladding or infill. For larger spans and commercial work.",
      pros: ["Long spans without columns", "Fast erection", "Future adaptability"],
      cons: ["Fire protection needed", "Corrosion protection", "Higher initial cost"],
      costLevel: "15-25% premium over conventional",
      typicalFor: ["Commercial", "Industrial", "Large institutional"],
    },
    {
      id: "timber",
      name: "Timber Frame",
      description: "Treated timber structure with cladding. Common for residential and some institutional work.",
      pros: ["Lightweight", "Sustainable", "Fast construction"],
      cons: ["Termite risk (requires treatment)", "Fire regulations", "Limited height"],
      costLevel: "Variable — can be cheaper or premium",
      typicalFor: ["Residential", "Resorts", "Rural institutional"],
    },
  ],

  // ─── Quality Control ───
  qualityControl: {
    inspectionStages: [
      "Foundation excavation — soil verification",
      "Reinforcement before concrete pour",
      "Concrete slump test at pour",
      "Wall alignment and plumb check",
      "Roof structure before covering",
      "Waterproofing before tiling",
      "First fix services before closing walls",
      "Final inspection before handover",
    ],
    testingRequired: [
      "Concrete cube tests (7-day and 28-day)",
      "Soil compaction test (for fills)",
      "Water pressure test (plumbing)",
      "Insulation resistance test (electrical)",
      "Earth leakage test (electrical)",
      "Drainage flow test",
    ],
    documentation: [
      "Daily site diary",
      "Material delivery notes",
      "Concrete pour records",
      "Inspection reports",
      "Variation orders",
      "Payment certificates",
      "Photographic record",
    ],
  },

  // ─── Site Management ───
  siteManagement: {
    roles: [
      { role: "Project Manager", responsibility: "Overall delivery, programme, cost, client communication" },
      { role: "Site Supervisor", responsibility: "Day-to-day site management, quality, safety" },
      { role: "Quantity Surveyor", responsibility: "Cost control, valuations, variation pricing" },
      { role: "Structural Engineer", responsibility: "Structural inspections, foundation advice" },
      { role: "Architect", responsibility: "Design intent, statutory compliance, aesthetic control" },
    ],
    reporting: "Weekly written reports with photographs. Decisions logged. No voice-note governance.",
    safetyRequirements: [
      "Site induction for all workers",
      "PPE (hard hats, boots, high-vis)",
      "Scaffolding inspection (weekly)",
      "Fire extinguishers on site",
      "First aid kit",
      "Toolbox talks (weekly)",
    ],
  },

  // ─── Material Specifications ───
  specifications: {
    concrete: {
      foundations: "1:2:4 (cement:sand:ballast) — 25 MPa",
      columns: "1:2:4 — 30 MPa",
      beams: "1:2:4 — 30 MPa",
      slabs: "1:2:4 — 25 MPa",
      blinding: "1:3:6 — 15 MPa",
    },
    mortar: {
      masonry: "1:6 (cement:sand) for general walling",
      plastering: "1:4 for internal and external plaster",
      tiling: "Cement adhesive or 1:3 mortar bed",
    },
    steel: {
      reinforcement: "High-yield deformed bars (Y8-Y25)",
      mesh: "BRC A393, A252 or A193 for slabs",
      mildSteel: "For links, stirrups, ancillary work",
    },
    waterproofing: {
      tanking: "Bituminous membrane or crystalline treatment",
      roofs: "Built-up felt or single-ply membrane",
      wetAreas: "Cementitious coating before tiling",
    },
  },

  // ─── Programme (Typical) ───
  typicalProgramme: {
    "3bedBungalow": "6-9 months (120-180 m²)",
    "4bedMaisonette": "9-14 months (200-350 m²)",
    "apartmentBlock": "12-18 months (G+3 to G+6)",
    "commercial": "12-24 months (depending on size)",
    renovation: "3-6 months (depending on scope)",
  },
} as const;

export type ConstructionPhase = (typeof CONSTRUCTION_KB.phases)[number];
export type ConstructionMethod = (typeof CONSTRUCTION_KB.methods)[number];
