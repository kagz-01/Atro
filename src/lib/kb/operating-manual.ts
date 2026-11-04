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
      outputs: ["2-3 concept options", "orientation and massing direction", "cost drivers and information needed for pricing", "brief refinement"],
      handoff: "If the client needs a project total, confirm the scope and site information, then arrange measured quantities and current quotations before pricing.",
      tools: ["Material Price Reference", "Zone Map"],
    },
    {
      service: "Architectural Design",
      triggers: ["brief is approved", "site is confirmed", "need technical drawings"],
      questions: [
        "Has the site been checked against zoning, access and services?",
        "Have measured quantities and current project-specific prices been reviewed?",
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
      outputs: ["scope and cost-driver review", "measured cost plan when quantities and current rates are available", "budget alignment notes", "value engineering options"],
      handoff: "Do not give a whole-build total from floor area or stale rates. If a measured cost or bid package is needed, arrange BOQ and quantity review with a QS.",
      tools: ["Material Price Reference", "BOQ Worksheet"],
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
      tools: ["Zone Map", "Material Price Reference"],
    },
  ],

  costPlanningGuardrails: {
    principle: "ATRO does not publish generic whole-build totals or per-square-metre rates. A project total requires measured quantities and current project-specific quotations.",
    inputs: [
      "Defined scope and project location",
      "Drawings and measured quantities",
      "Finish and material specifications",
      "Current supplier and contractor quotations",
      "Delivery, labour and site conditions",
    ],
    assumptions: [
      "The PPRA June 2026 guide contains dated unit-price references for selected materials in five surveyed towns.",
      "Those material prices do not cover labour, plant, delivery, professional fees, utilities, statutory charges or a complete building scope.",
      "A PPRA town price is not a live quote, and an unsampled county must not inherit a neighboring town's rate.",
    ],
    exclusions: [
      "Land purchase and legal fees",
      "Title search and transfer costs",
      "County permits and NEMA approvals",
      "Utility connection fees",
      "Furniture, fixtures and equipment",
      "Exceptional ground conditions, rock or water-table issues",
    ],
    accuracy: "The published material table is a historical item-price reference only; it is not a project estimate.",
    guardrails: [
      "Never generate a whole-project total by multiplying floor area by a generic rate or location factor.",
      "State the PPRA source, town and survey period whenever sharing a reference price.",
      "If the client needs a project total, use a defined scope, measured BOQ and current local quotations.",
    ],
  },

  materialPriceRefreshRules: {
    goal: "Keep price references useful without pretending they are live quotations.",
    cadence: {
      materials: "Refresh when a newer official reference guide or verified supplier quotation is available; label the source and date.",
      labour: "Obtain current project- and location-specific labour quotations.",
      utilities: "Obtain a current quote from the relevant utility or service provider.",
      projectSpecs: "Refresh whenever a finish or specification changes materially.",
    },
    dataSources: [
      "Current supplier quotations",
      "Recent project records and purchase orders",
      "Live transport and import conditions",
      "PPRA Market Price Reference Guide, with its published survey dates and sampled towns",
    ],
    decisionRule: "Use the dated PPRA table only for its listed unit items and surveyed towns. Replace it with current written quotations before procurement or project pricing.",
    cautions: [
      "Survey prices reflect their survey period and can change with supply conditions.",
      "Brand, supplier, delivery distance, tax and order size affect current quotes.",
      "Do not treat the reference table as a tender or procurement schedule.",
    ],
  },

  projectLifecycleCheckpoints: [
    {
      phase: "Feasibility",
      goal: "Confirm the project is viable before spending on design or approvals.",
      checkpoints: ["site viability", "budget comfort", "timeframe discussion", "land checks"],
      outputs: ["go/no-go or design option decision", "cost drivers and outstanding pricing information", "risk notes"],
    },
    {
      phase: "Brief & concept",
      goal: "Convert the need into a buildable direction.",
      checkpoints: ["scope alignment", "site analysis", "concept direction", "cost sanity check"],
      outputs: ["concept options", "summary of spaces", "cost drivers and items requiring measurement or quotation"],
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
      outputs: ["measured BOQ", "priced scope based on current quotations", "decision-ready project budget"],
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
      "Use the PPRA material reference only for dated item prices in its surveyed towns; do not generate a whole-build total from generic rates.",
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
      tags: ["tools", "zone map", "material prices", "boq worksheet", "measured quantities", "planning"],
      examples: ["PPRA Material Price Reference", "Zone Map", "BOQ Worksheet"],
    },
    diaspora: {
      tags: ["diaspora", "remote", "abroad", "international", "time zone", "payment protection", "verification"],
      examples: ["diaspora client", "remote project management", "project updates", "decision log", "milestone payment"],
    },
  },
} as const;
