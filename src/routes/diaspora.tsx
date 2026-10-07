import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  Eye,
  FileText,
  MessageCircle,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Camera,
  ClipboardCheck,
  CreditCard,
  MapPin,
  User,
  Lock,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CtaBand } from "@/components/page-hero";
import { whatsappHref, defaultWhatsappText } from "@/lib/whatsapp";

export const Route = createFileRoute("/diaspora")({
  component: DiasporaPage,
  head: () => ({
    meta: [
      { title: "Building from Abroad — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Kenyans abroad: build your home with confidence. ATRO provides weekly reports, milestone payments, independent verification and a named project manager — not WhatsApp guesses.",
      },
    ],
  }),
});

const TRUST_SIGNALS = [
  {
    icon: BadgeCheck,
    title: "Registered professionals",
    desc: "Architects (AAK), Engineers (EBK), Quantity Surveyors. Not salespeople — people who sign drawings and take professional liability.",
  },
  {
    icon: Building,
    title: "Physical office in Nairobi",
    desc: "UAP Old Mutual Building, Upper Hill. You can visit. We are not a website with a WhatsApp number.",
  },
  {
    icon: FileText,
    title: "BOQ before construction",
    desc: "Every project starts with a measured Bill of Quantities. You know the cost before you commit. No vague estimates.",
  },
  {
    icon: CreditCard,
    title: "Milestone-based payments",
    desc: "Pay for done work, not promises. Each payment certified against verified progress with photographic evidence.",
  },
  {
    icon: Camera,
    title: "Weekly written reports",
    desc: "Every Friday: what was done, what is planned, what needs a decision. With photographs. Not random WhatsApp messages.",
  },
  {
    icon: User,
    title: "Named project manager",
    desc: "One person who knows your project, your preferences, your concerns. Not a call centre. Not a sales team.",
  },
  {
    icon: Eye,
    title: "Independent verification",
    desc: "Site supervisor independent of the contractor. Work verified against drawings. Materials checked against specifications.",
  },
  {
    icon: Lock,
    title: "Open-book costing",
    desc: "You see every cost — material prices, labour rates, subcontractor quotes. No black boxes. No mysterious markups.",
  },
];

const RED_FLAGS = [
  { icon: AlertTriangle, text: "Large upfront deposit (more than 15%) before construction starts" },
  { icon: AlertTriangle, text: "No NCA registration number displayed or provided" },
  { icon: AlertTriangle, text: "No written contract — just WhatsApp agreements" },
  { icon: AlertTriangle, text: "Cannot provide references from completed projects" },
  { icon: AlertTriangle, text: "Pressures you to pay quickly — 'price going up', 'other buyers interested'" },
  { icon: AlertTriangle, text: "No Bill of Quantities — just a lump sum" },
  { icon: AlertTriangle, text: "Artistic impressions that do not match the actual site" },
  { icon: AlertTriangle, text: "New company with no track record" },
  { icon: AlertTriangle, text: "Refuses to allow independent inspection" },
  { icon: AlertTriangle, text: "Variations communicated verbally, not in writing" },
];

