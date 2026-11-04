export const AGENT_OPERATING_MANUAL = {
  serviceDecisionTrees: [
    {
      service: "Concept Design",
      triggers: ["brief is informal", "client wants options", "land or site is not fully confirmed"],
      questions: [
        "What is the project trying to achieve?",
        "What budget comfort range is realistic?",
        "What site constraints matter most?",
      ],
      outputs: ["2-3 concept options", "orientation and massing direction", "initial cost range", "brief refinement"],
      handoff: "If the client needs a strict budget ceiling or land feasibility, move to feasibility and cost planning before approval.",
      tools: ["Cost Calculator", "Zone Map"],
    },
    {
      service: "Architectural Design",
      triggers: ["brief is approved", "site is confirmed", "need technical drawings"],
      questions: [
        "Has the site been checked against zoning, access and services?",
        "Is the design still within the approved budget range?",
        "Which design stages are required for approvals or construction?",
      ],
      outputs: ["plans", "sections", "elevations", "material strategy", "submission package"],
      handoff: "If the project is outside standard residential design or needs procurement support, escalate to consultancy and tender management.",
      tools: ["BOQ Worksheet"],
    },
    {
      service: "Cost Planning",
      triggers: ["budget is not yet fixed", "client wants range output", "changes are being discussed"],
      questions: [
        "What is the intended finish level?",
        "What is the project type and zone?",
        "What stage of design is being costed?",
      ],
      outputs: ["feasibility range", "elemental cost plan", "budget alignment notes", "value engineering options"],
      handoff: "If a measured cost or bid package is needed, move to BOQ and quantity review with a QS.",
      tools: ["Cost Calculator", "BOQ Worksheet", "Material Prices"],
    },
    {
      service: "Project Management",
      triggers: ["project is active", "multiple trades are involved", "client is not on site"],
      questions: [
        "Who is making decisions and when?",
        "What is the client approval process?",
        "What are the next hold points or payment gates?",
      ],
      outputs: ["programme", "decision log", "progress report", "variation control", "payment certificate"],
      handoff: "If there is a contract dispute or payment issue, route to contract administration and the human project lead.",
      tools: ["BOQ Worksheet"],
    },
    {
      service: "Diaspora Project Management",
      triggers: ["client is outside Kenya", "remote decisions are required", "trust and communication are main concerns"],
      questions: [
        "What is the client’s location and time zone?",
        "What is the decision cycle and visibility needed?",
        "Is the client paying by milestone or upfront?",
      ],
      outputs: ["weekly report", "video review schedule", "photo timeline", "decision log", "milestone release path"],
      handoff: "If there is a land-risk, trust-risk or developer-risk issue, route to a human discussion and due-diligence review before money moves.",
      tools: ["Zone Map", "Cost Calculator"],
    },
  ],

  costCalculatorAssumptions: {
    principle: "The cost calculator is a planning instrument, not a contractual price. It should be treated as an early-stage directional estimate.",
    inputs: [
      "Project type",
      "County or service zone",
      "Built area in m²",
      "Finish level",
    ],
    assumptions: [
      "Nairobi is the reference point for most material and labour cost assumptions.",
      "Zone multipliers only adjust the planning baseline and do not replace local site conditions.",
      "The estimate is for the core building package and excludes land purchase, professional approval and utility charges unless specified.",
    ],
    exclusions: [
      "Land purchase and legal fees",
      "Title search and transfer costs",
      "County permits and NEMA approvals",
      "Utility connection fees",
      "Furniture, fixtures and equipment",
      "Exceptional ground conditions, rock or water-table issues",
    ],
    accuracy: "Range-based and directional. Use it to frame decisions, not to approve scope or a tender price.",
    guardrails: [
      "Never quote a calculator result as a final or binding price.",
      "Always confirm finish quality, specification and site conditions before commitment.",
      "If the client needs a fixed value, move to a measured BOQ and project-specific briefing.",
    ],
  },

  materialPriceRefreshRules: {
    goal: "Keep price references useful without pretending they are live quotations.",
    cadence: {
      materials: "Review every 30-90 days; faster when fuel, freight, cement, steel or tiles move sharply.",
      labour: "Review quarterly with actual project conditions and productivity assumptions.",
      utilities: "Refresh on tariff or county approval changes.",
      projectSpecs: "Refresh whenever a finish or specification changes materially.",
    },
    dataSources: [
      "Current supplier quotations",
      "Recent project records and purchase orders",
      "Live transport and import conditions",
      "Market benchmarking from trusted local sources",
    ],
    decisionRule: "The tool is only reliable for indicative planning until a current project-specific quote replaces it.",
    cautions: [
      "Price can shift due to exchange rates, fuel costs, imports and local shortages.",
      "Brand, supplier, delivery distance and bulk order size all affect final numbers.",
      "Do not treat the reference table as a tender or procurement schedule.",
    ],
  },

  projectLifecycleCheckpoints: [
    {
      phase: "Feasibility",
      goal: "Confirm the project is viable before spending on design or approvals.",
      checkpoints: ["site viability", "budget comfort", "timeframe discussion", "land checks"],
      outputs: ["go/no-go or design option decision", "budget range", "risk notes"],
    },
    {
      phase: "Brief & concept",
      goal: "Convert the need into a buildable direction.",
      checkpoints: ["scope alignment", "site analysis", "concept direction", "cost sanity check"],
      outputs: ["concept options", "summary of spaces", "early budget range"],
    },
    {
      phase: "Design development",
      goal: "Translate the approved concept into regulated, buildable technical drawings.",
      checkpoints: ["room schedule", "materials direction", "structural coordination", "service coordination"],
      outputs: ["drawing set", "specification notes", "budget refinement"],
    },
    {
      phase: "Quantities & cost lock",
      goal: "Turn the design into a project-specific number and scope statement.",
      checkpoints: ["BOQ review", "tender or procurement strategy", "value engineering", "risk review"],
      outputs: ["measured BOQ", "estimated total", "decision-ready budget"],
    },
    {
      phase: "Delivery",
      goal: "Execute the project with control and evidence.",
      checkpoints: ["setout", "reinforcement and concrete checks", "first-fix inspection", "handover snags"],
      outputs: ["programmes", "site reports", "payment certificates", "final inspection"],
    },
    {
      phase: "Handover",
      goal: "Close the project without leaving latent issues behind.",
      checkpoints: ["snagging completion", "document pack", "operations and maintenance", "occupancy certification"],
      outputs: ["handover package", "warranty", "client sign-off"],
    },
  ],

  diasporaClientDecisionFlow: {
    entryPoints: ["client is in diaspora", "remote decision-making needed", "client wants visibility without site presence"],
    steps: [
      "Clarify the client’s objective: retirement home, family house, rental property, return-home plan or land investment.",
      "Review land title, site status and county/project feasibility before design starts.",
      "Use the cost calculator for range direction and zone map for service coverage.",
      "Set a milestone-based payment and communication structure before any deposit is released.",
      "Create a weekly written report cycle and a structured decision log.",
      "Confirm the project manager, inspection regime and approval sequence before construction begins.",
    ],
    redFlags: [
      "Large upfront deposit without signed milestone schedule",
      "No written scope or contract",
      "No independent site inspections",
      "No named project manager or decision log",
      "No evidence of land title, approvals or permit status",
    ],
    standardApproach: "Project management, transparent reporting and milestone-based release are non-negotiable for diaspora work.",
  },

  ragReadyIndex: {
    design: {
      tags: ["design", "brief", "concept", "architectural design", "site analysis", "planning", "drawings"],
      examples: ["concept design", "architectural design", "interior design", "structural engineering", "M&E"],
    },
    construction: {
      tags: ["construction", "site", "superstructure", "finishes", "services", "handover", "quality control"],
      examples: ["substructure", "superstructure", "roofing", "plumbing", "electrical", "external works"],
    },
    consultancy: {
      tags: ["consultancy", "cost planning", "project management", "BOQ", "tender", "contract administration", "feasibility"],
      examples: ["cost plan", "tender management", "site supervision", "contract administration", "feasibility study"],
    },
    tools: {
      tags: ["tools", "calculator", "zone map", "material prices", "boq worksheet", "estimate", "planning"],
      examples: ["Cost Calculator", "Zone Map", "Material Prices", "BOQ Worksheet"],
    },
    diaspora: {
      tags: ["diaspora", "remote", "abroad", "international", "time zone", "payment protection", "verification"],
      examples: ["diaspora client", "remote project management", "project updates", "decision log", "milestone payment"],
    },
  },
} as const;
