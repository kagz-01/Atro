// ATRO — Abroad (diaspora) product.
//
// The offering itself lives in `site.ts` (the same registry every other page
// reads, so /services and /diaspora cannot drift). This module is only the
// product-page content: the feature map, the plan, and the objections.

import type { Service } from "@/lib/site";

export type AbroadFeature = {
  to: string;
  title: string;
  kicker: string;
  body: string;
  cta: string;
  /** The feature that needs an account. */
  requiresSignIn?: boolean;
};

export const ABROAD_HERO_STATS = [
  { value: "3M+", label: "Kenyans abroad" },
  { value: "KES 593B", label: "Remittances 2025" },
  { value: "1.40x", label: "Diaspora zone rate" },
  { value: "Weekly", label: "Written reports" },
] as const;

/** The suite. Every card routes to something that already works. */
export const ABROAD_FEATURES: AbroadFeature[] = [
  {
    to: "/portal",
    title: "The client project portal",
    kicker: "Accounts — your build, live",
    body: "Sign in and your project is a record, not a promise: milestones with photographic evidence, the payment ledger with retention, every certificate, the document vault, and the decision log. You approve milestones, release certified payments and record decisions from it.",
    cta: "Open the portal",
    requiresSignIn: true,
  },
  {
    to: "/verify",
    title: "Verify anyone, including us",
    kicker: "Eight registers, eight checks",
    body: "The Kenyan registers that prove a builder or professional is real, what each one does and does not establish, and eight checks you can run in about two hours.",
    cta: "See the registers",
  },
  {
    to: "/scam-check",
    title: "Red flag checker",
    kicker: "24 weighted signals",
    body: "Select what you have actually been told or asked for and get a risk score with the specific thing to do about each one. Runs in your browser — nothing is sent.",
    cta: "Check a builder",
  },
  {
    to: "/guides/journey",
    title: "The build journey, stage by stage",
    kicker: "Nine stages",
    body: "From empty plot to keys: durations, what you approve, what you should be receiving as proof, and how each stage fails when nobody is watching.",
    cta: "Walk through the stages",
  },
  {
    to: "/guides",
    title: "Free guides, no gate",
    kicker: "Seven guides",
    body: "Buying land safely, sending money legally, reading a bill of quantities, the permits you will need, and how to run a build you are not standing next to.",
    cta: "Read the guides",
  },
  {
    to: "/fees",
    title: "How payment actually works",
    kicker: "Fees and terms",
    body: "Stage payments released against certificates, 5–10% retention, what every quote excludes, and how to pay for a project in Kenya from another country.",
    cta: "Read the payment terms",
  },
];

export const ABROAD_INCLUDED = [
  {
    icon: "registered",
    title: "Registered professionals",
    desc: "Architects (AAK), Engineers (EBK), Quantity Surveyors. Not salespeople — people who sign drawings and take professional liability.",
  },
  {
    icon: "office",
    title: "Physical office in Nairobi",
    desc: "UAP Old Mutual Building, Upper Hill. You can visit. We are not a website with a WhatsApp number.",
  },
  {
    icon: "boq",
    title: "BOQ before construction",
    desc: "Every project starts with a measured Bill of Quantities. You know the cost before you commit. No vague estimates.",
  },
  {
    icon: "milestone",
    title: "Milestone-based payments",
    desc: "Pay for done work, not promises. Each payment certified against verified progress with photographic evidence.",
  },
  {
    icon: "report",
    title: "Weekly written reports",
    desc: "Every Friday: what was done, what is planned, what needs a decision. With photographs. Not random WhatsApp messages.",
  },
  {
    icon: "manager",
    title: "Named project manager",
    desc: "One person who knows your project, your preferences, your concerns. Not a call centre. Not a sales team.",
  },
  {
    icon: "verification",
    title: "Independent verification",
    desc: "Site supervisor independent of the contractor. Work verified against drawings. Materials checked against specifications.",
  },
  {
    icon: "openbook",
    title: "Open-book costing",
    desc: "You see every cost — material prices, labour rates, subcontractor quotes. No black boxes. No mysterious markups.",
  },
] as const;