const PROCESS_STEPS = [
  {
    num: 1,
    title: "Initial call (your time zone)",
    desc: "We schedule a video call at a time that works for you. UK morning, US evening, Gulf afternoon. We listen. No sales pitch.",
    icon: Phone,
    detail: "We discuss your brief, your site, your budget. If we are the right studio, we say so. If we are not, we say that too.",
  },
  {
    num: 2,
    title: "Site due diligence",
    desc: "Before design starts, we verify the land is legitimate. Ministry search, encumbrance check, surveyor verification, neighbour confirmation.",
    icon: MapPin,
    detail: "You get a written due diligence report. If there are issues, we tell you before you spend a shilling on design.",
  },
  {
    num: 3,
    title: "Design with cost in the room",
    desc: "Architectural design, structural engineering, cost planning — happening together, not sequentially.",
    icon: ClipboardCheck,
    detail: "You see concept options with indicative costs. If the sketch and the money disagree, the money wins until the sketch is rewritten.",
  },
  {
    num: 4,
    title: "Bill of Quantities",
    desc: "A measured, priced document listing every material, labour item, and cost. This is what you are committing to.",
    icon: FileText,
    detail: "SMM2-compliant. You know the cost before you sign anything. No surprises later.",
  },
  {
    num: 5,
    title: "Contract & locked scope",
    desc: "Signed contract with scope, schedule, payment terms, and variation procedure. Everything documented.",
    icon: Lock,
    detail: "No verbal agreements. No 'we will sort it out later'. A written contract that protects both parties.",
  },
  {
    num: 6,
    title: "Construction — weekly visibility",
    desc: "Weekly written reports every Friday. Photo timeline. Scheduled video calls. Decision log for every choice.",
    icon: Camera,
    detail: "You see progress in real time. You approve milestones before payments are released. You never guess.",
  },
  {
    num: 7,
    title: "Payment — only for done work",
    desc: "Milestone-based payments. Each payment certified by the project manager against verified progress.",
    icon: CreditCard,
    detail: "Photographic evidence. Material delivery notes. Inspection reports. You pay for what is complete, not what is promised.",
  },
  {
    num: 8,
    title: "Handover — keys and documents",
    desc: "Inspected, snagged, closed. Keys, O&M manuals, warranties, and a building you can occupy without a hidden list.",
    icon: CheckCircle2,
    detail: "County Certificate of Occupation. Final account. Everything documented. The paper trail is complete.",
  },
];

const COMMUNICATION_CHANNELS = [
  {
    name: "Weekly written report",
    frequency: "Every Friday (EAT)",
    format: "PDF via email",
    contents: ["Work completed this week with photos", "Work planned next week", "Budget status", "Decisions needed", "Risks or delays"],
    icon: FileText,
  },
  {
    name: "Scheduled video call",
    frequency: "Weekly or bi-weekly",
    format: "Zoom / Google Meet",
    contents: ["Progress review with screen sharing", "Upcoming decisions", "Budget update", "Any concerns"],
    icon: Phone,
  },
  {
    name: "WhatsApp group",
    frequency: "As needed",
    format: "Quick questions only",
    contents: ["Daily progress photos welcome", "Response within 24 hours", "No decisions via WhatsApp", "Urgent issues: call directly"],
    icon: MessageCircle,
  },
  {
    name: "Decision log",
    frequency: "Every decision",
    format: "Shared document",
    contents: ["Date, options considered, outcome", "Both parties maintain a copy", "Reference for disputes", "Historical record"],
    icon: ClipboardCheck,
  },
];

function Building(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
    </svg>
  );
}

