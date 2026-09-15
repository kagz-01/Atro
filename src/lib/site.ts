export const COMPANY = {
  name: "ATRO Design & Construction",
  short: "ATRO",
  tagline: "Designing & Building Better Structures",
  lede: "Integrated design, construction and consultancy for residential, commercial and institutional projects.",
  support:
    "From concept to construction, ATRO brings design thinking, technical expertise and practical project delivery together.",
  email: "hello@atro.ke",
  phoneDisplay: "+254 700 123 456",
  phoneTel: "+254700123456",
  whatsapp: "254700123456",
  hours: "Mon–Sat, 08:00–18:00 EAT",
  address: "Nairobi, Kenya",
  instagram: "https://instagram.com",
  linkedin: "https://www.linkedin.com",
} as const;

export type ProjectType =
  | "Residential"
  | "Commercial"
  | "Institutional"
  | "Church"
  | "School"
  | "Renovation";

export type ProjectStatus = "Completed" | "Ongoing" | "Proposed";

export type ZoneStatus = "active" | "limited" | "request" | "diaspora";

export type Zone = {
  slug: string;
  name: string;
  region: string;
  status: ZoneStatus;
  cx: number;
  cy: number;
  summary: string;
  coverage: string;
  typical: string;
  logistics: string;
  seoTitle: string;
  seoDescription: string;
  faqs: { q: string; a: string }[];
};