export const ABROAD_PROCESS = [
  {
    num: 1,
    title: "Initial call (your time zone)",
    icon: "phone",
    desc: "We schedule a video call at a time that works for you. UK morning, US evening, Gulf afternoon. We listen. No sales pitch.",
    detail:
      "We discuss your brief, your site, your budget. If we are the right studio, we say so. If we are not, we say that too.",
  },
  {
    num: 2,
    title: "Site due diligence",
    icon: "pin",
    desc: "Before design starts, we verify the land is legitimate. Ministry search, encumbrance check, surveyor verification, neighbour confirmation.",
    detail:
      "You get a written due diligence report. If there are issues, we tell you before you spend a shilling on design.",
  },
  {
    num: 3,
    title: "Design with cost in the room",
    icon: "clipboard",
    desc: "Architectural design, structural engineering, cost planning — happening together, not sequentially.",
    detail:
      "You see concept options with indicative costs. If the sketch and the money disagree, the money wins until the sketch is rewritten.",
  },
  {
    num: 4,
    title: "Bill of Quantities",
    icon: "file",
    desc: "A measured, priced document listing every material, labour item and cost. This is what you are committing to.",
    detail: "SMM2-compliant. You know the cost before you sign anything. No surprises later.",
  },
  {
    num: 5,
    title: "Contract & locked scope",
    icon: "lock",
    desc: "Signed contract with scope, schedule, payment terms and variation procedure. Everything documented.",
    detail:
      "No verbal agreements. No 'we will sort it out later'. A written contract that protects both parties.",
  },
  {
    num: 6,
    title: "Construction — weekly visibility",
    icon: "camera",
    desc: "Weekly written reports every Friday. Photo timeline. Scheduled video calls. Decision log for every choice.",
    detail:
      "You see progress in real time. You approve milestones before payments are released. You never guess.",
  },
  {
    num: 7,
    title: "Payment — only for done work",
    icon: "card",
    desc: "Milestone-based payments. Each payment certified by the project manager against verified progress.",
    detail:
      "Photographic evidence. Material delivery notes. Inspection reports. You pay for what is complete, not what is promised.",
  },
  {
    num: 8,
    title: "Handover — keys and documents",
    icon: "check",
    desc: "Inspected, snagged, closed. Keys, O&M manuals, warranties, and a building you can occupy without a hidden list.",
    detail:
      "County Certificate of Occupation. Final account. Everything documented. The paper trail is complete.",
  },
] as const;

export const ABROAD_CHANNELS = [
  {
    name: "Weekly written report",
    frequency: "Every Friday (EAT)",
    format: "PDF via email",
    contents: [
      "Work completed this week with photos",
      "Work planned next week",
      "Budget status",
      "Decisions needed",
      "Risks or delays",
    ],
  },
  {
    name: "Scheduled video call",
    frequency: "Weekly or bi-weekly",
    format: "Zoom / Google Meet",
    contents: [
      "Progress review with screen sharing",
      "Upcoming decisions",
      "Budget update",
      "Any concerns",
    ],
  },
  {
    name: "WhatsApp group",
    frequency: "As needed",
    format: "Quick questions only",
    contents: [
      "Daily progress photos welcome",
      "Response within 24 hours",
      "No decisions via WhatsApp",
      "Urgent issues: call directly",
    ],
  },
  {
    name: "Decision log",
    frequency: "Every decision",
    format: "Shared document",
    contents: [
      "Date, options considered, outcome",
      "Both parties maintain a copy",
      "Reference for disputes",
      "Historical record",
    ],
  },
] as const;

export const ABROAD_PAYMENT_PHASES = [
  {
    phase: "Design & documentation",
    pay: "Fixed fee, 2-3 installments as deliverables complete",
    protect: "Each payment tied to a specific deliverable",
  },
  {
    phase: "Statutory approvals",
    pay: "Fixed fee per application",
    protect: "Payment after approval is obtained, not before",
  },
  {
    phase: "Construction",
    pay: "Monthly or milestone-based, certified by PM",
    protect: "Site inspection + photos + delivery notes before payment",
  },
  {
    phase: "Variations",
    pay: "Priced and approved before work starts",
    protect: "Written variation order signed by both parties",
  },
  {
    phase: "Retention",
    pay: "5-10% retained until defects liability ends",
    protect: "Ensures contractor returns to fix any defects",
  },
] as const;

export const ABROAD_NEVER = [
  "Ask for large upfront deposits before construction starts",
  "Give you a lump sum without a Bill of Quantities",
  "Communicate only via WhatsApp with no written record",
  "Start work without signed drawings and a locked scope",
  "Refuse to let you see the site or send photographs",
  "Hide costs in vague line items or mysterious markups",
  "Allow the contractor to bill for work not yet done",
  "Ignore your questions or go silent for weeks",
] as const;

export const ABROAD_FAQS = [
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
    q: "Do I need an account to see my project?",
    a: "Yes. The portal is private per account — your milestones, evidence, payments and documents are visible only to you. Signing in takes one click with an account you already have, and you approve from there.",
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
    q: "What about NCA and NEMA?",
    a: "We handle all statutory registrations and approvals. NCA registration, NEMA application (if required), county building approval. You don't need to navigate these yourself.",
  },
  {
    q: "How do you verify the land is legitimate?",
    a: "Before we start, we conduct or commission: official search at Ministry of Lands, encumbrance check, surveyor verification, neighbour check, and county status. You get a full due diligence report.",
  },
  {
    q: "Can I choose my own contractor?",
    a: "Yes. We manage tenders and evaluate bids. You choose from pre-qualified contractors based on merit, not just price. We recommend against choosing the cheapest bid.",
  },
] as const;

export const ABROAD_RED_FLAGS = [
  "Large upfront deposit (more than 15%) before construction starts",
  "No NCA registration number displayed or provided",
  "No written contract — just WhatsApp agreements",
  "Cannot provide references from completed projects",
  "Pressures you to pay quickly — 'price going up', 'other buyers interested'",
  "No Bill of Quantities — just a lump sum",
  "Artistic impressions that do not match the actual site",
  "New company with no track record",
  "Refuses to allow independent inspection",
  "Variations communicated verbally, not in writing",
] as const;

/** The Abroad service, as it appears in the shared services registry. */
export const ABROAD_SERVICE_SLUG = "building-from-abroad";

export function abroadService(services: Service[]): Service | undefined {
  return services.find((s) => s.slug === ABROAD_SERVICE_SLUG);
}