function DiasporaPage() {
  return (
    <main className="pt-28 pb-0">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-maroon text-paper">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-burgundy/50 via-maroon to-maroon" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/8 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-burgundy/30 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 md:py-24">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-paper/60 hover:text-paper mb-8"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>

          <Badge tone="gold" className="mb-6">For Kenyans abroad</Badge>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl text-paper">
            Build your home. <br />
            <span className="text-gold">Without the guesswork.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-paper/75">
            You are thousands of kilometres away. You cannot be on site every day.
            That is exactly why you need a system — not a WhatsApp group and a prayer.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild variant="gold" className="h-14 px-8 text-[12px] uppercase tracking-[0.16em]">
              <Link to="/portal">
                See the client portal
                <ArrowRight className="size-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-14 px-8 text-[12px] uppercase tracking-[0.16em] border-paper/20 text-paper hover:bg-paper/10">
              <Link to="/start" search={{ from: "diaspora" }}>
                Start a project
              </Link>
            </Button>
            <a
              href={whatsappHref(defaultWhatsappText({ zone: "diaspora" }))}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-14 px-8 items-center gap-3 border border-paper/20 text-paper text-[12px] uppercase tracking-[0.16em] font-bold rounded-2xl hover:bg-paper/10 transition-colors"
            >
              <MessageCircle className="size-5" />
              WhatsApp
            </a>
          </div>

          {/* Quick stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
            {[
              { value: "3M+", label: "Kenyans abroad" },
              { value: "KES 593B", label: "Remittances 2025" },
              { value: "1.40x", label: "Diaspora zone rate" },
              { value: "Weekly", label: "Written reports" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="font-display text-2xl text-gold">{s.value}</p>
                <p className="text-xs text-paper/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you actually get (working features) ── */}
      <section className="bg-stone/50 py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl">
            <Badge tone="maroon" className="mb-4">Not promises — tools</Badge>
            <h2 className="font-display text-3xl md:text-4xl text-maroon">
              Everything below is live. Try it before you talk to anyone.
            </h2>
            <p className="mt-5 text-lg text-ink/70">
              Anyone can promise weekly reports and independent verification. These
              are the working parts of the system — open them, use them on us, and on
              anyone else you are considering.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {[
              {
                to: "/portal",
                icon: ClipboardCheck,
                title: "The client project portal",
                body: "Milestones with photographic evidence, a payment ledger with retention, the full document vault, and the decision log — every approval, certificate and choice, in one record you own.",
                cta: "Open a demonstration project",
                accent: true,
              },
              {
                to: "/verify",
                icon: BadgeCheck,
                title: "Verify anyone, including us",
                body: "The eight Kenyan registers that prove a builder or professional is real, what each one does and does not establish, and eight checks you can run in about two hours.",
                cta: "See the registers",
              },
              {
                to: "/scam-check",
                icon: Shield,
                title: "Red flag checker",
                body: "Select what you have actually been told or asked for, and get a risk score with the specific thing to do about each one. Runs in your browser — nothing is sent.",
                cta: "Check a builder",
              },
              {
                to: "/guides/journey",
                icon: Eye,
                title: "The build journey, stage by stage",
                body: "All nine stages from empty plot to keys: durations, what you approve, what you should be receiving as proof, and how each stage fails when nobody is watching.",
                cta: "Walk through the stages",
              },
              {
                to: "/guides",
                icon: FileText,
                title: "Free guides, no gate",
                body: "Buying land safely, sending money legally, reading a bill of quantities, the permits you will need, and how to run a build you are not standing next to.",
                cta: "Read the guides",
              },
              {
                to: "/fees",
                icon: CreditCard,
                title: "How payment actually works",
                body: "Stage payments released against certificates, 5–10% retention, what every quote excludes, and how to pay for a project in Kenya from another country.",
                cta: "Read the payment terms",
              },
            ].map((f) => (
              <Link
                key={f.to}
                to={f.to}
                className={`group flex flex-col rounded-3xl border p-7 transition-all ${
                  f.accent
                    ? "border-gold/60 bg-maroon text-paper shadow-[0_12px_50px_rgb(60_5_8/0.25)]"
                    : "border-ink/10 bg-white hover:border-gold/60 hover:shadow-[0_10px_40px_rgb(201_146_79/0.16)]"
                }`}
              >
                <span
                  className={`flex size-12 items-center justify-center rounded-2xl ${
                    f.accent ? "bg-gold text-maroon" : "bg-maroon/10 text-maroon"
                  }`}
                >
                  <f.icon className="size-6" />
                </span>
                <h3
                  className={`mt-6 font-display text-2xl ${
                    f.accent ? "text-paper" : "text-maroon"
                  }`}
                >
                  {f.title}
                </h3>
                <p
                  className={`mt-3 flex-1 text-[15px] leading-relaxed ${
                    f.accent ? "text-paper/75" : "text-ink/65"
                  }`}
                >
                  {f.body}
                </p>
                <span
                  className={`mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-bold ${
                    f.accent ? "text-gold" : "text-burgundy"
                  } group-hover:gap-3 transition-all`}
                >
                  {f.cta}
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── The honest truth ── */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 md:py-24">
        <div className="max-w-3xl">
          <Badge tone="maroon" className="mb-4">The honest truth</Badge>
          <h2 className="font-display text-3xl md:text-4xl text-maroon">
            Kenyans abroad lose millions every year to construction scams.
          </h2>
          <p className="mt-6 text-ink/70 text-lg leading-relaxed">
            From Dubai to Atlanta, thousands of Kenyans have poured savings into off-plan apartments and gated communities — only to discover the show house was rented, the title deed was forged, or the developer vanished.
          </p>
          <p className="mt-4 text-ink/70 text-lg leading-relaxed">
            The scams start with glossy adverts, flexible payment plans, and developers who call themselves "young visionaries building a better Kenya." They send holiday greetings, ask about your family. Then the updates stop. Construction halts. Communication dries up.
          </p>
          <p className="mt-4 text-ink/70 text-lg leading-relaxed">
            <strong className="text-maroon">We are not here to sell you a dream.</strong> We are here to give you a system that makes sure your money becomes a building — not a WhatsApp story.
          </p>
        </div>

        <div className="mt-12 p-6 md:p-8 bg-red-50 border border-red-200 rounded-2xl">
          <h3 className="font-display text-xl text-red-800 flex items-center gap-2">
            <AlertTriangle className="size-5" />
            Red flags to watch for
          </h3>
          <p className="mt-2 text-sm text-red-700">
            If any of these are true, walk away. You will save yourself years of pain.
          </p>
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {RED_FLAGS.map((flag, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-red-800">
                <flag.icon className="size-4 mt-0.5 shrink-0 text-red-500" />
                <span>{flag.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ── */}
      <section className="bg-stone/60 py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mb-12">
            <Badge tone="gold" className="mb-4">How ATRO protects you</Badge>
            <h2 className="font-display text-3xl md:text-4xl text-maroon">
              Trust is not a promise. It is a system.
            </h2>
            <p className="mt-4 text-ink/70 text-lg">
              Every one of these is contractual — not optional, not "if we have time", not "our usual practice." It is in the contract or it does not happen.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_SIGNALS.map((signal) => (
              <div
                key={signal.title}
                className="group p-6 bg-paper border border-line/50 rounded-2xl hover:border-burgundy/30 hover:shadow-card-hover card-lift transition-all duration-300"
              >
                <div className="size-12 rounded-2xl bg-maroon/10 flex items-center justify-center text-maroon mb-4 group-hover:bg-maroon/15 transition-colors">
                  <signal.icon className="size-5" />
                </div>
                <h3 className="font-display text-lg text-maroon">{signal.title}</h3>
                <p className="mt-2 text-sm text-ink/60 leading-relaxed">{signal.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process walkthrough ── */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 md:py-24">
        <div className="max-w-3xl mb-12">
          <Badge tone="maroon" className="mb-4">The process</Badge>
          <h2 className="font-display text-3xl md:text-4xl text-maroon">
            From first call to keys. Eight steps.
          </h2>
          <p className="mt-4 text-ink/70 text-lg">
            You do not need to be in Kenya for any of this. We adapt to your time zone, your schedule, and your communication preferences.
          </p>
        </div>

        <div className="space-y-6">
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.num}
              className="group relative p-6 md:p-8 bg-paper border border-line/50 rounded-2xl hover:border-burgundy/30 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-maroon to-burgundy flex items-center justify-center text-white text-lg font-bold shrink-0 group-hover:scale-105 transition-transform">
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="size-5 text-maroon" />
                    <h3 className="font-display text-xl text-maroon">{step.title}</h3>
                  </div>
                  <p className="text-ink/70">{step.desc}</p>
                  <p className="mt-2 text-sm text-ink/50 italic">{step.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Communication protocol ── */}
      <section className="bg-stone/60 py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mb-12">
            <Badge tone="gold" className="mb-4">Communication</Badge>
            <h2 className="font-display text-3xl md:text-4xl text-maroon">
              You will never be guessing.
            </h2>
            <p className="mt-4 text-ink/70 text-lg">
              We communicate on a schedule, not when something goes wrong. Every channel has a purpose. Every decision is documented.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {COMMUNICATION_CHANNELS.map((ch) => (
              <div
                key={ch.name}
                className="p-6 bg-paper border border-line/50 rounded-2xl hover:border-burgundy/30 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon">
                    <ch.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-maroon">{ch.name}</h3>
                    <p className="text-xs text-muted">{ch.frequency} · {ch.format}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {ch.contents.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink/70">
                      <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-maroon/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Payment protection ── */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <Badge tone="maroon" className="mb-4">Payment protection</Badge>
            <h2 className="font-display text-3xl md:text-4xl text-maroon">
              Pay for done work. Not promises.
            </h2>
            <p className="mt-4 text-ink/70 text-lg">
              Every payment is certified against verified progress. You never pay for work that has not been completed and inspected. This is contractual, not a favour.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { phase: "Design & documentation", pay: "Fixed fee, 2-3 installments as deliverables complete", protect: "Each payment tied to a specific deliverable" },
              { phase: "Statutory approvals", pay: "Fixed fee per application", protect: "Payment after approval is obtained, not before" },
              { phase: "Construction", pay: "Monthly or milestone-based, certified by PM", protect: "Site inspection + photos + delivery notes before payment" },
              { phase: "Variations", pay: "Priced and approved before work starts", protect: "Written variation order signed by both parties" },
              { phase: "Retention", pay: "5-10% retained until defects liability ends", protect: "Ensures contractor returns to fix any defects" },
            ].map((item) => (
              <div key={item.phase} className="p-5 bg-paper border border-line/50 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-lg bg-maroon/10 flex items-center justify-center text-maroon shrink-0 mt-0.5">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-maroon">{item.phase}</p>
                    <p className="text-sm text-ink/60 mt-1">{item.pay}</p>
                    <p className="text-xs text-maroon/70 mt-1 italic">{item.protect}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we will NOT do ── */}
      <section className="bg-stone/60 py-16 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl">
            <Badge tone="maroon" className="mb-4">Transparency</Badge>
            <h2 className="font-display text-3xl md:text-4xl text-maroon">
              What we will not do.
            </h2>
            <p className="mt-4 text-ink/70 text-lg">
              If any of these happen, you have the wrong builder. Not us.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {[
              "Ask for large upfront deposits before construction starts",
              "Give you a lump sum without a Bill of Quantities",
              "Communicate only via WhatsApp with no written record",
              "Start work without signed drawings and a locked scope",
              "Refuse to let you see the site or send photographs",
              "Hide costs in vague line items or mysterious markups",
              "Allow the contractor to bill for work not yet done",
              "Ignore your questions or go silent for weeks",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-4 bg-paper border border-line/50 rounded-xl">
                <CheckCircle2 className="size-5 shrink-0 text-maroon" />
                <span className="text-sm text-ink/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 md:py-24">
        <div className="max-w-3xl mb-12">
          <Badge tone="gold" className="mb-4">Common questions</Badge>
          <h2 className="font-display text-3xl md:text-4xl text-maroon">
            What diaspora clients ask.
          </h2>
        </div>

        <div className="max-w-3xl space-y-4">
          {[
            { q: "Can I build from abroad?", a: "Yes. Many of our clients manage projects from the UK, Gulf, US and elsewhere. We provide scheduled video calls, photo timelines, written decision logs and a named site contact. We recommend at least one site visit at structural stage." },
            { q: "How do I know the work is really being done?", a: "Weekly written reports with photographs. Milestone inspection reports. Independent site supervisor. We do not rely on the contractor's word — we verify." },
            { q: "How do I protect my money?", a: "Milestone-based payments. You pay for completed work, not promises. Each payment is certified against verified progress with photographic evidence. No advance payments for unstarted work." },
            { q: "What if I can't visit?", a: "You don't need to be on site. Our weekly reports, photo timelines and video calls give you visibility. When you do visit, we prepare a structured site walk so your trip is productive." },
            { q: "How do you handle time zones?", a: "We schedule calls at times that work for you. EAT morning = UK early morning, US late night. EAT evening = UK afternoon, US morning. We adapt to your schedule." },
            { q: "What about NCA and NEMA?", a: "We handle all statutory registrations and approvals. NCA registration, NEMA application (if required), county building approval. You don't need to navigate these yourself." },
            { q: "How do I verify the land is legitimate?", a: "Before we start, we conduct or commission: official search at Ministry of Lands, encumbrance check, surveyor verification, neighbour check, and county status. You get a full due diligence report." },
            { q: "Can I choose my own contractor?", a: "Yes. We manage tenders and evaluate bids. You choose from pre-qualified contractors based on merit, not just price. We recommend against choosing the cheapest bid." },
          ].map((faq) => (
            <details key={faq.q} className="group p-6 bg-paper border border-line/50 rounded-2xl hover:border-burgundy/30 transition-colors">
              <summary className="font-display text-lg text-maroon cursor-pointer list-none flex items-center justify-between gap-4">
                {faq.q}
                <span className="text-ink/30 group-open:rotate-180 transition-transform shrink-0">
                  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                </span>
              </summary>
              <p className="mt-4 text-ink/70 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <CtaBand
        title="Ready to build with confidence?"
        body="Tell us about your project. We will give you an indicative range, a realistic programme, and a system that keeps you informed — not guessing."
        ctaTo={{ to: "/start", search: { from: "diaspora" } }}
        ctaLabel="Start a project"
      />
    </main>
  );
}
