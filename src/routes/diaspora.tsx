import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type KeyboardEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Eye,
  FileText,
  Lock,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CtaBand } from "@/components/page-hero";
import { PortalPreview } from "@/components/portal-preview";
import { PROJECTS } from "@/lib/site";
import {
  ABROAD_CHANNELS,
  ABROAD_FAQS,
  ABROAD_FEATURES,
  ABROAD_INCLUDED,
  ABROAD_NEVER,
  ABROAD_PAYMENT_PHASES,
  ABROAD_PROCESS,
  ABROAD_RED_FLAGS,
  abroadService,
} from "@/lib/diaspora/abroad";
import { MYHARDWARE_URL, SERVICES } from "@/lib/site";

export const Route = createFileRoute("/diaspora")({
  component: DiasporaPage,
  head: () => ({
    meta: [
      { title: "Building from Abroad — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Build in Kenya from anywhere in the world. ATRO coordinates design and construction with milestone payments, a private project portal, weekly reports, independent verification and a named project manager.",
      },
    ],
  }),
});

const INCLUDED_ICON: Record<string, typeof BadgeCheck> = {
  registered: BadgeCheck,
  office: Building,
  boq: FileText,
  milestone: CreditCard,
  report: Camera,
  manager: User,
  verification: Eye,
  openbook: Lock,
};

const PROCESS_ICON: Record<string, typeof Phone> = {
  phone: Phone,
  pin: MapPin,
  clipboard: ClipboardCheck,
  file: FileText,
  lock: Lock,
  camera: Camera,
  card: CreditCard,
  check: CheckCircle2,
};