export const ZONES: Zone[] = [
  {
    slug: "nairobi",
    name: "Nairobi",
    region: "Nairobi County",
    status: "active",
    cx: 51,
    cy: 61,
    summary:
      "Full design-and-build coverage across Nairobi — from Karen and Lavington compounds to compact infill in the inner suburbs.",
    coverage: "Active delivery",
    typical: "Houses, extensions, commercial fit-out, mixed-use",
    logistics: "Shortest lead times. Site visits usually within a few days.",
    seoTitle: "Building Contractors in Nairobi | ATRO Design & Construction",
    seoDescription:
      "Design and construction company in Nairobi. Integrated architectural design, cost planning and project execution for homes, commercial and institutional work.",
    faqs: [
      {
        q: "Do you handle Nairobi County approvals?",
        a: "We coordinate the drawings, quantities and submissions a project needs, and work with the licensed professionals required for statutory sign-off. We do not present ourselves as a substitute for regulated registrations.",
      },
      {
        q: "Can you work on a tight urban plot?",
        a: "Yes. A large share of Nairobi work is infill: constrained access, neighbour conditions, and sequencing that has to respect a live street. We plan that at cost-planning stage, not after demolition.",
      },
    ],
  },
  {
    slug: "kiambu",
    name: "Kiambu",
    region: "Kiambu County",
    status: "active",
    cx: 50,
    cy: 55,
    summary:
      "One of our densest delivery areas — ridge houses, family homes and institutional work across Kiambu, Ruiru, Kikuyu and Thika Road.",
    coverage: "Active delivery",
    typical: "Family houses, schools, churches, farm compounds",
    logistics: "Routine coverage. Soils and access vary plot to plot — we assess before we price.",
    seoTitle: "Construction Company in Kiambu | ATRO Design & Construction",
    seoDescription:
      "House construction and design-build services in Kiambu County. BOQ-led costing, site consultancy and integrated delivery.",
    faqs: [
      {
        q: "How is Kiambu different from Nairobi on cost?",
        a: "Labour and some materials can be slightly softer, but access, black cotton soil and water can erase that on the wrong plot. We never quote a Nairobi rate onto a Kiambu site without walking it.",
      },
      {
        q: "Do you take on owner-managed sites?",
        a: "We can. The cleaner path is that we hold design, quantities and construction together so decisions do not fragment between three parties.",
      },
    ],
  },
  {
    slug: "machakos",
    name: "Machakos",
    region: "Machakos County",
    status: "active",
    cx: 57,
    cy: 66,
    summary:
      "Athiriver, Mavoko, Machakos town and surrounding plots — residential and light commercial, with a clear view of quarry, transport and water realities.",
    coverage: "Active delivery",
    typical: "Homes, warehouses, light commercial",
    logistics: "Regular coverage. Material haulage and water planning sit in the first assessment.",
    seoTitle: "Building Contractors in Machakos | ATRO Design & Construction",
    seoDescription:
      "Design and construction in Machakos County — residential, warehouse and light commercial work with cost-aware delivery.",
    faqs: [
      {
        q: "Can you start from a bare plot with no drawings?",
        a: "Yes. Consultation, site assessment and concept design are the first three steps. Construction does not start on a sketch.",
      },
    ],
  },
  {
    slug: "kajiado",
    name: "Kajiado",
    region: "Kajiado County",
    status: "active",
    cx: 48,
    cy: 72,
    summary:
      "Kitengela, Ongata Rongai, Ngong and Isinya. Climate, wind and long services runs matter more here than a Nairobi template.",
    coverage: "Active delivery",
    typical: "Homes, institutions, farm buildings",
    logistics: "Active. We plan for water, power and access before we lock a programme.",
    seoTitle: "Construction Company in Kajiado | ATRO Design & Construction",
    seoDescription:
      "Design-build and project management for homes and institutions in Kajiado — Kitengela, Ngong, Rongai and around.",
    faqs: [
      {
        q: "Do you work beyond Kitengela?",
        a: "Yes, across Kajiado where access is practical. Remote sites are flagged in the enquiry so we can be honest about logistics before anyone spends a week writing a brief.",
      },
    ],
  },
  {
    slug: "coast",
    name: "Coast",
    region: "Mombasa & coastal counties",
    status: "limited",
    cx: 68,
    cy: 84,
    summary:
      "Coral stone, humidity, salt air and a different labour market. We take coastal work with a dedicated logistics plan — not a Nairobi drawing reprinted.",
    coverage: "Limited · planned delivery",
    typical: "Houses, hospitality, institutional",
    logistics: "By programme. Salt, moisture and supply lines are priced, not wished away.",
    seoTitle: "Building Contractors at the Kenyan Coast | ATRO",
    seoDescription:
      "Coastal design and construction in Mombasa and around — houses and hospitality work planned for humidity, salt and local materials.",
    faqs: [
      {
        q: "Will a Nairobi specification survive at the coast?",
        a: "Often not. Steel protection, roof build-up, openings and finishes have to be rewritten for salt and moisture. That is part of the assessment, not a variation later.",
      },
    ],
  },
  {
    slug: "nakuru",
    name: "Nakuru",
    region: "Nakuru County",
    status: "limited",
    cx: 40,
    cy: 56,
    summary:
      "Nakuru town, Naivasha and surrounding farmland. We take defined scopes with a site presence plan rather than a fly-in promise.",
    coverage: "Limited · by programme",
    typical: "Homes, churches, schools",
    logistics: "Scheduled visits. A resident site lead is agreed before construction.",
    seoTitle: "Construction Company in Nakuru | ATRO Design & Construction",
    seoDescription:
      "Design, cost planning and construction for homes, churches and schools in Nakuru County.",
    faqs: [
      {
        q: "Can you run a Nakuru site from Nairobi?",
        a: "Not as a substitute for presence. Remote reporting is a layer on top of a site lead, not instead of one.",
      },
    ],
  },
  {
    slug: "kisumu",
    name: "Kisumu",
    region: "Kisumu & Nyanza",
    status: "request",
    cx: 27,
    cy: 62,
    summary:
      "We review Kisumu and wider Nyanza work case by case. If the scope, access and programme fit, we say so early.",
    coverage: "By request",
    typical: "Defined residential and institutional scopes",
    logistics: "Enquiry first. We will not take a site we cannot properly attend.",
    seoTitle: "Construction Consultancy in Kisumu | ATRO",
    seoDescription:
      "Project consultancy and selected design-build work in Kisumu, reviewed case by case.",
    faqs: [
      {
        q: "Is ATRO based in Kisumu?",
        a: "No. Nairobi is the studio base. Kisumu work proceeds only when we can resource it honestly.",
      },
    ],
  },
  {
    slug: "diaspora",
    name: "Diaspora-managed",
    region: "Projects in Kenya, clients abroad",
    status: "diaspora",
    cx: 78,
    cy: 28,
    summary:
      "For Kenyans building at home from the UK, Gulf, US and the region. The product is the same — the communication is built for time zones, video and WhatsApp.",
    coverage: "Active · remote-first clients",
    typical: "Family houses, rental units, plot-to-handover",
    logistics:
      "EAT working hours with scheduled calls. Photo timelines, written decisions, and a named site contact.",
    seoTitle: "Diaspora House Construction in Kenya | ATRO",
    seoDescription:
      "Build in Kenya from abroad. ATRO manages design, cost planning and construction with WhatsApp, video and a living project timeline.",
    faqs: [
      {
        q: "Can I avoid flying in until handover?",
        a: "Many clients do. We still recommend at least one site visit at structure, because photographs cannot replace walking a building. The rest can be remote.",
      },
      {
        q: "How do you stop a site drifting while I am away?",
        a: "Quantities, a locked scope, a photo timeline, and a single decision log. Drift usually starts when three people think they are in charge of the same wall.",
      },
    ],
  },
];

