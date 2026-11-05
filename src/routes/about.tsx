import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Eye,
  HardHat,
  MapPin,
  Ruler,
} from "lucide-react";
import { COMPANY, VALUES } from "@/lib/site";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About ATRO — Design & Construction" },
      {
        name: "description",
        content:
          "Meet ATRO: a Nairobi-based design and construction studio connecting practical design, cost planning and project delivery across Kenya.",
      },
    ],
  }),
});

const commitments = [
  {
    icon: Ruler,
    title: "Design for the real site",
    body: "We consider the brief, location, practical constraints and construction together—not as separate conversations.",
  },
  {
    icon: CircleDollarSign,
    title: "Make cost part of the decision",
    body: "We explain what an estimate includes, what can change it, and where a project needs more investigation before a firm price.",
  },
  {
    icon: ClipboardCheck,
    title: "Agree the scope before work moves",
    body: "The proposal, drawings and agreed changes give everyone a shared reference for decisions and delivery.",
  },
  {
    icon: Eye,
    title: "Keep progress understandable",
    body: "We share updates, record decisions and make the next action clear—especially when you cannot be at the site yourself.",
  },
];

const valuesIcons = [Eye, HardHat, CircleDollarSign, ClipboardCheck] as const;

function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#241014] pb-12 pt-28 text-paper sm:pb-16 sm:pt-32 md:pb-20 md:pt-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_15%,rgba(144,70,55,0.42),transparent_48%),linear-gradient(120deg,#241014,#481b25_65%,#241014)]" />
        <div className="container-wide grid items-center gap-9 lg:grid-cols-[1fr_0.88fr] lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/80">
              <span className="size-1.5 rounded-full bg-gold" />
              About ATRO
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-[2.4rem] leading-[0.96] tracking-[-0.045em] text-paper sm:text-[3.2rem] md:text-[4rem]">
              Good building starts with{" "}
              <span className="text-gradient-gold italic">clear thinking.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper/75 sm:text-lg">
              We bring design, practical cost planning and construction into one
              conversation—so the choices made on paper make sense on site and for your budget.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/projects"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-maroon transition-colors hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                See our work
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/services"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore our services
              </Link>
            </div>
          </div>

          <figure className="relative min-w-0">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/5 p-2 sm:rounded-[2rem] sm:p-3">
              <img
                src="/catalog/images/pcea-baraka-church-slab-and-walling-2026-10.webp"
                alt="Slab and walling work at PCEA Baraka Church"
                className="aspect-[4/3] w-full rounded-[1.1rem] object-cover sm:rounded-[1.5rem]"
              />
            </div>
            <figcaption className="mt-3 flex items-center justify-between gap-3 px-1 text-xs text-paper/65 sm:text-sm">
              <span>Work in progress · PCEA Baraka Church</span>
              <Link
                to="/projects/$slug"
                params={{ slug: "pcea-baraka-church" }}
                className="inline-flex min-h-10 shrink-0 items-center gap-1 font-medium text-gold hover:text-gold-light"
              >
                Project story <ArrowRight className="size-3.5" />
              </Link>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy sm:text-xs">
              Why we work this way
            </p>
            <h2 className="mt-3 max-w-lg font-display text-3xl leading-tight text-maroon sm:text-4xl">
              A building is one project—not three separate hand-offs.
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-ink/75 sm:space-y-5 sm:text-base">
            <p>
              A design affects quantities. Quantities affect the budget. The budget and site
              conditions affect how the building can be delivered. When those decisions are made
              in isolation, clients are left to reconcile them later.
            </p>
            <p>
              ATRO is a Nairobi-based design and construction studio. We connect those decisions
              from the brief onwards, explain assumptions as they arise, and help clients see
              what is agreed, what is still open, and what needs to happen next.
            </p>
            <p>
              We work with homeowners, businesses and institutions across Kenya, including
              clients planning a project here while living abroad.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f4efe6] py-12 sm:py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy sm:text-xs">
              What you can expect
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-maroon sm:text-4xl">
              Clear decisions, from first brief to handover.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70 sm:text-base">
              The details vary by project. These are the principles we bring to the work.
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:mt-9 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {commitments.map(({ icon: Icon, title, body }, index) => (
              <article
                key={title}
                className="rounded-2xl border border-line/70 bg-paper p-5 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-maroon/8 text-maroon">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-display text-sm text-burgundy/50">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl leading-tight text-maroon">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20">
        <div className="container-wide grid gap-9 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-16">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy sm:text-xs">
              Our values
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-maroon sm:text-4xl">
              How we want every project to feel.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/70 sm:text-base">
              Not slogans on a wall—standards for how we plan, communicate and look after the
              work entrusted to us.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {VALUES.map((value, index) => {
              const Icon = valuesIcons[index] ?? Check;
              return (
                <article
                  key={value.title}
                  className="rounded-2xl border border-line/60 bg-white p-5 sm:p-6"
                >
                  <Icon className="size-5 text-burgundy" />
                  <h3 className="mt-4 font-display text-xl text-maroon">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{value.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-line/50 bg-cream py-10 sm:py-12">
        <div className="container-wide grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-maroon/10 text-maroon">
              <MapPin className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl text-maroon">
                Rooted in Nairobi. Working across Kenya.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70 sm:text-base">
                We share our coverage clearly and assess the site, access and project needs
                before confirming what is practical.
              </p>
            </div>
          </div>
          <Link
            to="/diaspora"
            className="group inline-flex min-h-11 items-center gap-2 font-semibold text-burgundy hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon"
          >
            For clients living abroad
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-maroon py-14 text-paper sm:py-16 md:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_0%,rgba(144,70,55,0.45),transparent_50%)]" />
        <div className="container-wide flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold sm:text-xs">
              Start with a conversation
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              Tell us what you’re planning.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-paper/75 sm:text-base">
              Share what you know so far. We’ll review the brief and help you identify a
              practical next step.
            </p>
            <p className="mt-4 text-xs text-paper/60">
              {COMPANY.address} · {COMPANY.email} · {COMPANY.phoneDisplay}
            </p>
          </div>
          <Link
            to="/start"
            className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-maroon transition-colors hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Start a project brief
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </>
  );
}
