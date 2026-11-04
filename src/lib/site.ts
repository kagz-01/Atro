export const VOICE_GUIDE = {
  preferred: [
    "clear",
    "practical",
    "straightforward",
    "project record",
    "next steps",
    "what is happening",
    "what needs your decision",
  ],
  avoid: [
    "portfolio",
    "directory",
    "brochure language",
    "generic updates",
    "confusing progress",
  ],
} as const;

export const COMPANY = {
  name: "ATRO Design & Construction",
  short: "ATRO",
  tagline: "Clear design. Practical building. Trust you can follow.",
  lede: "Design, planning, construction and project support for homes, offices and institutions across Kenya.",
  support:
    "From the first idea to the final handover, we keep the process clear, practical and easier to trust.",
  /** The studio's own words for what it does — used where a summary is needed. */
  description:
    "ATRO Design & Construction delivers practical design and building solutions for homes, offices and institutions across Kenya. We combine clear planning, cost-conscious decisions and reliable delivery so each project stays understandable from first concept to final handover.",
  email: "hello@atro.ke",
  phoneDisplay: "+254 799 034 712",
  phoneTel: "+254799034712",
  whatsapp: "254799034712",
  hours: "Monday–Saturday, 08:30–17:30 EAT · Sunday closed",
  /** Per-day hours, so the contact page can show a real week. */
  hoursWeek: [
    { day: "Monday", open: "08:30", close: "17:30" },
    { day: "Tuesday", open: "08:30", close: "17:30" },
    { day: "Wednesday", open: "08:30", close: "17:30" },
    { day: "Thursday", open: "08:30", close: "17:30" },
    { day: "Friday", open: "08:30", close: "17:30" },
    { day: "Saturday", open: "08:30", close: "17:30" },
    { day: "Sunday", open: null, close: null },
  ] as const,
  address: "Nairobi, Kenya",
  website: "http://atroconstruction.co.ke/",
  instagram: "https://instagram.com",
  linkedin: "https://www.linkedin.com",
} as const;

/** True while the studio is reachable, in East Africa Time. */
export function isOpenNow(at: Date = new Date()): boolean {
  // EAT is UTC+3 with no daylight saving, so this is exact.
  const eatHour = (at.getUTCHours() + 3) % 24;
  const eatMinute = at.getUTCMinutes();
  const day = at.getUTCDay(); // 0 = Sunday
  if (day === 0) return false;
  const minutes = eatHour * 60 + eatMinute;
  const open = 8 * 60 + 30;
  const close = 17 * 60 + 30;
  return minutes >= open && minutes < close;
}

export type ProjectType =
  | "Residential"
  | "Commercial"
  | "Institutional"
  | "Church"
  | "School"
  | "Renovation";

export type ProjectStatus =
  | "Completed"
  | "Ongoing"
  | "Proposed"
  | "In design"
  | "Illustrative";

export type ZoneStatus = "active" | "limited" | "request" | "diaspora";

export type Zone = {
  slug: string;
  name: string;
  region: string;
  status: ZoneStatus;
  cx: number;
  cy: number;
  lat: number;
  lng: number;
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
    lat: -1.2921,
    lng: 36.8219,
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
    lat: -1.1700,
    lng: 36.8300,
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
    lat: -1.5177,
    lng: 37.2634,
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
    lat: -1.8500,
    lng: 36.7833,
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
    lat: -4.0435,
    lng: 39.6682,
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
    lat: -0.3031,
    lng: 36.0800,
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
    lat: -0.1022,
    lng: 34.7617,
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
    lat: 51.5074,
    lng: -0.1278,
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
  zone?: string;
  type: ProjectType;
  status: ProjectStatus;
  year?: string;
  area?: string;
  duration?: string;
  scope: string;
  excerpt: string;
  challenge?: string;
  role?: string;
  solution?: string;
  description?: string;
  keyFacts?: string[];
  client?: string;
  projectContact?: { name: string; role: string };
  serviceSlugs?: string[];
  image: string;
  gallery: { src: string; alt: string; fit?: "cover" | "contain" }[];
  featured: boolean;
  timeline?: { date: string; title: string; caption: string; image: string }[];
};