export type Project = {
  slug: string;
  name: string;
  location: string;
  zone: string;
  type: ProjectType;
  status: ProjectStatus;
  year: string;
  area: string;
  duration: string;
  scope: string;
  excerpt: string;
  challenge: string;
  role: string;
  solution: string;
  image: string;
  gallery: { src: string; alt: string }[];
  featured: boolean;
  timeline?: { date: string; title: string; caption: string; image: string }[];
};

export const PROJECTS: Project[] = [
  {
    slug: "karen-courtyard-house",
    name: "Karen Courtyard House",
    location: "Karen, Nairobi",
    zone: "nairobi",
    type: "Residential",
    status: "Completed",
    year: "2025",
    area: "420 m²",
    duration: "14 months",
    scope: "Design, cost planning, construction",
    excerpt:
      "A courtyard house organised around light, a mature garden and a quiet street edge.",
    challenge:
      "The existing trees and a long, narrow plot made a conventional front-and-back house clumsy. The client wanted privacy from the road without turning the garden into leftover space.",
    role: "Full design-and-build. ATRO held concept, quantities and construction as one sequence.",
    solution:
      "A single-storey courtyard plan with a stone and plaster outer wall, timber screens to the west, and rooms that look inward to a planted court. Structure and finishes were locked against a BOQ before breaking ground.",
    image: "/images/karen.webp",
    gallery: [
      { src: "/images/karen.webp", alt: "Garden elevation of the Karen courtyard house" },
      { src: "/images/interior.webp", alt: "Living room opening to the garden" },
      { src: "/images/detail.webp", alt: "Stone and concrete junction" },
      { src: "/images/hero.webp", alt: "Evening view of the courtyard" },
    ],
    featured: true,
  },
  {
    slug: "kiambu-ridge-residence",
    name: "Kiambu Ridge Residence",
    location: "Kiambu",
    zone: "kiambu",
    type: "Residential",
    status: "Completed",
    year: "2025",
    area: "280 m²",
    duration: "11 months",
    scope: "Architecture, BOQ, construction",
    excerpt:
      "A two-storey family house on a sloping Kiambu plot, built to a locked budget.",
    challenge:
      "A cross-fall site and a hard cost ceiling. The first sketch the family loved would have blown the budget on retaining and a long driveway.",
    role: "Design, quantities and construction. Cost planning ran in parallel with concept, not after it.",
    solution:
      "The house steps with the land. Brick and render, a dark metal roof, and a short access that does not fight the contour. The BOQ was the document the family used to choose finishes — not a surprise at the end.",
    image: "/images/kiambu.webp",
    gallery: [
      { src: "/images/kiambu.webp", alt: "Street elevation of the Kiambu residence" },
      { src: "/images/interior.webp", alt: "Interior with garden light" },
      { src: "/images/detail.webp", alt: "Masonry detail" },
    ],
    featured: true,
  },
  {
    slug: "nyali-veranda-house",
    name: "Nyali Veranda House",
    location: "Nyali, Mombasa",
    zone: "coast",
    type: "Residential",
    status: "Completed",
    year: "2024",
    area: "310 m²",
    duration: "13 months",
    scope: "Design revision, coastal specification, construction",
    excerpt:
      "A coral-stone house rewritten for salt air, deep shade and monsoon rain.",
    challenge:
      "An inland specification had already been drawn. Left unchanged it would have failed in three years: unprotected steel, tight eaves, and finishes that do not like salt.",
    role: "We rebuilt the specification, quantities and construction plan for the coast.",
    solution:
      "Coral stone, deep verandas, a roof that actually throws water, and a protection schedule for every piece of metal. The house is slower in the heat and quieter in the rain.",
    image: "/images/coast.webp",
    gallery: [
      { src: "/images/coast.webp", alt: "Deep veranda of the Nyali house" },
      { src: "/images/interior.webp", alt: "Shaded interior" },
      { src: "/images/detail.webp", alt: "Stonework in raking light" },
    ],
    featured: true,
  },
  {
    slug: "westlands-atelier",
    name: "Westlands Atelier",
    location: "Westlands, Nairobi",
    zone: "nairobi",
    type: "Commercial",
    status: "Completed",
    year: "2025",
    area: "640 m²",
    duration: "9 months",
    scope: "Design, construction, interiors",
    excerpt:
      "A small commercial building with a terracotta screen — shade, grain and a calm street face.",
    challenge:
      "A noisy road and a west-facing elevation. Glass-forward would have cooked the rooms and advertised every interior to the street.",
    role: "Architecture, interiors and construction of a two-level workplace.",
    solution:
      "A clay screen that shades and grain-filters the west light, deep-set openings, and a simple plan that can be let as one or two tenancies without rebuilding walls.",
    image: "/images/commercial.webp",
    gallery: [
      { src: "/images/commercial.webp", alt: "Terracotta screen facade in Westlands" },
      { src: "/images/detail.webp", alt: "Facade detail" },
      { src: "/images/interior.webp", alt: "Workplace interior" },
    ],
    featured: true,
  },
  {
    slug: "nakuru-parish-hall",
    name: "Nakuru Parish Hall",
    location: "Nakuru",
    zone: "nakuru",
    type: "Church",
    status: "Completed",
    year: "2024",
    area: "480 m²",
    duration: "10 months",
    scope: "Concept, cost planning, construction",
    excerpt:
      "A parish hall with a high timber nave, built to be used all week, not only on Sunday.",
    challenge:
      "The congregation needed a hall that could take worship, a school feeding programme and evening meetings — on a budget that could not absorb a cathedral.",
    role: "We designed a robust, well-lit hall and built it against a public BOQ the building committee could follow.",
    solution:
      "A simple masonry volume, a timber-lined roof, clerestory light, and a floor that survives chairs, feet and cleaning. No decorative structure. The money went into the roof, the light and the floor.",
    image: "/images/church.webp",
    gallery: [
      { src: "/images/church.webp", alt: "Nave and courtyard of the parish hall" },
      { src: "/images/detail.webp", alt: "Masonry and timber junction" },
      { src: "/images/school.webp", alt: "Covered edge of the compound" },
    ],
    featured: false,
  },
  {
    slug: "jacaranda-primary-wing",
    name: "Jacaranda Primary Wing",
    location: "Kiambu",
    zone: "kiambu",
    type: "School",
    status: "Completed",
    year: "2025",
    area: "720 m²",
    duration: "8 months",
    scope: "Design, construction",
    excerpt:
      "A new classroom wing and covered walkway, planned around a jacaranda court.",
    challenge:
      "The school could not close. Construction had to happen around a live timetable, with dust, noise and child movement designed, not improvised.",
    role: "Phased construction with a locked programme the headteacher could publish to parents.",
    solution:
      "A linear classroom block, a covered walk, and a court that was kept open throughout. Phases were sized so a class never lost two rooms at once.",
    image: "/images/school.webp",
    gallery: [
      { src: "/images/school.webp", alt: "Classroom wing and jacaranda court" },
      { src: "/images/detail.webp", alt: "Painted masonry in sunlight" },
      { src: "/images/site.webp", alt: "Earlier construction stage" },
    ],
    featured: false,
  },
  {
    slug: "lavington-frame",
    name: "Lavington Frame",
    location: "Lavington, Nairobi",
    zone: "nairobi",
    type: "Residential",
    status: "Ongoing",
    year: "2026",
    area: "360 m²",
    duration: "In progress",
    scope: "Design, BOQ, construction",
    excerpt:
      "A two-level house in frame. Structure is up; finishes are being locked against the remaining BOQ.",
    challenge:
      "The family is split between Nairobi and London. Decisions have to travel. The site cannot wait for a monthly call.",
    role: "Design-and-build with a living photo timeline and a written decision log.",
    solution:
      "Frame first, finishes second, each choice priced before it is made. The family sees the site weekly. Ongoing work is labelled as ongoing — it is not a completed house.",
    image: "/images/site.webp",
    gallery: [
      { src: "/images/site.webp", alt: "Reinforced concrete frame on the Lavington site" },
      { src: "/images/detail.webp", alt: "Concrete and formwork" },
      { src: "/images/hero.webp", alt: "Reference for the intended courtyard" },
    ],
    featured: true,
    timeline: [
      {
        date: "Jan 2026",
        title: "Foundations",
        caption: "Ground beams and pads, inspected before backfill.",
        image: "/images/site.webp",
      },
      {
        date: "Mar 2026",
        title: "Ground floor slab",
        caption: "Services cast in. Setting-out checked against the locked drawings.",
        image: "/images/detail.webp",
      },
      {
        date: "Jun 2026",
        title: "First-floor frame",
        caption: "Columns and beams in. The house is now a structure, not a drawing.",
        image: "/images/site.webp",
      },
    ],
  },
  {
    slug: "ruiru-garden-house",
    name: "Ruiru Garden House",
    location: "Ruiru, Kiambu",
    zone: "kiambu",
    type: "Residential",
    status: "Proposed",
    year: "2026",
    area: "240 m²",
    duration: "Proposed",
    scope: "Concept & cost planning",
    excerpt:
      "A compact garden house for a diaspora client. Concept and cost range agreed; construction not yet started.",
    challenge:
      "A 50 × 100 plot and a budget that has to include a boundary, a septic and a small rental wing — or not. The first job is to decide that, on paper.",
    role: "Concept, site assessment and a BOQ-led cost range. No construction until the family chooses a scope they can fund.",
    solution:
      "Two options: a single house with a generous garden, or a house plus a one-bedroom rental. Each has a range, not a hopeful number.",
    image: "/images/hero.webp",
    gallery: [
      { src: "/images/hero.webp", alt: "Reference courtyard for the Ruiru proposal" },
      { src: "/images/interior.webp", alt: "Interior direction" },
      { src: "/images/kiambu.webp", alt: "Comparable Kiambu house" },
    ],
    featured: false,
  },
];