function DiasporaProjectEvidence() {
  const project = PROJECTS.find((item) => item.slug === "sigona-villa");
  if (!project) return null;

  return (
    <section className="border-b border-ink/10 bg-[#f5efe7] py-12 md:py-16">
      <div className="mx-auto grid max-w-[1400px] gap-7 px-6 sm:px-8 md:px-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-16">
        <div>
          <Badge tone="gold" className="mb-3">
            Design to site
          </Badge>
          <h2 className="font-display text-[2rem] leading-none text-maroon md:text-[2.8rem]">
            See the plan beside the progress.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-base">
            {project.name} · {project.location}. Compare the design intent with a dated
            foundation-stage site record from the same project.
          </p>
          <Link
            to="/projects/$slug"
            params={{ slug: project.slug }}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-burgundy underline decoration-gold underline-offset-4"
          >
            View the project story
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <figure className="overflow-hidden rounded-2xl bg-white">
            <img
              src="/catalog/images/sigona-villa-front-view.webp"
              alt="Design view of Sigona Villa"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            <figcaption className="p-3 text-[10px] font-medium text-ink/65 sm:text-xs">
              Design intent
            </figcaption>
          </figure>
          <figure className="overflow-hidden rounded-2xl bg-white">
            <img
              src="/catalog/images/sigona-villa-foundation-progress-01.webp"
              alt="Dated foundation-stage site progress at Sigona Villa"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            <figcaption className="p-3 text-[10px] font-medium text-ink/65 sm:text-xs">
              Foundation-stage record · 23 Sep 2026
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function DiasporaJourney() {
  return (
    <section id="process" className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-3xl">
          <Badge tone="maroon" className="mb-3">
            From your time zone to the site
          </Badge>
          <h2 className="font-display text-[2.1rem] leading-none text-maroon md:text-[2.8rem]">
            A decision trail you can follow from abroad.
          </h2>
        </div>

        <ol className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "01",
              "Agree the scope",
              "Brief, site and land checks establish what the project needs.",
            ],
            [
              "02",
              "Review the plan",
              "Drawings, quantities and current quotations inform the next decision.",
            ],
            [
              "03",
              "See verified progress",
              "Written updates and site evidence show what has happened.",
            ],
            [
              "04",
              "Approve and pay",
              "Recorded approvals and certified work connect decisions to payments.",
            ],
          ].map(([number, title, detail]) => (
            <li key={number} className="rounded-2xl border border-ink/10 bg-[#fbf8f3] p-4 sm:p-5">
              <span className="font-display text-2xl text-gold">{number}</span>
              <h3 className="mt-2 font-display text-lg text-maroon">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/65 sm:text-sm">{detail}</p>
            </li>
          ))}
        </ol>

        <details className="group mt-4 rounded-2xl border border-ink/10 bg-[#fbf8f3] px-5">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-maroon marker:hidden">
            Explore the detailed eight-step process
            <span
              className="text-xl text-gold transition-transform group-open:rotate-45"
              aria-hidden
            >
              +
            </span>
          </summary>
          <ol className="space-y-3 border-t border-ink/10 py-5">
            {ABROAD_PROCESS.map((step) => {
              const Icon = PROCESS_ICON[step.icon] ?? ClipboardCheck;
              return (
                <li key={step.num} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-maroon text-sm font-bold text-white">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 font-medium text-maroon">
                      <Icon className="size-4" aria-hidden />
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink/65">{step.desc}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/55">{step.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </details>
      </div>
    </section>
  );
}

type AssuranceStage = "progress" | "costs" | "approval" | "payment";

const ASSURANCE_STAGES: {
  id: AssuranceStage;
  label: string;
  summary: string;
  safeguards: string[];
}[] = [
  {
    id: "progress",
    label: "See progress",
    summary:
      "A named project manager, site evidence and a regular written record keep you close to what is happening.",
    safeguards: ["Weekly written reports", "Named project manager", "Independent verification"],
  },
  {
    id: "costs",
    label: "Review costs",
    summary:
      "Understand the measured scope, pricing basis and assumptions before construction is contracted.",
    safeguards: ["BOQ before construction", "Open-book costing"],
  },
  {
    id: "approval",
    label: "Approve work",
    summary: "Keep professional responsibility, agreed scope and project decisions documented.",
    safeguards: ["Registered professionals", "Physical office in Nairobi"],
  },
  {
    id: "payment",
    label: "Pay certified stages",
    summary:
      "Payments are tied to agreed deliverables, inspection and written approval—not promises.",
    safeguards: ["Milestone-based payments"],
  },
];

function DiasporaAssurance() {
  const [activeStage, setActiveStage] = useState<AssuranceStage>("progress");
  const selectedStage = ASSURANCE_STAGES.find((stage) => stage.id === activeStage)!;
  const selectedIndex = ASSURANCE_STAGES.findIndex((stage) => stage.id === activeStage);

  function selectStage(stage: AssuranceStage) {
    setActiveStage(stage);
  }

  function handleStageKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % ASSURANCE_STAGES.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + ASSURANCE_STAGES.length) % ASSURANCE_STAGES.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = ASSURANCE_STAGES.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      const next = ASSURANCE_STAGES[nextIndex];
      setActiveStage(next.id);
      document.getElementById(`diaspora-assurance-tab-${next.id}`)?.focus();
    }
  }

  return (
    <section className="bg-stone/50 py-12 md:py-16">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-3xl">
          <Badge tone="gold" className="mb-3">
            How remote oversight works
          </Badge>
          <h2 className="font-display text-[2.1rem] leading-none text-maroon md:text-[2.8rem]">
            From site evidence to an informed payment.
          </h2>
        </div>

        <div className="mt-7 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-paper shadow-[0_24px_70px_-45px_rgba(60,5,8,0.35)]">
          <div
            role="tablist"
            aria-label="Project oversight and payment steps"
            className="grid grid-cols-2 gap-1 border-b border-ink/10 p-2 sm:grid-cols-4 sm:p-3"
          >
            {ASSURANCE_STAGES.map((stage, index) => (
              <button
                key={stage.id}
                id={`diaspora-assurance-tab-${stage.id}`}
                type="button"
                role="tab"
                aria-selected={activeStage === stage.id}
                aria-controls="diaspora-assurance-panel"
                tabIndex={activeStage === stage.id ? 0 : -1}
                onClick={() => selectStage(stage.id)}
                onKeyDown={(event) => handleStageKeyDown(event, index)}
                className={`flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors sm:min-h-14 sm:px-4 sm:text-sm ${
                  activeStage === stage.id
                    ? "bg-maroon text-paper"
                    : "text-ink/60 hover:bg-white hover:text-maroon"
                }`}
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] ${
                    activeStage === stage.id ? "bg-gold text-maroon" : "bg-maroon/8 text-burgundy"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {stage.label}
              </button>
            ))}
          </div>

          <div
            id="diaspora-assurance-panel"
            role="tabpanel"
            aria-labelledby={`diaspora-assurance-tab-${activeStage}`}
            tabIndex={0}
            className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:p-9"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-burgundy">
                Step {String(selectedIndex + 1).padStart(2, "0")} of 04
              </p>
              <h3 className="mt-2 font-display text-2xl text-maroon sm:text-3xl">
                {selectedStage.label}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65 sm:text-base">
                {selectedStage.summary}
              </p>
            </div>

            {activeStage === "payment" ? (
              <ol className="grid gap-2 sm:grid-cols-2">
                {ABROAD_PAYMENT_PHASES.map((item, index) => (
                  <li key={item.phase} className="rounded-xl border border-ink/10 bg-white p-4">
                    <span className="text-[10px] font-bold tracking-[0.14em] text-gold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h4 className="mt-1 text-sm font-medium text-maroon">{item.phase}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-ink/65">{item.pay}</p>
                    <p className="mt-2 border-t border-ink/8 pt-2 text-[11px] leading-relaxed text-ink/55">
                      {item.protect}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedStage.safeguards.map((title) => {
                  const safeguard = ABROAD_INCLUDED.find((item) => item.title === title);
                  if (!safeguard) return null;
                  const Icon = INCLUDED_ICON[safeguard.icon] ?? BadgeCheck;
                  return (
                    <article key={title} className="rounded-xl border border-ink/10 bg-white p-4">
                      <Icon className="size-5 text-maroon" aria-hidden />
                      <h4 className="mt-3 text-sm font-medium text-maroon">{safeguard.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-ink/60">{safeguard.desc}</p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <details className="group mt-4 rounded-2xl border border-ink/10 bg-paper px-5">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-maroon marker:hidden">
            See all safeguards, communication standards and red flags
            <span
              className="text-xl text-gold transition-transform group-open:rotate-45"
              aria-hidden
            >
              +
            </span>
          </summary>
          <div className="border-t border-ink/10 py-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ABROAD_INCLUDED.map((signal) => {
                const Icon = INCLUDED_ICON[signal.icon] ?? BadgeCheck;
                return (
                  <article
                    key={signal.title}
                    className="rounded-xl border border-ink/10 bg-white p-3 sm:p-4"
                  >
                    <Icon className="size-4 text-maroon sm:size-5" aria-hidden />
                    <h3 className="mt-2 text-xs font-medium leading-tight text-maroon sm:text-base">
                      {signal.title}
                    </h3>
                    <p className="mt-1 text-[10px] leading-snug text-ink/65 sm:text-sm sm:leading-relaxed">
                      {signal.desc}
                    </p>
                  </article>
                );
              })}
            </div>

            <h3 className="mt-7 font-display text-xl text-maroon">How we stay in touch</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ABROAD_CHANNELS.map((channel) => (
                <article
                  key={channel.name}
                  className="rounded-xl border border-ink/10 bg-white p-3 sm:p-4"
                >
                  <h4 className="text-xs font-medium text-maroon sm:text-base">{channel.name}</h4>
                  <p className="text-[9px] leading-snug text-ink/55 sm:text-xs">
                    {channel.frequency} · {channel.format}
                  </p>
                  <p className="mt-2 text-[10px] leading-snug text-ink/65 sm:text-sm sm:leading-relaxed">
                    {channel.contents.join(" · ")}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-display text-xl text-maroon">Warning signs to check</h3>
                <ul className="mt-3 space-y-2">
                  {ABROAD_RED_FLAGS.map((flag) => (
                    <li key={flag} className="flex items-start gap-2 text-sm text-ink/70">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-burgundy" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-xl text-maroon">What we will not do</h3>
                <ul className="mt-3 space-y-2">
                  {ABROAD_NEVER.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink/70">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-maroon" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}

function DiasporaPage() {
  const service = abroadService(SERVICES);

  return (
    <main className="pt-20 pb-0 md:pt-[4.5rem]">
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden bg-maroon text-paper">
        <img
          src="/catalog/images/sigona-villa-front-view.webp"
          alt=""
          className="absolute inset-0 size-full object-cover object-[58%_center] lg:left-auto lg:w-[62%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(60,5,8,0.98)_0%,rgba(60,5,8,0.94)_34%,rgba(60,5,8,0.78)_62%,rgba(60,5,8,0.48)_100%)]" />
        <div className="absolute inset-0 bg-maroon/20 lg:bg-transparent" />

        <div className="relative mx-auto max-w-[1400px] px-6 py-14 sm:px-8 md:px-12 md:py-18 lg:px-16">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-light sm:text-xs">
            Nairobi, Kenya <span className="mx-2 text-paper/55">/</span> For clients worldwide
          </p>

          <h1 className="max-w-4xl font-display text-[2.2rem] leading-[0.9] tracking-[-0.05em] text-paper sm:text-[2.9rem] md:text-[3.7rem]">
            Build your home.
            <br />
            <span className="text-gold">Without the guesswork.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper/75 sm:text-lg">
            Wherever you live, plan and build in Kenya with a local team coordinating design, costs
            and construction—and clear project updates on your time.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button asChild variant="gold" className="min-h-12 px-6">
              <Link to="/start" search={{ from: "diaspora" }}>
                Start a project
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-12 border-paper/25 px-6 text-paper hover:bg-paper/10"
            >
              <a href="#process">
                How it works
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-paper/15 pt-5 text-xs text-paper/65">
            <span>Weekly written updates</span>
            <span className="hidden size-1 rounded-full bg-gold sm:block" />
            <span>Payments tied to verified work</span>
            <span className="hidden size-1 rounded-full bg-gold sm:block" />
            <span>One project record, wherever you are</span>
          </div>
        </div>
      </section>

      <DiasporaProjectEvidence />
      <DiasporaJourney />
      <PortalPreview experience="diaspora" />

      {/* ── Service overview ── */}
      {service ? (
        <section className="border-b border-ink/10 bg-[#f5efe7] py-10 md:py-12">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                One team, from design to handover
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink/70 md:text-base">
                {service.lede}
              </p>
            </div>
            <Link
              to="/services"
              search={{ service: service.slug }}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-maroon underline decoration-gold underline-offset-4 hover:text-burgundy"
            >
              See what is included
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      ) : null}

      {/* ── What you actually get (working features) ── */}
      <section className="bg-stone/50 py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl">
            <Badge tone="maroon" className="mb-3">
              Useful tools
            </Badge>
            <h2 className="font-display text-[2.2rem] leading-none text-maroon md:text-[2.8rem]">
              Practical support before the project starts.
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 lg:grid-cols-3">
            {ABROAD_FEATURES.filter((f) => f.to !== "/portal/diaspora").map((f) => {
              const Icon =
                f.to === "/portal/diaspora"
                  ? ClipboardCheck
                  : f.to === "/verify"
                    ? BadgeCheck
                    : f.to === "/scam-check"
                      ? AlertTriangle
                      : f.to === "/guides/journey"
                        ? Eye
                        : f.to === "/guides"
                          ? FileText
                          : CreditCard;
              const accent = f.to === "/portal/diaspora";
              return (
                <Link
                  key={f.to}
                  to={f.to}
                  className={`group flex flex-col rounded-xl border p-3 transition-colors sm:rounded-2xl sm:p-5 ${
                    accent
                      ? "border-gold/60 bg-maroon text-paper shadow-[0_12px_50px_rgb(60_5_8/0.25)]"
                      : "border-ink/10 bg-white hover:border-gold/60 hover:shadow-[0_10px_40px_rgb(201_146_79/0.16)]"
                  }`}
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl ${
                      accent ? "bg-gold text-maroon" : "bg-maroon/10 text-maroon"
                    }`}
                  >
                    <Icon className="size-4 sm:size-5" />
                  </span>
                  <p
                    className={`mt-3 text-[8px] font-bold uppercase tracking-[0.1em] sm:mt-4 sm:text-[10px] sm:tracking-[0.16em] ${
                      accent ? "text-gold" : "text-gold"
                    }`}
                  >
                    {f.kicker}
                  </p>
                  <h3
                    className={`mt-1 font-display text-sm leading-tight sm:text-xl ${accent ? "text-paper" : "text-maroon"}`}
                  >
                    {f.title}
                  </h3>
                  <p
                    className={`mt-2 flex-1 line-clamp-3 text-[10px] leading-snug sm:text-sm sm:leading-relaxed ${
                      accent ? "text-paper/75" : "text-ink/65"
                    }`}
                  >
                    {f.body}
                  </p>
                  <span
                    className={`mt-3 inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.08em] font-bold sm:mt-4 sm:gap-2 sm:text-[11px] sm:tracking-[0.16em] ${
                      accent ? "text-gold" : "text-burgundy"
                    } group-hover:gap-3 transition-all`}
                  >
                    {f.cta}
                    {f.requiresSignIn ? (
                      <span className="rounded-full border border-current px-2 py-0.5 text-[8px] leading-none">
                        Sign in
                      </span>
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-[#f6efe7] py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col gap-5 rounded-[2rem] border border-[#d8c9ad] bg-[#f3ead9] p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy">
                Materials support
              </p>
              <h2 className="mt-2 font-display text-[2rem] leading-none text-maroon md:text-[2.6rem]">
                Need product comparison while you are abroad?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/70 md:text-base">
                MyHardware helps with supplier supporting materials and product checks while ATRO
                handles design, planning and delivery oversight in Kenya.
              </p>
            </div>
            <a
              href={MYHARDWARE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-maroon px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-[#5b1c26]"
            >
              Explore MyHardware
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <DiasporaAssurance />

      {/* ── FAQs ── */}
      <section className="mx-auto max-w-[1400px] px-6 py-12 sm:px-8 md:px-12 md:py-16 lg:px-16">
        <div className="max-w-3xl mb-6">
          <Badge tone="gold" className="mb-3">
            Common questions
          </Badge>
          <h2 className="font-display text-3xl text-maroon md:text-4xl">
            What diaspora clients ask.
          </h2>
        </div>

        <div className="max-w-3xl space-y-2">
          {ABROAD_FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-ink/10 bg-paper px-4">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-medium text-maroon marker:hidden">
                {faq.q}
                <span
                  className="shrink-0 text-xl text-gold transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="border-t border-ink/10 py-4 text-sm leading-relaxed text-ink/70">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <CtaBand
        title="Planning a build in Kenya?"
        body="Share the brief and we will tell you the next practical step."
        ctaTo={{ to: "/start", search: { from: "diaspora" } }}
        ctaLabel="Start a project"
      />
    </main>
  );
}