export const PROJECTS: Project[] = [
  {
    slug: "sigona-villa",
    name: "Sigona Villa",
    location: "Sigona, Limuru",
    zone: "kiambu",
    type: "Residential",
    status: "Ongoing",
    year: "2026",
    scope: "Architectural drawings, structural drawings, project management",
    serviceSlugs: ["architectural-design", "structural-design", "project-management"],
    excerpt:
      "A contemporary five-bedroom villa with a family room, rooftop terrace and landscaped, walled compound.",
    description:
      "A contemporary five-bedroom villa with an additional family room, designed and managed by ATro from drawings through to site. White rendered volumes meet dark-framed glazing, stone-clad accents and glass balustrades, and the house is crowned by a rooftop terrace. The villa sits within a walled compound with paved parking and landscaped grounds, creating a private and secure family home.",
    keyFacts: [
      "Five bedrooms plus a family room",
      "Rooftop terrace",
      "Walled compound with paved parking and landscaping",
      "Foundation stage documented on site, 23 September 2026",
    ],
    projectContact: {
      name: "Samuel Nderitu",
      role: "Architectural and Structural Designer",
    },
    image: "/catalog/images/sigona-villa-front-view.webp",
    gallery: [
      { src: "/catalog/images/sigona-villa-front-view.webp", alt: "Architectural render of Sigona Villa, front view" },
      { src: "/catalog/images/sigona-villa-night-aerial.webp", alt: "Architectural render of Sigona Villa at night, aerial view" },
      { src: "/catalog/images/sigona-villa-rooftop-terrace.webp", alt: "Architectural render of the Sigona Villa rooftop terrace, aerial view" },
      { src: "/catalog/images/sigona-villa-foundation-progress-01.webp", alt: "Sigona Villa foundation-stage site progress, 23 September 2026, view 1" },
      { src: "/catalog/images/sigona-villa-foundation-progress-02.webp", alt: "Sigona Villa foundation-stage site progress, 23 September 2026, view 2" },
      { src: "/catalog/images/sigona-villa-foundation-progress-03.webp", alt: "Sigona Villa foundation-stage site progress, 23 September 2026, view 3" },
    ],
    featured: true,
  },
  {
    slug: "ruiru-mugutha-town-house",
    name: "Ruiru Mugutha Town House",
    location: "Ruiru Mugutha",
    zone: "kiambu",
    type: "Residential",
    status: "In design",
    year: "2026",
    scope: "Architectural drawings, structural drawings",
    serviceSlugs: ["architectural-design", "structural-design"],
    excerpt:
      "A two-storey town house with a stone-clad feature wall, generous glazing and a first-floor balcony.",
    description:
      "A modern two-storey town house in Ruiru Mugutha, designed by ATro with full architectural and structural drawings. A stone-clad feature wall anchors the facade against dark and white rendered volumes. Large glazed living areas fill the interiors with light, and a first-floor balcony with a glass balustrade adds private outdoor space. A paved forecourt and landscaped frontage complete the compact family plot.",
    keyFacts: [
      "Two-storey modern town house",
      "Stone-clad feature wall",
      "Large glazed living areas",
      "First-floor balcony",
      "Paved forecourt and landscaped frontage",
    ],
    projectContact: {
      name: "Samuel Nderitu",
      role: "Architectural and Structural Designer",
    },
    image: "/catalog/images/ruiru-mugutha-town-house-front.webp",
    gallery: [
      {
        src: "/catalog/images/ruiru-mugutha-town-house-front.webp",
        alt: "Architectural render of the Ruiru Mugutha town house, front view",
      },
    ],
    featured: true,
  },
  {
    slug: "kabete-seven-storey-apartment-block",
    name: "Seven-Storey Apartment Block",
    location: "Kabete, Plot 4715",
    zone: "kiambu",
    type: "Residential",
    status: "In design",
    year: "2026",
    scope: "Architectural drawings, architectural renders",
    serviceSlugs: ["architectural-design"],
    excerpt:
      "A 27-unit apartment block arranged around a ground-floor parking podium, central lift and glazed stair core.",
    description:
      "A seven-storey residential block of 27 units, made up of 26 two-bedroom apartments and one studio, set over a ground-floor parking podium. Floors one to six each carry four two-bedroom units with ensuite master bedrooms, while the seventh floor adds two all-ensuite two-bedroom units with laundry areas, a studio and two roof terraces. A central lift and glazed stair core organises the plan.",
    keyFacts: [
      "Seven storeys over a ground-floor parking podium",
      "27 units: 26 two-bedroom apartments and one studio",
      "28 ensuite bedrooms",
      "Central lift and glazed stair core",
      "Two roof terraces on the seventh floor",
      "Typical floors 1–6: four two-bedroom units per floor, each with a master ensuite, second bedroom, common washroom, utility area, open-plan kitchen, dining and lounge, and private balcony",
      "Seventh floor: two all-ensuite two-bedroom units with laundry areas, a studio with its own washroom, and two roof terraces with timber decking",
      "Typical kitchen: taupe flat-panel cabinets, brushed steel handles, light stone-effect worktops, L-shaped layout, breakfast counter, gas hob and chimney hood",
      "Typical living-area floors: polished beige porcelain tiles",
      "Typical walls and ceilings: warm neutral paint, an ochre feature wall and recessed downlights",
      "Typical glazing: full-height aluminium sliding doors from the lounge to the balcony, plus large dark-framed windows",
    ],
    client: "John and Jedidiah Kariuki",
    projectContact: {
      name: "Samuel Nderitu",
      role: "Architectural and Structural Designer",
    },
    image: "/catalog/images/kabete-apartment-front.webp",
    gallery: [
      { src: "/catalog/images/kabete-apartment-front.webp", alt: "Architectural render of the Kabete apartment block, front elevation" },
      { src: "/catalog/images/kabete-apartment-side.webp", alt: "Architectural render of the Kabete apartment block, side perspective" },
      { src: "/catalog/images/kabete-apartment-rear.webp", alt: "Architectural render of the Kabete apartment block, rear perspective" },
      { src: "/catalog/images/kabete-apartment-kitchen-dining.webp", alt: "Typical apartment interior render, open-plan kitchen and dining" },
      { src: "/catalog/images/kabete-apartment-lounge-dining.webp", alt: "Typical apartment interior render, lounge and dining" },
      { src: "/catalog/images/kabete-apartment-typical-floor-plan.webp", alt: "Typical floor plan for floors one to six, with four two-bedroom apartments", fit: "contain" },
      { src: "/catalog/images/kabete-apartment-seventh-floor-plan.webp", alt: "Seventh-floor plan showing two apartments, a studio and two roof terraces", fit: "contain" },
    ],
    featured: true,
  },
  {
    slug: "pcea-baraka-church",
    name: "PCEA Baraka Church",
    location: "Ruiru Mugutha",
    zone: "kiambu",
    type: "Church",
    status: "Ongoing",
    year: "2026",
    scope: "Architectural drawings, architectural renders",
    serviceSlugs: ["architectural-design"],
    excerpt:
      "A contemporary church designed for 785 congregants, with a glazed gable, stone-clad columns and landscaped grounds.",
    description:
      "A modern church in Ruiru Mugutha with seating for 785 congregants. Tall gabled glazing, stone-clad columns and white rendered walls give the building a bright, contemporary presence, while the large glazed frontage fills the worship space with natural light. Landscaped grounds, paved walkways and parking frame the approach to the entrance.",
    keyFacts: [
      "Seating for 785 congregants",
      "Tall gabled glazing and stone-clad columns",
      "Landscaped grounds, paved walkways and parking",
      "Site progress documented from 1 August to 29 October 2026",
    ],
    projectContact: {
      name: "Samuel Nderitu",
      role: "Architectural and Structural Designer",
    },
    image: "/catalog/images/pcea-baraka-church-front.webp",
    gallery: [
      { src: "/catalog/images/pcea-baraka-church-front.webp", alt: "Architectural render of PCEA Baraka Church, front view" },
      { src: "/catalog/images/pcea-baraka-church-corner.webp", alt: "Architectural render of PCEA Baraka Church, corner view" },
      { src: "/catalog/images/pcea-baraka-church-entrance-gable.webp", alt: "Architectural render of the PCEA Baraka Church entrance gable" },
      { src: "/catalog/images/pcea-baraka-church-excavation-2026-08.webp", alt: "PCEA Baraka Church site progress, excavation, 1 August 2026" },
      { src: "/catalog/images/pcea-baraka-church-foundations-2026-09.webp", alt: "PCEA Baraka Church site progress, foundations, 1 September 2026" },
      { src: "/catalog/images/pcea-baraka-church-slab-reinforcement-2026-10.webp", alt: "PCEA Baraka Church site progress, slab reinforcement, 12 October 2026" },
      { src: "/catalog/images/pcea-baraka-church-slab-and-walling-2026-10.webp", alt: "PCEA Baraka Church site progress, slab complete and walling started, 29 October 2026" },
    ],
    featured: true,
    timeline: [
      {
        date: "1 Aug 2026",
        title: "Excavation",
        caption: "Site progress documented in the project catalogue.",
        image: "/catalog/images/pcea-baraka-church-excavation-2026-08.webp",
      },
      {
        date: "1 Sep 2026",
        title: "Foundations",
        caption: "Site progress documented in the project catalogue.",
        image: "/catalog/images/pcea-baraka-church-foundations-2026-09.webp",
      },
      {
        date: "12 Oct 2026",
        title: "Slab reinforcement",
        caption: "Site progress documented in the project catalogue.",
        image: "/catalog/images/pcea-baraka-church-slab-reinforcement-2026-10.webp",
      },
      {
        date: "29 Oct 2026",
        title: "Slab complete, walling started",
        caption: "Site progress documented in the project catalogue.",
        image: "/catalog/images/pcea-baraka-church-slab-and-walling-2026-10.webp",
      },
    ],
  },
  {
    slug: "gikomba-five-storey-commercial-building",
    name: "5-Storey Commercial Building",
    location: "Gikomba, Nairobi",
    zone: "nairobi",
    type: "Commercial",
    status: "In design",
    year: "2026",
    scope: "Architectural drawings, structural drawings, architectural renders",
    serviceSlugs: ["architectural-design", "structural-design"],
    excerpt:
      "A five-storey commercial building with continuous glazed frontages, glass-balustrade balconies and an open central stair.",
    description:
      "A five-storey commercial building in Gikomba, designed by ATro with full architectural and structural drawings. White rendered floor slabs wrap continuous glazed frontages, each floor opening onto a balcony with a glass balustrade. A dark stone-clad feature wall marks one end of the facade, and an open central staircase breaks up the long elevation. A paved forecourt with parking sits within a walled, landscaped plot.",
    keyFacts: [
      "Five storeys",
      "Continuous glazed frontage with glass-balustrade balconies on every floor",
      "Open central staircase",
      "Paved forecourt with parking",
      "Walled and landscaped plot",
      "Architectural drawings, structural drawings and architectural renders",
    ],
    projectContact: {
      name: "Samuel Nderitu",
      role: "Architectural and Structural Designer",
    },
    image: "/catalog/images/gikomba-five-storey-commercial-corner.webp",
    gallery: [
      {
        src: "/catalog/images/gikomba-five-storey-commercial-corner.webp",
        alt: "Architectural render of the Gikomba five-storey commercial building, corner view",
      },
      {
        src: "/catalog/images/gikomba-five-storey-commercial-side-aerial.webp",
        alt: "Architectural render of the Gikomba five-storey commercial building, side aerial view at sunset",
      },
      {
        src: "/catalog/images/gikomba-five-storey-commercial-front.webp",
        alt: "Architectural render of the Gikomba five-storey commercial building, front elevation at sunset",
      },
    ],
    featured: true,
  },
  {
    slug: "karen-courtyard-house",
    name: "Courtyard House Concept",
    location: "Illustrative setting",
    type: "Residential",
    status: "Illustrative",
    scope: "Illustrative design study",
    excerpt:
      "An illustrative courtyard-home study exploring inward-facing rooms, a planted garden and a quieter street edge.",
    description:
      "This concept study explores a courtyard home that turns everyday rooms toward a planted inner garden while using a more solid outer edge for privacy. Stone, plaster and timber screens suggest a restrained material direction. It is an illustrative design example, not a record of a completed or active ATRO project.",
    image: "/catalog/images/karen.webp",
    gallery: [
      { src: "/catalog/images/karen.webp", alt: "Illustrative garden-facing house concept" },
      { src: "/catalog/images/interior.webp", alt: "Illustrative living-room interior reference" },
      { src: "/catalog/images/detail.webp", alt: "Illustrative stone and concrete material detail" },
    ],
    featured: true,
  },
  {
    slug: "kiambu-ridge-residence",
    name: "Sloping-Site Home Concept",
    location: "Illustrative setting",
    type: "Residential",
    status: "Illustrative",
    scope: "Illustrative design study",
    excerpt:
      "A concept for a family home that follows a sloping site with stepped massing and a compact footprint.",
    description:
      "This illustrative study looks at how a two-storey family home might respond to a sloping site. Stepped massing, a simple roof line and a compact approach are presented as design ideas rather than a verified site solution. The images are visual references, not documentation of an ATRO commission.",
    image: "/catalog/images/kiambu.webp",
    gallery: [
      { src: "/catalog/images/kiambu.webp", alt: "Illustrative two-storey family-home reference" },
      { src: "/catalog/images/interior.webp", alt: "Illustrative interior reference" },
      { src: "/catalog/images/detail.webp", alt: "Illustrative masonry material detail" },
    ],
    featured: true,
  },
  {
    slug: "nyali-veranda-house",
    name: "Coastal Veranda House Concept",
    location: "Illustrative setting",
    type: "Residential",
    status: "Illustrative",
    scope: "Illustrative design study",
    excerpt:
      "A coastal-home concept built around deep shade, sheltered outdoor space and a natural-material palette.",
    description:
      "This illustrative coastal-home study uses a deep veranda and shaded openings to explore a more sheltered relationship between indoors and outdoors. Stone and a protective roof edge suggest a material direction for a coastal setting. It does not claim to be a built project or a site-specific coastal specification.",
    image: "/catalog/images/coast.webp",
    gallery: [
      { src: "/catalog/images/coast.webp", alt: "Illustrative shaded veranda reference" },
      { src: "/catalog/images/interior.webp", alt: "Illustrative shaded interior reference" },
      { src: "/catalog/images/detail.webp", alt: "Illustrative stone material reference" },
    ],
    featured: true,
  },
  {
    slug: "westlands-atelier",
    name: "Urban Workplace Concept",
    location: "Illustrative setting",
    type: "Commercial",
    status: "Illustrative",
    scope: "Illustrative design study",
    excerpt:
      "A compact workplace concept using a screened facade to balance daylight, privacy and a calm street presence.",
    description:
      "This illustrative workplace study explores a screened facade, recessed openings and a flexible interior arrangement. The design direction considers how a commercial frontage can admit light while moderating views from the street. The image is a concept reference, not a completed ATRO project.",
    image: "/catalog/images/commercial.webp",
    gallery: [
      { src: "/catalog/images/commercial.webp", alt: "Illustrative screened workplace facade" },
      { src: "/catalog/images/detail.webp", alt: "Illustrative facade material detail" },
      { src: "/catalog/images/interior.webp", alt: "Illustrative workplace interior reference" },
    ],
    featured: true,
  },
  {
    slug: "nakuru-parish-hall",
    name: "Community Hall Concept",
    location: "Illustrative setting",
    type: "Institutional",
    status: "Illustrative",
    scope: "Illustrative design study",
    excerpt:
      "A community-gathering-space concept focused on a clear, adaptable interior and generous natural light.",
    description:
      "This illustrative community hall study considers a straightforward, welcoming gathering space with a durable material palette and daylight from above. Its image is an architectural reference only; it is not evidence of a completed church or hall by ATRO.",
    image: "/catalog/images/church.webp",
    gallery: [
      { src: "/catalog/images/church.webp", alt: "Illustrative contemporary worship-space reference" },
      { src: "/catalog/images/detail.webp", alt: "Illustrative masonry and timber material reference" },
    ],
    featured: false,
  },
  {
    slug: "jacaranda-primary-wing",
    name: "Classroom Wing Concept",
    location: "Illustrative setting",
    type: "School",
    status: "Illustrative",
    scope: "Illustrative design study",
    excerpt:
      "A school-building concept that pairs a simple classroom wing with a sheltered walkway and shared outdoor space.",
    description:
      "This illustrative school concept pairs a straightforward classroom wing with a covered walkway and a planted shared court. The arrangement is presented as a design direction for circulation and outdoor learning, not as a record of a built school or an active construction site.",
    image: "/catalog/images/school.webp",
    gallery: [
      { src: "/catalog/images/school.webp", alt: "Illustrative classroom and covered-walkway reference" },
      { src: "/catalog/images/detail.webp", alt: "Illustrative painted masonry material detail" },
    ],
    featured: false,
  },
  {
    slug: "lavington-frame",
    name: "Two-Storey Home Concept",
    location: "Illustrative setting",
    type: "Residential",
    status: "Illustrative",
    scope: "Illustrative design study",
    excerpt:
      "A residential concept study exploring a compact two-storey form, clear structural rhythm and warm interior materials.",
    description:
      "This illustrative residential study explores the relationship between a simple structural frame, a compact two-storey plan and warm interior finishes. The images are design references, not current site photographs. No construction status or client story is implied.",
    image: "/catalog/images/hero.webp",
    gallery: [
      { src: "/catalog/images/hero.webp", alt: "Illustrative two-storey residential design reference" },
      { src: "/catalog/images/interior.webp", alt: "Illustrative residential interior reference" },
      { src: "/catalog/images/detail.webp", alt: "Illustrative construction-material detail" },
    ],
    featured: true,
  },
  {
    slug: "ruiru-garden-house",
    name: "Compact Garden Home Concept",
    location: "Illustrative setting",
    type: "Residential",
    status: "Illustrative",
    scope: "Illustrative design study",
    excerpt:
      "A small-home concept study considering how a compact footprint can leave useful space for a garden.",
    description:
      "This illustrative small-home study explores a compact house set within a usable garden. It is a starting point for discussing priorities such as footprint, outdoor space and future phasing; it does not represent a brief, cost plan or proposal for a real client.",
    image: "/catalog/images/hero.webp",
    gallery: [
      { src: "/catalog/images/hero.webp", alt: "Illustrative compact-home exterior reference" },
      { src: "/catalog/images/interior.webp", alt: "Illustrative small-home interior reference" },
      { src: "/catalog/images/kiambu.webp", alt: "Illustrative family-home design reference" },
    ],
    featured: false,
  },
];