export type Service = {
  slug: string;
  title: string;
  kicker: string;
  lede: string;
  image: string;
  included: string[];
  types: string[];
  inputs: string[];
  note?: string;
};

export const SERVICES: Service[] = [
  {
    slug: "architectural-design",
    title: "Architectural Design",
    kicker: "From brief to a building that can actually be built",
    lede: "Plans, sections, elevations and a material direction that survive contact with a site, a BOQ and a contractor — because in our case the contractor is us.",
    image: "/images/hero.webp",
    included: [
      "Briefing and site reading",
      "Concept options with a cost-aware filter",
      "Developed drawings for pricing and construction",
      "Material and opening schedules",
      "Coordination with structural and services input",
    ],
    types: ["Houses", "Extensions", "Commercial shells", "Institutional buildings"],
    inputs: [
      "Site location and size",
      "What you need the building to do",
      "A budget band, even if it is rough",
      "Any existing drawings or survey",
    ],
  },
  {
    slug: "structural-design",
    title: "Structural Design",
    kicker: "The frame that makes the drawing stand up",
    lede: "We coordinate structural design as part of an integrated project — so the architecture, the quantities and the frame are one conversation, not three files that disagree.",
    image: "/images/site.webp",
    included: [
      "Structural concept with the architectural plan",
      "Coordination of calculations and drawings with licensed structural professionals",
      "Foundation and frame intent aligned to soil and programme",
      "Buildability review before steel is ordered",
    ],
    types: ["Residential frames", "Institutional halls", "Low-rise commercial"],
    inputs: ["Architectural drawings", "Soil information where available", "Intended loads and use"],
    note: "Statutory structural sign-off is carried by the licensed professional appointed on the project. ATRO coordinates; we do not imply a registration we have not stated.",
  },
  {
    slug: "construction",
    title: "Construction & Project Execution",
    kicker: "The building, on the ground, against a locked scope",
    lede: "Site set-up, structure, envelope and finishes — run from a programme, a BOQ and a weekly communication rhythm. Not from a WhatsApp argument.",
    image: "/images/site.webp",
    included: [
      "Site establishment and safety set-up",
      "Structure, masonry, roof and envelope",
      "Finishes against an agreed schedule",
      "Quality checks at hold-points",
      "Handover with a snag list that is actually closed",
    ],
    types: ["New houses", "Extensions", "Institutional", "Commercial"],
    inputs: ["Approved drawings", "A priced BOQ or equivalent scope", "Access to the plot", "Decision-maker on call"],
  },
  {
    slug: "boq-cost-planning",
    title: "Bill of Quantities / Cost Planning",
    kicker: "A number you can make a decision with",
    lede: "Quantities, rates and options — so you choose a roof, a floor and a window because you understand what they cost, not because a contractor smiled.",
    image: "/images/detail.webp",
    included: [
      "Measured quantities from drawings",
      "Cost ranges and option studies",
      "Scope alignment before procurement",
      "Change control during construction",
    ],
    types: ["New build", "Renovation", "Phased work", "Diaspora-managed projects"],
    inputs: ["Drawings or a clear brief", "Finish intent", "What must be in the first phase"],
  },
  {
    slug: "project-management",
    title: "Project Management & Site Consultancy",
    kicker: "Someone on the site who can read a drawing",
    lede: "For clients who already have a contractor, or who are building from abroad: a site-based eye, a written log, and decisions that do not evaporate.",
    image: "/images/site.webp",
    included: [
      "Site inspections against drawings",
      "Progress photography and a decision log",
      "Programme and cost checkpoints",
      "Snagging and handover support",
    ],
    types: ["Owner-builder sites", "Diaspora projects", "Institutional clients"],
    inputs: ["Drawings", "Contract or contractor details", "What you want us to hold you to"],
  },
  {
    slug: "interior-spatial",
    title: "Interior / Spatial Design",
    kicker: "The rooms, not only the envelope",
    lede: "Joinery, light, floors and the way a house is actually used — designed with the structure, not stuck on at the end as a moodboard.",
    image: "/images/interior.webp",
    included: [
      "Furniture and joinery intent",
      "Finish palettes tied to the BOQ",
      "Lighting and opening studies",
      "Site review of sample boards",
    ],
    types: ["Houses", "Workplaces", "Hospitality rooms"],
    inputs: ["How you live or work", "Pieces you already own", "A finish budget"],
  },
  {
    slug: "precast",
    title: "Precast & Construction Solutions",
    kicker: "Where a faster, cleaner method actually helps",
    lede: "Precast, modular and other modern methods — used when they save time or waste, not as a slogan. If in-situ is the honest answer, we say so.",
    image: "/images/detail.webp",
    included: [
      "Method review at concept",
      "Where precast earns its transport cost",
      "Coordination with structure and finishes",
      "On-site sequencing",
    ],
    types: ["Repeat units", "Schools", "Boundary and drainage elements"],
    inputs: ["Programme pressure", "Access for lifting", "Repeatability of the design"],
  },
];

