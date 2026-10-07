// ATRO Knowledge Base — DIASPORA
// Kenyans building from abroad: market, pain points, trust, what ATRO does differently

export const DIASPORA_KB = {
  // ─── Market Overview ───
  market: {
    population: "3 million Kenyans living abroad, primarily in US, UK, Middle East, Australia, Canada",
    remittances: {
      total2024: "KES 440 billion",
      total2025: "KES 593 billion (first 11 months) — 34.8% increase",
      note: "Diaspora remittances are a vital economic driver for Kenya",
    },
    housingDemand:
      "More than half of some developers' units are purchased by diaspora clients before construction is complete. Developers are tailoring projects specifically for diaspora buyers.",
    keyDriver:
      "Diaspora buyers have financial capacity, familiarity with digital tools, and a desire to secure tangible assets in their home country.",
    source: "Knight Frank Report, Feb 2026; Africa Business Insight; State Department for Diaspora Affairs",
  },

  // ─── Why Diaspora Clients Build ───
  motivations: [
    {
      id: "retirement",
      name: "Retirement home",
      description: "Building a home to return to after years abroad. The most common motivation — emotional, practical, and deeply personal.",
      emotionalWeight: "High — this is 'home' after years away",
    },
    {
      id: "family",
      name: "Family housing",
      description: "Building for parents, siblings, or extended family. A gift that also provides security.",
      emotionalWeight: "High — obligation and love mixed together",
    },
    {
      id: "investment",
      name: "Rental income",
      description: "Building a rental property for passive income while abroad. A financial decision with emotional ties.",
      emotionalWeight: "Medium — financial return is primary",
    },
    {
      id: "landbanking",
      name: "Land banking",
      description: "Buying land now for future development. A long-term play.",
      emotionalWeight: "Low — pure investment",
    },
    {
      id: "return",
      name: "Return home",
      description: "Building before physically returning. Getting the house ready so the move is smooth.",
      emotionalWeight: "High — life transition",
    },
  ],

  // ─── Pain Points (What Goes Wrong) ───
  painPoints: [
    {
      id: "scams",
      title: "Developer fraud and scams",
      severity: "Critical",
      description:
        "Diaspora buyers are prime targets. Common scams: deposits taken and construction never starts, forged title deeds, same property sold to multiple buyers, show houses rented not owned, projects launched without NEMA/NCA approvals.",
      realCases: [
        "Willstone Homes — diaspora buyers paid millions, construction never started, court cases ongoing (Nation, June 2025)",
        "Mahiga Homes — Rock Gardens 2 project abandoned, clients left building on their own (Nation, June 2025)",
        "Certified Homes — KWITU Gardens project targeting Kenyan Women in the USA, shell of building instead of luxury apartments (Nation, June 2025)",
        "Mizizi Africa Homes — Asali Estate buyers paid full amounts, developer became unresponsive (Nation, Feb 2026)",
      ],
      impact: "Hundreds of millions of shillings lost. Years of savings wiped out. Emotional devastation.",
      source: "Daily Nation, African Real Estate, Citizen Digital — 2025-2026 reporting",
    },
    {
      id: "communication",
      title: "Communication breakdown",
      severity: "High",
      description:
        "Updates via WhatsApp that eventually stop matching reality. Construction slows, then halts, then communication dries up. The client is left guessing.",
      whatHappens: [
        "Initial enthusiasm — frequent updates, photos, video calls",
        "Communication becomes less frequent",
        "Excuses start — weather,材料 delays, worker issues",
        "Client stops getting responses",
        "By the time they visit, the project is abandoned or drastically different",
      ],
    },
    {
      id: "no-verification",
      title: "No independent verification",
      severity: "High",
      description:
        "The client cannot be on site. They rely on the contractor's word. There is no independent person checking that the work matches the drawings, the materials are correct, or the progress is real.",
      whatShouldHappen: [
        "Independent site inspections with photographic evidence",
        "Material delivery verification (not just receipts)",
        "Milestone-based progress reports",
        "Third-party quality checks at key stages",
      ],
    },
    {
      id: "payment-risk",
      title: "Paying without proof",
      severity: "High",
      description:
        "Clients release funds based on WhatsApp messages, not verified progress. Money goes out before work is done. There is no escrow, no milestone-based release, no accountability.",
      bestPractice: [
        "Milestone-based payment release",
        "Funds held until independent verification",
        "Photographic evidence before each release",
        "Signed milestone completion certificates",
      ],
    },
    {
      id: "land-risk",
      title: "Land due diligence from abroad",
      severity: "High",
      description:
        "Cannot verify land ownership in person. Fake title deeds, disputed land, encumbrances, and double sales are common.",
      whatToCheck: [
        "Official search at Ministry of Lands",
        "Encumbrance check",
        "Surveyor confirmation of boundaries",
        "Neighbour verification",
        "County approval status",
      ],
    },
    {
      id: "time-zones",
      title: "Time zone challenges",
      severity: "Medium",
      description:
        "Client in UK/US, contractor in Kenya. 8-10 hour time difference. Decisions delayed. Urgent issues cannot be discussed in real time.",
    },
    {
      id: "emotional",
      title: "Emotional manipulation",
      severity: "Medium",
      description:
        "Developers exploit the emotional connection — 'building your dream back home'. They position as partners, send holiday greetings, ask about families. The charm offensive makes it harder to ask hard questions.",
      quote: "People trust the marketing more than the paperwork, and that's where the damage begins. — African Real Estate, March 2026",
    },
    {
      id: "legal-recourse",
      title: "Limited legal recourse",
      severity: "Medium",
      description:
        "Legal action in Kenya is slow, expensive, and difficult from abroad. Some developers incorporate new companies every few months to avoid liability.",
      quote: "Even when you are doing everything right, diaspora buyers now assume you're hiding something. — Ruth Wanjiru, property researcher (African Real Estate, 2026)",
    },
  ],

  // ─── What Diaspora Clients Actually Need ───
  needs: [
    {
      id: "trust",
      name: "Trust and transparency",
      description: "Know exactly what is happening, when, and why. No hidden costs, no surprises, no excuses.",
      howATRODelivers: [
        "Named project manager with direct contact",
        "Weekly written reports with photographs",
        "Decision log — every decision documented",
        "Open-book cost tracking",
        "No hidden fees or vague line items",
      ],
    },
    {
      id: "verification",
      name: "Independent verification",
      description: "Someone who is not the contractor confirming that the work is real, correct, and on schedule.",
      howATRODelivers: [
        "Site supervisor independent of contractor",
        "Milestone inspection reports with photos",
        "Material delivery verification",
        "Quality checks at each construction phase",
        "Client approval required before next phase starts",
      ],
    },
    {
      id: "payment-protection",
      name: "Payment protection",
      description: "Never pay for work that hasn't been done. Funds released only against verified progress.",
      howATRODelivers: [
        "Milestone-based payment schedule",
        "Payment certificate before each release",
        "Photographic evidence of completed work",
        "No advance payments for unstarted work",
        "Variation orders approved before cost is incurred",
      ],
    },
    {
      id: "communication",
      name: "Structured communication",
      description: "Regular, predictable updates. Not random WhatsApp messages. A schedule that respects time zones.",
      howATRODelivers: [
        "Scheduled video calls (EAT afternoon = UK morning, US evening)",
        "Weekly written report every Friday",
        "WhatsApp group for quick questions",
        "Photo timeline — visual progress record",
        "Decision requests with clear options and deadlines",
      ],
    },
    {
      id: "documentation",
      name: "Paper trail",
      description: "Everything documented. Contracts, payments, variations, approvals. If there's a dispute, you have evidence.",
      howATRODelivers: [
        "Signed contract with scope and schedule",
        "Payment receipts for every transaction",
        "Variation order forms",
        "Inspection reports",
        "Final account and handover documents",
      ],
    },
    {
      id: "visit-support",
      name: "Visit planning",
      description: "When the client visits, the trip is productive. They see real progress, not a show.",
      howATRODelivers: [
        "Pre-visit progress report",
        "Structured site walk schedule",
        "Meeting with project manager on-site",
        "Photo documentation of areas not yet visible",
        "Post-visit action items",
      ],
    },
  ],

  // ─── What ATRO Does Differently ───
  differentiators: [
    {
      id: "design-build",
      title: "One team, design through handover",
      description:
        "ATRO is not a developer selling off-plan. We are a design-and-build studio. The same team that draws the building builds it. No handoff between three parties. One contract, one accountability.",
    },
    {
      id: "no-offplan",
      title: "No off-plan sales",
      description:
        "We do not sell houses from a show unit. We build YOUR house, on YOUR land, to YOUR brief. You choose the design, the finish, the specification. We do not build speculative developments.",
    },
    {
      id: "professional",
      title: "Registered professionals",
      description:
        "Architects, engineers, quantity surveyors — registered with AAK, EBK, BORAQS. Not salespeople with a website. We sign drawings. We take professional liability.",
    },
    {
      id: "boq-first",
      title: "BOQ before construction",
      description:
        "Every project starts with a Bill of Quantities. You know the cost before you commit. No vague estimates. No 'we'll see when we start'. A measured, priced document.",
    },
    {
      id: "milestone-payments",
      title: "Milestone-based payments",
      description:
        "You pay for what is done, not for what is promised. Each payment is certified against verified progress. No advance payments for unstarted work.",
    },
    {
      id: "weekly-reports",
      title: "Weekly written reports",
      description:
        "Every Friday, a written report with photographs. What was done this week, what is planned next week, what needs a decision. Not random WhatsApp messages.",
    },
    {
      id: "named-contact",
      title: "Named project manager",
      description:
        "One person you can call. Not a call centre, not a sales team. A named professional who knows your project, your preferences, and your concerns.",
    },
    {
      id: "open-book",
      title: "Open-book costing",
      description:
        "You see every cost. Material prices, labour rates, subcontractor quotes. No black boxes. No mysterious markups.",
    },
  ],

  // ─── Communication Protocol ───
  communication: {
    scheduledCalls: {
      frequency: "Weekly or bi-weekly",
      timing: "EAT 08:00-10:00 (UK 06:00-08:00, US 01:00-03:00 EST) or EAT 18:00-20:00 (UK 16:00-18:00, US 11:00-13:00 EST)",
      format: "Video call (Zoom/Google Meet) with screen sharing",
      agenda: ["Progress review with photos", "Upcoming decisions", "Budget update", "Any concerns"],
    },
    writtenReports: {
      frequency: "Weekly (every Friday EAT)",
      format: "PDF report via email",
      contents: ["Work completed this week (with photos)", "Work planned for next week", "Budget status", "Decisions needed", "Risks or delays"],
    },
    whatsapp: {
      purpose: "Quick questions and informal updates",
      rules: [
        "No decisions via WhatsApp — decisions go in the decision log",
        "Photos of daily progress welcome",
        "Response time: within 24 hours during working days",
        "Urgent issues: call the project manager directly",
      ],
    },
    decisionLog: {
      purpose: "Every decision documented with date, options considered, and outcome",
      format: "Shared document (Google Sheet or PDF)",
      access: "Client and project manager both maintain a copy",
    },
  },

  // ─── Payment Protection Model ───
  paymentProtection: {
    principle: "Pay for what is done, not what is promised",
    structure: [
      {
        phase: "Design & Documentation",
        payment: "Fixed fee, paid in 2-3 installments as deliverables are completed",
        protection: "Each payment tied to a specific deliverable (concept, developed design, tender docs)",
      },
      {
        phase: "Statutory Approvals",
        payment: "Fixed fee per application",
        protection: "Payment after approval is obtained, not before",
      },
      {
        phase: "Construction",
        payment: "Monthly or milestone-based, certified by project manager",
        protection: [
          "Site inspection confirms work completed",
          "Photographic evidence attached",
          "Material delivery notes verified",
          "Payment certificate issued before payment is due",
          "No payment for work not yet started",
        ],
      },
      {
        phase: "Variations",
        payment: "Priced and approved before work starts",
        protection: "Written variation order signed by both parties. No surprise costs.",
      },
      {
        phase: "Retention",
        payment: "5-10% retained until defects liability period ends",
        protection: "Ensures contractor returns to fix any defects after handover",
      },
    ],
  },

  // ─── FAQs for Diaspora Clients ───
  faqs: [
    {
      q: "Can I build from abroad?",
      a: "Yes. Many of our clients manage projects from the UK, Gulf, US and elsewhere. We provide scheduled video calls, photo timelines, written decision logs and a named site contact. We recommend at least one site visit at structural stage.",
    },
    {
      q: "How do I know the work is really being done?",
      a: "Weekly written reports with photographs. Milestone inspection reports. Independent site supervisor. We do not rely on the contractor's word — we verify.",
    },
    {
      q: "How do I protect my money?",
      a: "Milestone-based payments. You pay for completed work, not promises. Each payment is certified against verified progress with photographic evidence. No advance payments for unstarted work.",
    },
    {
      q: "What if I can't visit?",
      a: "You don't need to be on site. Our weekly reports, photo timelines and video calls give you visibility. When you do visit, we prepare a structured site walk so your trip is productive.",
    },
    {
      q: "How do you handle time zones?",
      a: "We schedule calls at times that work for you. EAT morning = UK early morning, US late night. EAT evening = UK afternoon, US morning. We adapt to your schedule.",
    },
    {
      q: "What if something goes wrong?",
      a: "You have a named project manager. You have a contract. You have a decision log. If there is a dispute, you have documentation. We are registered professionals — we take liability.",
    },
    {
      q: "Do I need to come to Kenya?",
      a: "We recommend at least one visit at structural stage (foundation/frame). It helps you see progress, meet the team, and make decisions in person. But it is not required — we manage everything remotely.",
    },
    {
      q: "How do I verify the land is legitimate?",
      a: "Before we start, we conduct or commission: official search at Ministry of Lands, encumbrance check, surveyor verification, neighbour check, and county status. You get a full due diligence report.",
    },
    {
      q: "What about NCA and NEMA?",
      a: "We handle all statutory registrations and approvals. NCA registration, NEMA application (if required), county building approval. You don't need to navigate these yourself.",
    },
    {
      q: "Can I choose my own contractor?",
      a: "Yes. We manage tenders and evaluate bids. You choose from pre-qualified contractors based on merit, not just price. We recommend against choosing the cheapest bid.",
    },
  ],

  // ─── Competitor Landscape ───
  competitors: [
    {
      name: "Diaspora Design Build",
      type: "Design-build firm",
      positioning: "Architectural firm with construction management for diaspora",
      strengths: "Established (2002), design-build model",
      weaknesses: "Limited online presence, small team",
    },
    {
      name: "DiasporaBuild",
      type: "Software platform",
      positioning: "Construction project management software built for Africa",
      strengths: "Milestone payments, offline field app, client portal, independent inspections",
      weaknesses: "Software only — no design, no professional team, no direct construction",
    },
    {
      name: "Tujitume",
      type: "Software platform",
      positioning: "Diaspora construction project management — plan, monitor, manage",
      strengths: "Milestone-based, fund release controls, evidence capture, dashboards",
      weaknesses: "Software only — no design, no professional team, no direct construction",
    },
    {
      name: "Frema",
      type: "Materials platform",
      positioning: "Buy building materials from abroad, delivered to site",
      strengths: "Transparent material purchasing, lab-tested cement, 3-5 day delivery",
      weaknesses: "Materials only — no design, no construction management, no professional services",
    },
    {
      name: "GNA Diaspora",
      type: "Real estate agency",
      positioning: "Connecting diaspora with properties in Kenya",
      strengths: "Property identification, land sourcing",
      weaknesses: "Agency model — not design-build, no construction management",
    },
  ],

  // ─── Red Flags to Warn Clients About ───
  redFlags: [
    "Developer asks for large upfront deposit (more than 10-15%) before construction starts",
    "No NCA registration number displayed or provided",
    "No written contract — just WhatsApp agreements",
    "Cannot provide references from completed projects",
    "Cannot show you a physical office or site",
    "Pressures you to pay quickly — 'price going up', 'other buyers interested'",
    "No Bill of Quantities — just a lump sum",
    "Artistic impressions that don't match the actual site",
    "Show house that is rented, not owned",
    "New company with no track record",
    "Director has been involved in previous failed projects",
    "Refuses to allow independent inspection",
    "No milestone-based payment schedule",
    "Variations communicated verbally, not in writing",
  ],

  // ─── Trust Signals ATRO Should Display ───
  trustSignals: [
    "Registered architects (AAK) and engineers (EBK)",
    "NCA-registered contractor",
    "Physical office in Nairobi — you can visit",
    "Portfolio of completed projects with addresses",
    "Client testimonials with names and locations",
    "Published BOQ examples and cost ranges",
    "Weekly written reports as standard (not optional)",
    "Milestone-based payment terms in every contract",
    "Named project manager — not a call centre",
    "Open-book costing — you see every number",
    "Professional indemnity insurance",
    "Clear contract with scope, schedule, and payment terms",
  ],
} as const;

export type DiasporaPainPoint = (typeof DIASPORA_KB.painPoints)[number];
export type DiasporaNeed = (typeof DIASPORA_KB.needs)[number];