export type ServiceCategory =
  | "design"
  | "construction"
  | "advisory"
  | "specialist"
  | "post-construction";

export type Service = {
  slug: string;
  title: string;
  kicker: string;
  lede: string;
  image: string;
  included: string[];
  types: string[];
  inputs: string[];
  projectSlugs?: string[];
  category: ServiceCategory;
  note?: string;
};

export const SERVICE_CATEGORIES: { id: ServiceCategory; title: string; description: string }[] = [
  {
    id: "design",
    title: "Design & Architecture",
    description: "From concept to construction-ready drawings.",
  },
  {
    id: "construction",
    title: "Construction & Delivery",
    description: "Building it, on time, on budget, on paper.",
  },
  {
    id: "advisory",
    title: "Advisory & Planning",
    description: "Numbers, strategy and decisions before the first brick.",
  },
  {
    id: "specialist",
    title: "Specialist Services",
    description: "Sustainability, technology and expert consultations.",
  },
  {
    id: "post-construction",
    title: "After Handover",
    description: "Maintenance, support and ongoing relationships.",
  },
];

export const SERVICES: Service[] = [
  // ─── Design & Architecture ───
  {
    slug: "architectural-design",
    title: "Architectural Design",
    kicker: "From brief to a building that can actually be built",
    lede: "Plans, sections, elevations and a material direction that survive contact with a site, a BOQ and a contractor — because in our case the contractor is us.",
    image: "/catalog/images/hero.webp",
    category: "design",
    included: [
      "Briefing and site reading",
      "Concept options with a cost-aware filter",
      "Developed drawings for pricing and construction",
      "Architectural renders and visualisations where required",
      "Material and opening schedules",
      "Coordination with structural and services input",
    ],
    projectSlugs: [
      "sigona-villa",
      "ruiru-mugutha-town-house",
      "kabete-seven-storey-apartment-block",
      "pcea-baraka-church",
      "gikomba-five-storey-commercial-building",
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
    image: "/catalog/images/site.webp",
    category: "design",
    included: [
      "Structural concept with the architectural plan",
      "Coordination of calculations and drawings with licensed structural professionals",
      "Foundation and frame intent aligned to soil and programme",
      "Buildability review before steel is ordered",
    ],
    projectSlugs: [
      "sigona-villa",
      "ruiru-mugutha-town-house",
      "gikomba-five-storey-commercial-building",
    ],
    types: ["Residential", "Commercial", "Institutional"],
    inputs: ["Architectural drawings", "Soil information where available", "Intended loads and use"],
    note: "Statutory structural sign-off is carried by the licensed professional appointed on the project. ATRO coordinates; we do not imply a registration we have not stated.",
  },
  {
    slug: "interior-spatial",
    title: "Interior / Spatial Design",
    kicker: "The rooms, not only the envelope",
    lede: "Joinery, light, floors and the way a house is actually used — designed with the structure, not stuck on at the end as a moodboard.",
    image: "/catalog/images/interior.webp",
    category: "design",
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
    slug: "landscape-architecture",
    title: "Landscape Architecture",
    kicker: "The grounds that complete the building",
    lede: "Outdoor spaces designed with the same rigour as the building — hardscape, planting, drainage and lighting as part of the project, not an afterthought.",
    image: "/catalog/images/hero.webp",
    category: "design",
    included: [
      "Site grading and drainage strategy",
      "Hardscape and planting design",
      "Outdoor lighting and irrigation intent",
      "Material selection tied to the building palette",
    ],
    types: ["Residential gardens", "Commercial grounds", "Institutional campuses"],
    inputs: ["Site survey", "How you want to use the outdoor space", "Maintenance commitment"],
  },
  {
    slug: "master-planning",
    title: "Master Planning",
    kicker: "The big picture before the first drawing",
    lede: "For estates, campuses and multi-building developments: land use, phasing, infrastructure and financial viability — so the individual buildings make sense together.",
    image: "/catalog/images/site.webp",
    category: "design",
    included: [
      "Site analysis and opportunities mapping",
      "Land use and density studies",
      "Infrastructure and access planning",
      "Phasing strategy aligned to cash flow",
    ],
    types: ["Residential estates", "Institutional campuses", "Mixed-use developments"],
    inputs: ["Land title and survey", "Development objectives", "Budget and timeline"],
  },

  // ─── Construction & Delivery ───
  {
    slug: "construction",
    title: "Construction & Project Execution",
    kicker: "The building, on the ground, against a locked scope",
    lede: "Site set-up, structure, envelope and finishes — run from a programme, a BOQ and a weekly communication rhythm. Not from a WhatsApp argument.",
    image: "/catalog/images/site.webp",
    category: "construction",
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
    slug: "renovation-restoration",
    title: "Renovation & Adaptive Reuse",
    kicker: "What exists, reworked with intent",
    lede: "Structural restoration, space reconfiguration and interior upgrades — sequenced to minimise disruption and maximise the value of what is already standing.",
    image: "/catalog/images/detail.webp",
    category: "construction",
    included: [
      "Condition assessment and structural review",
      "Renovation drawings and scope definition",
      "Phased works to minimise displacement",
      "Heritage-sensitive restoration where required",
    ],
    types: ["Houses", "Commercial fit-out", "Institutional upgrades"],
    inputs: ["Existing drawings or survey", "What must stay, what can change", "Occupancy constraints"],
  },
  {
    slug: "precast",
    title: "Precast & Modern Methods",
    kicker: "Where a faster, cleaner method actually helps",
    lede: "Precast, modular and other modern methods — used when they save time or waste, not as a slogan. If in-situ is the honest answer, we say so.",
    image: "/catalog/images/detail.webp",
    category: "construction",
    included: [
      "Method review at concept",
      "Where precast earns its transport cost",
      "Coordination with structure and finishes",
      "On-site sequencing",
    ],
    types: ["Repeat units", "Schools", "Boundary and drainage elements"],
    inputs: ["Programme pressure", "Access for lifting", "Repeatability of the design"],
  },

  // ─── Advisory & Planning ───
  {
    slug: "boq-cost-planning",
    title: "Bill of Quantities / Cost Planning",
    kicker: "A number you can make a decision with",
    lede: "Quantities, rates and options — so you choose a roof, a floor and a window because you understand what they cost, not because a contractor smiled.",
    image: "/catalog/images/detail.webp",
    category: "advisory",
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
    image: "/catalog/images/site.webp",
    category: "advisory",
    included: [
      "Site inspections against drawings",
      "Progress photography and a decision log",
      "Programme and cost checkpoints",
      "Snagging and handover support",
    ],
    projectSlugs: ["sigona-villa"],
    types: ["Owner-builder sites", "Diaspora projects", "Institutional clients"],
    inputs: ["Drawings", "Contract or contractor details", "What you want us to hold you to"],
  },
  {
    slug: "feasibility-due-diligence",
    title: "Feasibility Studies & Due Diligence",
    kicker: "Know before you commit",
    lede: "Site analysis, financial viability and risk assessment — so you invest with clarity, not hope. Essential for diaspora clients and institutional investors.",
    image: "/catalog/images/detail.webp",
    category: "advisory",
    included: [
      "Site physical and legal assessment",
      "Financial viability and cash flow modelling",
      "Risk register and mitigation strategy",
      "Go / no-go recommendation with reasoning",
    ],
    types: ["Real estate investment", "Diaspora projects", "Institutional acquisitions"],
    inputs: ["Site location and title", "Investment budget", "Expected returns or use case"],
  },
  {
    slug: "real-estate-advisory",
    title: "Real Estate Advisory",
    kicker: "Investment guidance rooted in construction reality",
    lede: "Market analysis, development strategy and procurement advice — for clients who need a builder's perspective on an investment decision.",
    image: "/catalog/images/hero.webp",
    category: "advisory",
    included: [
      "Market and location analysis",
      "Development programme and budget framing",
      "Procurement strategy and contractor selection",
      "Ongoing investment review and reporting",
    ],
    types: ["Property developers", "Institutional investors", "Diaspora investors"],
    inputs: ["Investment parameters", "Target returns", "Risk appetite"],
  },
  {
    slug: "project-financing",
    title: "Project Financing Support",
    kicker: "Structure the money before you structure the building",
    lede: "Budget structuring, cash flow planning and lender documentation — so your project is fundable, not just drawable.",
    image: "/catalog/images/detail.webp",
    category: "advisory",
    included: [
      "Project budget development",
      "Cash flow projection and phasing",
      "Lender-ready documentation packages",
      "Value engineering to meet financing targets",
    ],
    types: ["Residential developments", "Commercial projects", "Institutional builds"],
    inputs: ["Project scope and drawings", "Target budget", "Financing timeline"],
  },

  // ─── Specialist Services ───
  {
    slug: "sustainability-green-building",
    title: "Sustainability & Green Building",
    kicker: "Buildings that cost less to run and leave less behind",
    lede: "Energy modeling, material selection and certification guidance — making sustainability practical, not performative. EDGE, LEED and Kenya Green Star aligned.",
    image: "/catalog/images/hero.webp",
    category: "specialist",
    included: [
      "Energy and water efficiency analysis",
      "Sustainable material selection and specification",
      "Green building certification guidance (EDGE, LEED)",
      "Solar feasibility and renewable energy integration",
    ],
    types: ["Residential", "Commercial", "Institutional"],
    inputs: ["Project drawings", "Sustainability goals", "Certification target if any"],
  },
  {
    slug: "smart-home-integration",
    title: "Smart Home & Building Technology",
    kicker: "Intelligence in the walls, not just on the walls",
    lede: "Automation, security, energy management and connectivity — designed into the building from concept, not cable-tied on after handover.",
    image: "/catalog/images/interior.webp",
    category: "specialist",
    included: [
      "Smart home system design and specification",
      "Security and access control integration",
      "Energy management and monitoring",
      "Network and infrastructure planning",
    ],
    types: ["Luxury residences", "Commercial offices", "Mixed-use developments"],
    inputs: ["Technology preferences", "Security requirements", "Budget for automation"],
  },
  {
    slug: "construction-technology-bim",
    title: "Construction Technology / BIM",
    kicker: "Digital precision before physical execution",
    lede: "Building Information Modeling, clash detection and digital twins — reducing errors, saving time and giving you visibility before a single brick is laid.",
    image: "/catalog/images/site.webp",
    category: "specialist",
    included: [
      "3D BIM modeling and coordination",
      "Clash detection and resolution",
      "4D scheduling and sequencing",
      "Digital twin and as-built documentation",
    ],
    types: ["Complex projects", "Multi-discipline coordination", "Institutional"],
    inputs: ["Design drawings", "Project complexity assessment", "Coordination requirements"],
  },
  {
    slug: "environmental-impact-assessment",
    title: "Environmental Impact Assessment",
    kicker: "NEMA compliance from day one",
    lede: "EIA reports, environmental audits and compliance management — ensuring your project meets regulatory requirements and community expectations.",
    image: "/catalog/images/detail.webp",
    category: "specialist",
    included: [
      "Scoping and baseline studies",
      "Impact assessment and mitigation planning",
      "EIA report preparation and NEMA submission",
      "Environmental audit during construction",
    ],
    types: ["Commercial developments", "Industrial projects", "Institutional builds"],
    inputs: ["Project description and drawings", "Site location", "Known environmental sensitivities"],
  },

  // ─── Post-Construction ───
  {
    slug: "maintenance-inspections",
    title: "Post-Construction Maintenance",
    kicker: "The building after you move in",
    lede: "Annual inspections, warranty management and planned maintenance — because a building is a long-term asset, not a handover moment.",
    image: "/catalog/images/hero.webp",
    category: "post-construction",
    included: [
      "Annual structural and envelope inspections",
      "Maintenance scheduling and reminders",
      "Warranty tracking and claims support",
      "Emergency response coordination",
    ],
    types: ["Residential", "Commercial", "Institutional"],
    inputs: ["Building as-built documentation", "Warranty information", "Maintenance history"],
  },
  {
    slug: "ffep-procurement",
    title: "FF&E Procurement & Styling",
    kicker: "Furniture, fixtures and the finishing touch",
    lede: "Sourcing, procurement and styling of furniture, fixtures and equipment — so the building is ready to use, not just ready to show.",
    image: "/catalog/images/interior.webp",
    category: "post-construction",
    included: [
      "FF&E specification and sourcing",
      "Budget management and procurement",
      "Delivery coordination and installation",
      "Styling and final presentation",
    ],
    types: ["Residential", "Hospitality", "Commercial offices"],
    inputs: ["Interior design drawings", "FF&E budget", "Delivery timeline"],
  },
  // ─── Abroad (diaspora) — the full product, entry point for /diaspora ───
  {
    slug: "building-from-abroad",
    title: "Building from Abroad",
    kicker: "Your project in Kenya, run from wherever you are",
    lede: "Design, due diligence, construction and handover for clients overseas — with milestone payments, a private project portal, weekly written reports and a named project manager, so you are never guessing from photographs.",
    image: "/catalog/images/site.webp",
    category: "construction",
    included: [
      "Land due diligence and surveyor verification",
      "Design and structural engineering",
      "Measured Bill of Quantities before you commit",
      "Private client portal with milestone approvals and payment ledger",
      "Weekly written reports with photographic evidence",
      "Decision log, document vault and handover pack",
    ],
    types: ["Diaspora clients", "New build", "Renovation", "Phased work"],
    inputs: ["Plot reference or address", "Programme and handover date", "Budget band"],
    note: "Start at /diaspora for the full suite — portal, verification registers, red flag checker, guides and payment terms.",
  },
  {
    slug: "construction-training",
    title: "Construction Training & Workshops",
    kicker: "Knowledge transfer for owner-builders",
    lede: "Practical workshops for clients who want to understand what they are building — BOQ reading, site supervision basics and decision-making frameworks.",
    image: "/catalog/images/site.webp",
    category: "post-construction",
    included: [
      "BOQ and cost planning basics",
      "Site supervision fundamentals",
      "Material selection and quality assessment",
      "Decision-making frameworks for owners",
    ],
    types: ["Owner-builders", "Diaspora clients", "Property managers"],
    inputs: ["Project stage", "Knowledge gaps", "Team size"],
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
    image: "/catalog/images/detail.webp",
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
    image: "/catalog/images/kiambu.webp",
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
    image: "/catalog/images/school.webp",
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
  { to: "/" as const, label: "Home" },
  { to: "/projects" as const, label: "Work" },
  { to: "/services" as const, label: "Services" },
  { to: "/tools" as const, label: "Tools", badge: "New" as const },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
];

export const DIASPORA_LINK = { to: "/diaspora" as const, label: "Abroad", badge: "New" as const };

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