export const PROCESS_STEPS = [
  {
    n: "01",
    title: "Initial Consultation",
    body: "We listen to what you want the building to do, where it sits, and what you can spend. This is a conversation, not a pitch deck.",
  },
  {
    n: "02",
    title: "Site & Project Assessment",
    body: "Access, soil, neighbours, services, county process. The constraints that will decide the building if we ignore them.",
  },
  {
    n: "03",
    title: "Concept & Design",
    body: "A direction that can be built. Options, not a single precious sketch. Cost sits in the room while we draw.",
  },
  {
    n: "04",
    title: "Cost Planning",
    body: "Quantities, a range, then a scope you can fund. If the sketch and the money disagree, the money wins until the sketch is rewritten.",
  },
  {
    n: "05",
    title: "Approvals & Pre-Construction",
    body: "Documentation, the professionals the law requires, procurement. We do not start a site on a promise.",
  },
  {
    n: "06",
    title: "Construction",
    body: "The building. Hold-points, a programme, and a site that looks like someone is in charge.",
  },
  {
    n: "07",
    title: "Monitoring & Communication",
    body: "You know what happened this week, what is next, and what needs a decision. Especially if you are not in the country.",
  },
  {
    n: "08",
    title: "Handover",
    body: "Inspected, snagged, closed. Keys, documents, and a building you can occupy without a hidden list.",
  },
] as const;

