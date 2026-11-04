import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CtaBand } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { useRevealOnScroll } from "@/hooks/use-reveal";
import { SplitText } from "@/components/scroll-effects";
import { COMPANY, featuredProjects, SERVICES, SERVICE_CATEGORIES, ZONES } from "@/lib/site";
import { useSiteStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      {
        title: "ATRO Design & Construction — Smart design and practical building",
      },
      {
        name: "description",
        content: COMPANY.lede,
      },
    ],
  }),
});

function Home() {
  const diaspora = useSiteStore((s) => s.diasporaMode);
  const featured = featuredProjects();

  return (
    <>
      <Hero />
      <ProjectSnapshot />
      {diaspora ? <DiasporaBanner /> : null}
      <QuickStart />
      <HowWeWork />
      <Solution />
      <Proof projects={featured} />
      <Services />
      <HardwarePartner />
      <Tools />
      <CtaBand />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "GeneralContractor",
            name: COMPANY.name,
            url: "https://atro.ke",
            email: COMPANY.email,
            telephone: COMPANY.phoneTel,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Nairobi",
              addressCountry: "KE",
            },
            areaServed: ZONES.map((z) => z.name),
            description: COMPANY.lede,
          }),
        }}
      />
    </>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden bg-maroon md:min-h-[76svh]">
      <img
        src="/catalog/images/hero.webp"
        alt=""
        className="absolute inset-0 size-full object-cover object-[62%_center]"
        fetchPriority="high"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,7,10,0.92)_0%,rgba(34,6,11,0.86)_34%,rgba(34,6,11,0.65)_58%,rgba(34,6,11,0.4)_100%)]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(145,111,63,0.14),transparent_32%)]" aria-hidden />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 pt-28 pb-16 sm:py-16 sm:px-8 md:px-12 lg:px-16">
        <div className="grid items-end gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div className="max-w-[760px]">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-paper drop-shadow-[0_1px_5px_rgba(0,0,0,0.95)] sm:text-xs">
              Nairobi, Kenya <span className="mx-2 text-paper/75">/</span> Design · Cost planning ·
              Construction
            </p>

            <h1 className="max-w-[620px] font-display text-[2.2rem] leading-[0.9] tracking-[-0.05em] text-white sm:text-[2.7rem] md:text-[3.2rem] lg:text-[3.7rem]">
              Design, cost planning and construction. One team.
            </h1>

            <p className="mt-5 max-w-[520px] text-base leading-relaxed text-white/80 sm:text-lg">
              We coordinate homes, offices and institutional projects across Kenya from the first plan to handover—with clear scope, practical costs and progress you can follow.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/start"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-maroon transition-all duration-300 hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Tell us about your project
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                to="/projects"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-white transition-all duration-300 hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Explore our work
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/70">
              Already working with us?{" "}
              <Link
                to="/login"
                className="font-medium text-white underline decoration-gold/80 underline-offset-4 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Sign in to your project
              </Link>
            </p>
          </div>

          <div className="hidden lg:block">
            <div className="ml-auto h-[420px] w-full max-w-[440px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-[2px]">
              <img
                src="/catalog/images/hero.webp"
                alt=""
                className="h-full w-full object-cover object-center opacity-90"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectSnapshot() {
  return (
    <section className="bg-[#f5efe7] px-6 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 inline-flex items-center rounded-full border border-[#c7a478]/60 bg-[#f3ebdf] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-burgundy">
          Your projects
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-display text-[1.8rem] leading-[0.98] tracking-[-0.04em] text-maroon sm:text-[2.2rem] md:text-[2.8rem]">
            This is where your project stands.
          </h2>

          <Link
            to="/portal"
            className="inline-flex items-center justify-center rounded-xl bg-[#410f18] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors hover:bg-[#5b1c26]"
          >
            Open the portal <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-[#d6cab6] bg-[#f3efe8] p-4 sm:p-5 lg:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-burgundy">ATRO-2403</p>
              <h3 className="mt-3 font-display text-[1.5rem] leading-none text-maroon sm:text-[2rem] md:text-[2.8rem]">Feasibility and cost plan</h3>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-ink/70">Current focus:</p>
              <p className="text-sm font-medium text-ink">Cost options and next steps</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2e2d2d]/40 bg-transparent px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-maroon transition-colors hover:border-maroon hover:bg-white/20"
            >
              Open in the portal <ArrowRight className="size-4" />
            </button>

            <div className="text-sm text-ink/70">
              Weekly written updates • Payments tied to verified work • One project record, wherever you are
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Quick Start ─── */
function QuickStart() {
  const steps = [
    {
      title: "I am starting a project",
      text: "From first brief to scope, costs and next decisions.",
      to: "/start",
    },
    {
      title: "I am building from abroad",
      text: "Remote milestones, approvals and site visibility from Nairobi.",
      to: "/diaspora",
    },
    {
      title: "I want a planning check",
      text: "Check feasibility, constraints and likely project shape early.",
      to: "/tools",
    },
  ];

  return (
    <section className="bg-[#f8f2ea] py-10 sm:py-12 md:py-14">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="mb-6 max-w-3xl sm:mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-burgundy">Start here</p>
          <h2 className="mt-3 font-display text-[1.8rem] text-maroon sm:text-[2.2rem] md:text-[2.9rem]">Choose the path that fits your project.</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {steps.map((step) => (
            <Link
              key={step.title}
              to={step.to}
              className="group rounded-xl border border-[#d6cab6] bg-white p-3 text-left shadow-[0_20px_40px_-30px_rgba(60,5,8,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_28px_60px_-28px_rgba(60,5,8,0.24)] sm:rounded-[1.4rem] sm:p-5 lg:p-6"
            >
              <div className="mb-3 flex items-center justify-between gap-2 sm:mb-5 sm:gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-gold/12 text-xs font-semibold text-maroon sm:size-10 sm:text-sm">
                  0{steps.indexOf(step) + 1}
                </span>
                <ArrowRight className="size-4 text-maroon transition-transform duration-300 group-hover:translate-x-1" />
              </div>
              <h3 className="font-display text-sm leading-tight text-maroon sm:text-2xl sm:leading-normal">{step.title}</h3>
              <p className="mt-2 text-[10px] leading-snug text-ink/70 sm:mt-2.5 sm:text-sm sm:leading-relaxed">{step.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowWeWork() {
  const steps = [
    {
      number: "01",
      title: "Scope the brief",
      desc: "We define the project, the site conditions and the questions that matter before design starts.",
    },
    {
      number: "02",
      title: "Price the direction",
      desc: "We align drawings, quantities and cost thinking so the project has a clear planning base.",
    },
    {
      number: "03",
      title: "Manage the build",
      desc: "Site progress, approvals and day-to-day decisions stay visible to the client and the team.",
    },
    {
      number: "04",
      title: "Close the job",
      desc: "Final handover is backed by records, updates and a clear trail of what was agreed and delivered.",
    },
  ];

  return (
    <section className="bg-[#f5efe7] py-10 sm:py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="mb-6 max-w-3xl sm:mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-burgundy">How ATRO works</p>
          <h2 className="mt-3 font-display text-[1.8rem] text-maroon sm:text-[2.2rem] md:text-[2.9rem]">
            Clear decisions. Measured progress. One project record.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {steps.map((step) => (
            <article key={step.number} className="rounded-xl border border-[#d7cab7] bg-white p-3 shadow-[0_18px_30px_-28px_rgba(60,5,8,0.22)] sm:rounded-[1.4rem] sm:p-5">
              <div className="mb-2 flex items-center justify-between sm:mb-3">
                <span className="font-display text-2xl text-gold sm:text-3xl">{step.number}</span>
                <span className="size-6 rounded-full border border-maroon/15 bg-maroon/5 sm:size-8" aria-hidden />
              </div>
              <h3 className="font-display text-sm leading-tight text-maroon sm:text-[1.7rem] sm:leading-none">{step.title}</h3>
              <p className="mt-2 text-[10px] leading-snug text-ink/70 sm:mt-2.5 sm:text-sm sm:leading-relaxed">{step.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Solution ─── */
function Solution() {
  const storyCards = [
    {
      number: "01",
      title: "Private homes",
      desc: "Family homes, compounds and custom living spaces planned to feel calm, practical and built for everyday life.",
    },
    {
      number: "02",
      title: "Commercial spaces",
      desc: "Shops, workspaces and mixed-use developments shaped around how the business actually runs.",
    },
    {
      number: "03",
      title: "Institutional projects",
      desc: "Schools, facilities and larger projects where quality, process and detail matter just as much as speed.",
    },
  ];

  return (
    <section aria-labelledby="approach-heading" className="bg-[#110d0e] py-10 text-paper sm:py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="mb-8 max-w-3xl sm:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">What we build</p>
          <h2
            id="approach-heading"
            className="mt-3 font-display text-[1.8rem] leading-[0.96] tracking-[-0.04em] text-white sm:text-[2.2rem] md:text-[2.9rem]"
          >
            Built around real use, not vague ideas.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {storyCards.map((card) => (
            <article key={card.number} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:rounded-[1.4rem] sm:p-5 lg:p-6">
              <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4 sm:gap-4">
                <span className="font-display text-sm font-semibold text-gold sm:text-lg">{card.number}</span>
                <span className="size-6 rounded-full border border-white/10 bg-white/5 sm:size-8" aria-hidden />
              </div>
              <h3 className="font-display text-sm leading-tight text-white sm:text-2xl">{card.title}</h3>
              <p className="mt-2 line-clamp-3 text-[10px] leading-snug text-white/70 sm:mt-2.5 sm:text-sm sm:leading-relaxed">{card.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            We work from first sketch to final handover — with drawings, quantities, timelines and site decisions aligned in one flow.
          </p>
          <Link
            to="/services"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-gold underline decoration-gold/70 underline-offset-4 transition-colors hover:text-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Explore our services
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Proof ─── */
function Proof({ projects }: { projects: ReturnType<typeof featuredProjects> }) {
  const { ref, revealed } = useRevealOnScroll();

  return (
    <section className="bg-[#f5efe7] py-16 md:py-20">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div ref={ref} className={cn("reveal-on-scroll mb-12 flex items-end justify-between gap-6", revealed && "revealed")}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-burgundy">Selected work</p>
            <SplitText
              text="Evidence, not slogans."
              tag="h2"
              className="mt-3 font-display text-[2.2rem] text-maroon md:text-[2.9rem]"
              delay={100}
            />
          </div>
          <Link
            to="/projects"
            className="hidden items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-burgundy hover:text-maroon sm:inline-flex"
          >
            All projects <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 stagger">
          {projects.slice(0, 3).map((p, i) => (
            <Reveal key={p.slug} style={{ transitionDelay: `${i * 100}ms` }}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center sm:text-left">
          <Button asChild variant="outline" className="rounded-full border-maroon/30 bg-transparent text-maroon hover:bg-maroon hover:text-paper">
            <Link to="/projects">
              View all projects
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─── Services ─── */
function Services() {
  const { ref, revealed } = useRevealOnScroll();

  const featuredServices = SERVICE_CATEGORIES.flatMap((category) => {
    const service = SERVICES.find((item) => item.category === category.id);
    return service ? [{ category, service }] : [];
  });

  return (
    <section className="bg-[#0f0d0e] py-16 text-paper md:py-20">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div
          ref={ref}
          className={cn(
            "reveal-on-scroll mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end",
            revealed && "revealed",
          )}
        >
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">What we do</p>
            <SplitText
              text="One team, from first drawing to final handover."
              tag="h2"
              className="mt-3 font-display text-[2.2rem] text-white md:text-[2.9rem]"
              delay={100}
            />
          </div>
          <Link
            to="/services"
            className="inline-flex shrink-0 items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-gold hover:text-gold-light"
          >
            Explore all services <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 stagger">
          {featuredServices.map(({ category, service }, i) => (
            <Reveal key={category.id} style={{ transitionDelay: `${i * 80}ms` }}>
              <Link
                to="/services/$slug"
                params={{ slug: service.slug }}
                className="group block h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/3 transition-all duration-300 hover:border-gold/35 hover:shadow-[0_30px_70px_rgba(0,0,0,0.2)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-stone">
                  <img
                    src={service.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120d0e]/90 via-[#120d0e]/10 to-transparent" />
                  <span className="absolute bottom-4 left-5 text-[11px] uppercase tracking-[0.16em] text-white/90">
                    {category.title}
                  </span>
                  <span className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-maroon transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
                <div className="p-3 sm:p-6">
                  <h3 className="font-display text-sm leading-tight text-white transition-colors duration-300 group-hover:text-gold sm:text-2xl">
                    {service.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[10px] leading-snug text-white/70 sm:text-sm sm:leading-relaxed">{service.lede}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.08em] text-gold group-hover:text-gold-light sm:mt-5 sm:text-[11px] sm:tracking-[0.14em]">
                    Explore this service
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Hardware Partner ─── */
function HardwarePartner() {
  const items = [
    "Compare materials and product options",
    "Check local sourcing and quantity planning",
    "Support faster purchasing decisions before site execution",
  ];

  return (
    <section className="bg-[#f3ede5] py-16 md:py-20">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="grid items-center gap-8 rounded-[2rem] border border-[#d9cab4] bg-[#f9f5ee] p-6 shadow-[0_18px_40px_-28px_rgba(60,5,8,0.22)] sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-burgundy">Sister platform</p>
            <h2 className="mt-3 font-display text-[2.2rem] text-maroon md:text-[2.9rem]">
              Need materials and supply support? MyHardware can help.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70 md:text-lg">
              ATRO leads the design, planning and project delivery journey. MyHardware is a complementary sourcing platform for clients who want a simpler route to product comparison, material checks and hardware purchasing support.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://myhardware.co.ke"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-maroon px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-[#5b1c26]"
              >
                Visit MyHardware
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
              <Link
                to="/services"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-maroon/25 bg-transparent px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-maroon transition-colors hover:border-maroon hover:bg-white/50"
              >
                See our services
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#ceb892] bg-[#f1e7d9] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-[#d8c49b] pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-burgundy">MyHardware</p>
                <p className="mt-2 font-display text-2xl text-maroon md:text-3xl">Materials, sourcing & options</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-full bg-white text-maroon shadow-sm">
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </div>

            <ul className="mt-5 space-y-4">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink/75 sm:text-base">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[11px] font-semibold text-maroon">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Tools ─── */
function Tools() {
  const { ref, revealed } = useRevealOnScroll();

  const tools = [
    {
      title: "Cost Calculator",
      desc: "Budget direction before a briefing. Understand the likely range and project shape quickly.",
      link: "/tools/cost-calculator",
      icon: "📊",
    },
    {
      title: "Zone Map",
      desc: "Check delivery coverage and service viability by county before you invest in the idea.",
      link: "/tools/zone-map",
      icon: "📍",
    },
    {
      title: "Material Prices",
      desc: "Sense-check the likely material package across a selection of major building inputs.",
      link: "/tools/material-prices",
      icon: "📦",
    },
    {
      title: "BOQ Generator",
      desc: "Frame a preliminary quantities worksheet and rough cost structure without committing to a final BOQ.",
      link: "/tools/boq-generator",
      icon: "🧾",
    },
  ];

  return (
    <section className="bg-[#f5efe7] py-16 md:py-20">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div ref={ref} className={cn("reveal-on-scroll mx-auto mb-12 max-w-3xl text-center", revealed && "revealed")}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-burgundy">Decision support</p>
          <h2 className="mt-3 font-display text-[2.2rem] text-maroon md:text-[2.9rem]">
            Decide with data, not guesses.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink/70">
            Free tools to help you understand costs, timelines and what’s possible.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 stagger">
          {tools.map((t, i) => (
            <Reveal key={t.title} style={{ transitionDelay: `${i * 100}ms` }}>
              <Link
                to={t.link}
                className="group block h-full rounded-xl border border-maroon/15 bg-[#1b1516] p-3 text-left text-paper transition-all duration-300 hover:border-gold/35 hover:bg-[#241a1b] hover:shadow-[0_25px_55px_rgba(60,5,8,0.18)] sm:rounded-[1.5rem] sm:p-5 lg:p-7"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-white/8 text-lg sm:size-12 sm:rounded-2xl sm:text-2xl">{t.icon}</span>
                  <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.08em] text-gold group-hover:text-gold-light sm:text-[11px] sm:tracking-[0.14em]">
                    Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
                <h3 className="mt-3 font-display text-sm leading-tight text-paper transition-colors duration-300 group-hover:text-gold sm:mt-5 sm:text-2xl">
                  {t.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-[10px] leading-snug text-paper/70 sm:text-sm sm:leading-relaxed">{t.desc}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Diaspora Banner ─── */
function DiasporaBanner() {
  return (
    <div className="bg-gradient-to-r from-gold to-gold-light text-maroon">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
        <p>
          Diaspora mode is on. Contact, timelines and proof of progress are set up for clients who are not on the site.
        </p>
        <Link to="/contact" className="uppercase tracking-[0.14em] text-[11px] font-medium underline-animate">
          How we run remote projects →
        </Link>
      </div>
    </div>
  );
}