export type Article = {
  slug: string;
  title: string;
  kicker: string;
  date: string;
  read: string;
  excerpt: string;
  image: string;
  body: { h?: string; p: string }[];
};

export const ARTICLES: Article[] = [
  {
    slug: "what-a-boq-protects-you-from",
    title: "What a BOQ actually protects you from",
    kicker: "Cost",
    date: "August 2026",
    read: "6 min",
    excerpt:
      "A bill of quantities is not bureaucracy. It is the difference between choosing a floor and discovering you cannot afford a roof.",
    image: "/images/detail.webp",
    body: [
      {
        p: "Most construction arguments in Kenya are not about taste. They are about a number that was never measured. A contractor names a figure for “a four-bedroom house.” A family agrees. Then the windows change, the soil is black cotton, the septic was never in the price, and everyone is suddenly a negotiator.",
      },
      {
        h: "A BOQ is a list of decisions",
        p: "A bill of quantities takes a drawing and turns it into countable work: cubic metres of concrete, square metres of roof, running metres of skirting. Once it exists, a change has a cost. Before it exists, a change is a feeling.",
      },
      {
        p: "That is why ATRO runs cost planning in parallel with design. A courtyard that looks calm on tracing paper can be an expensive retaining wall on a Kiambu slope. Better to know that in week three than in month nine.",
      },
      {
        h: "What it will not do",
        p: "A BOQ is not a guarantee against inflation, theft, or a client who changes the stairs twice. It is a shared document. Used honestly, it lets a family in London and a site in Lavington talk about the same wall.",
      },
    ],
  },
  {
    slug: "building-from-the-diaspora",
    title: "Building from the diaspora: the five things that fail first",
    kicker: "Diaspora",
    date: "July 2026",
    read: "7 min",
    excerpt:
      "The plot is in Kiambu. You are in Doha. Here is what actually breaks — and what to put in writing before anyone digs.",
    image: "/images/kiambu.webp",
    body: [
      {
        p: "Kenyans abroad build some of the most ambitious houses in the country, and some of the most stranded. The pattern is familiar: a relative on the ground, a contractor with a van, photographs that always look like progress, and a budget that quietly doubled.",
      },
      {
        h: "1. Nobody owns the drawing",
        p: "If the person pouring concrete cannot point to a dimension, they are inventing the house. Send drawings. Pay for them. Do not start with “you know how Kenyan houses look.”",
      },
      {
        h: "2. The relative is not a project manager",
        p: "A cousin can collect keys. A cousin cannot usually read a reinforcement schedule. Asking them to do both is how families fall out. Put a named professional on the site, and let family be family.",
      },
      {
        h: "3. Photographs lie about level, square and damp",
        p: "A weekly photo timeline is useful. It is not an inspection. Budget for at least one visit at structure, or for someone whose job is to walk the building with a spirit level and a drawing.",
      },
      {
        h: "4. Scope drift loves WhatsApp",
        p: "Voice notes are not variations. If a window moves, it goes into a written log with a cost. Otherwise you will fund a different house from the one you approved.",
      },
      {
        h: "5. Handover is a date, not a mood",
        p: "Agree what “done” means: snags closed, services live, documents in your hands. A house that is “almost” finished can stay that way for a year.",
      },
    ],
  },
  {
    slug: "nairobi-vs-kiambu",
    title: "Nairobi vs Kiambu: what actually changes on the ground",
    kicker: "Zones",
    date: "June 2026",
    read: "5 min",
    excerpt:
      "Twenty kilometres can change soil, water, labour and the county desk you will sit at. Here is the honest version.",
    image: "/images/school.webp",
    body: [
      {
        p: "Clients often ask for a Nairobi rate on a Kiambu plot, or the reverse. The buildings can look similar. The ground does not.",
      },
      {
        h: "Soil and water",
        p: "Kiambu’s black cotton, murram and slope will decide your foundation faster than your Pinterest board. Nairobi infill more often fights access, neighbours and a tight plot. Both can be built well. Neither is a copy of the other.",
      },
      {
        h: "Labour and haulage",
        p: "Some trades are cheaper outside the city until you factor in transport, water bowers and the day nobody came because it rained on the road. A cost plan that ignores logistics is a wish.",
      },
      {
        h: "The county process",
        p: "Approvals, inspections and the way a file moves are not identical. We plan the process as part of pre-construction, and we do not pretend a stamp is a formality.",
      },
      {
        p: "If you tell us the plot, we will tell you which of these will matter. That is the point of zone intelligence — not a coloured map for its own sake.",
      },
    ],
  },
];

export const TRUST_POINTS = [
  { title: "Design + Construction", body: "One team, one sequence. The drawing is not thrown over a wall." },
  { title: "Technical consultancy", body: "Decisions from drawings, quantities, specifications and the site." },
  { title: "Quality & cost control", body: "A locked scope. Changes are priced before they are built." },
  { title: "Visible project management", body: "You know the status without chasing a voice note." },
  { title: "Kenya-based delivery", body: "Nairobi studio. Real coverage, honestly described." },
] as const;

export const WHY = [
  {
    title: "Integrated thinking",
    body: "Design and construction are considered together, so a beautiful wall is also a buildable one.",
  },
  {
    title: "Technical approach",
    body: "Drawings, quantities, specifications and site realities — not mood and hope.",
  },
  {
    title: "Cost awareness",
    body: "You see the range before you fall in love with a stair that the budget cannot carry.",
  },
  {
    title: "Quality in the execution",
    body: "Hold-points, materials that are what they say they are, and finishes that match the sample.",
  },
  {
    title: "Clear communication",
    body: "Especially if you are not on the site. Written decisions. Photographs with dates.",
  },
  {
    title: "Modern methods, used honestly",
    body: "Precast, digital tools, a photo timeline — when they help. Never as decoration.",
  },
] as const;

export const VALUES = [
  { title: "Clarity", body: "We would rather lose a job than win it with a number that cannot survive the soil." },
  { title: "Craft", body: "Joints, levels, waterproofing. The unphotogenic work that decides whether a house lasts." },
  { title: "Stewardship", body: "Someone else’s money, land and years. We treat them as if they were ours." },
  { title: "Presence", body: "A site that is attended. A client who is informed. A drawing that matches the wall." },
] as const;

export const NAV = [
  { to: "/projects" as const, label: "Work" },
  { to: "/services" as const, label: "Services" },
  { to: "/tools" as const, label: "Tools", badge: "New" as const },
  { to: "/zones" as const, label: "Zones" },
  { to: "/process" as const, label: "Process" },
  { to: "/about" as const, label: "About" },
];

export function zoneBySlug(slug: string) {
  return ZONES.find((z) => z.slug === slug);
}

export function projectBySlug(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}

export function serviceBySlug(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}

export function articleBySlug(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}

export function projectsInZone(slug: string) {
  return PROJECTS.filter((p) => p.zone === slug);
}

export function featuredProjects() {
  return PROJECTS.filter((p) => p.featured);
}
