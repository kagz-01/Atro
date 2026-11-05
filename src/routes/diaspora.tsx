import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import { getDiasporaHome } from "@/lib/diaspora-home";
import { stampIn } from "@/lib/tz";

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

/**
 * The same URL as a home: for the signed-in client, the projects with the
 * milestone being built now and the last thing the studio said — the doorstep
 * view, with the portal one click further. Nobody signed in, or no project
 * yet, and this band is not there: the page stays the pitch it always was.
 */
function YourProjects() {
  const { data } = useQuery({
    queryKey: ["diaspora-home"],
    queryFn: () => getDiasporaHome({ data: undefined }),
  });
  if (!data?.signedIn || data.projects.length === 0) return null;
  const first = data.name?.trim().split(/\s+/)[0] ?? null;
  return (
    <section className="border-b border-ink/10 bg-cream">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-12 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge tone="gold">Your projects</Badge>
            <h2 className="mt-3 font-display text-2xl md:text-3xl text-maroon">
              {first ? `${first}, this is where your project stands.` : "This is where your project stands."}
            </h2>
          </div>
          <Button asChild>
            <Link to="/portal">
              Open the portal
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {data.projects.map((p) => (
            <li
              key={p.reference}
              className="flex flex-col rounded-3xl border border-ink/10 bg-white p-6"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                {p.reference}
              </p>
              <h3 className="mt-1 font-display text-xl text-maroon">{p.title}</h3>
              {p.activeMilestone ? (
                <p className="mt-2 text-[13px] text-ink/65">
                  Now building: <span className="text-maroon">{p.activeMilestone}</span>
                </p>
              ) : null}
              {p.lastActivityTitle ? (
                <p className="mt-2 text-[12px] leading-relaxed text-ink/55">
                  Last from the studio — {p.lastActivityTitle}
                  {p.lastActivityAt ? `, ${stampIn(p.lastActivityAt, "Africa/Nairobi")}` : ""}
                </p>
              ) : null}
              <Button asChild variant="outline" size="sm" className="mt-5 self-start">
                <Link to="/portal">
                  Open in the portal
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
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
            Wherever you live, plan and build in Kenya with a local team coordinating design, costs and construction—and clear project updates on your time.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button asChild variant="gold" className="min-h-12 px-6">
              <Link to="/start" search={{ from: "diaspora" }}>
                Tell us about your project
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="min-h-12 border-paper/25 px-6 text-paper hover:bg-paper/10">
              <a href="#process">
                How it works
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-paper/75 underline decoration-paper/35 underline-offset-4 hover:text-paper"
            >
              Already a client? Sign in
            </Link>
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

      <YourProjects />

      <section className="border-b border-ink/10 bg-[#f7f1e5] py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-8 max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy">Choose your path</p>
            <h2 className="mt-3 font-display text-[2.2rem] leading-none text-maroon md:text-[2.9rem]">
              Remote project control, without losing clarity.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[
              {
                title: "I need a starting plan",
                body: "We review your brief, site and likely scope before you commit to a direction.",
                cta: "Start a plan",
                to: "/start?from=diaspora",
              },
              {
                title: "I need visibility",
                body: "Track milestone updates, site progress and the project record from anywhere in the world.",
                cta: "View the portal",
                to: "/portal",
              },
              {
                title: "I need materials support",
                body: "Compare suppliers and product options while ATRO handles the project decisions and delivery flow.",
                cta: "Open MyHardware",
                to: MYHARDWARE_URL,
                external: true,
              },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.to as string}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
                className="group rounded-xl border border-[#d7c8af] bg-white p-3 shadow-[0_18px_30px_-28px_rgba(60,5,8,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_26px_46px_-28px_rgba(60,5,8,0.24)] sm:rounded-[1.6rem] sm:p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-2 sm:mb-5 sm:gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-gold/12 text-xs font-semibold text-maroon sm:size-10 sm:text-sm">
                    {String(item.title[0]).toUpperCase()}
                  </span>
                  <ArrowRight className="size-4 text-maroon transition-transform duration-300 group-hover:translate-x-1" />
                </div>
                <h3 className="font-display text-sm leading-tight text-maroon sm:text-xl md:text-[1.8rem]">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-[10px] leading-snug text-ink/70 sm:mt-3 sm:text-sm sm:leading-relaxed">{item.body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-burgundy sm:mt-5 sm:text-[10px] sm:tracking-[0.14em]">
                  {item.cta}
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service overview ── */}
      {service ? (
        <section className="border-b border-ink/10 bg-[#f5efe7] py-10 md:py-12">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                One team, from design to handover
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink/70 md:text-base">{service.lede}</p>
            </div>
            <Link
              to="/services/$slug"
              params={{ slug: service.slug }}
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
            <Badge tone="maroon" className="mb-3">Useful tools</Badge>
            <h2 className="font-display text-[2.2rem] leading-none text-maroon md:text-[2.8rem]">
              Practical support before the project starts.
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 lg:grid-cols-3">
            {ABROAD_FEATURES.map((f) => {
              const Icon = f.to === "/portal" ? ClipboardCheck
                : f.to === "/verify" ? BadgeCheck
                : f.to === "/scam-check" ? AlertTriangle
                : f.to === "/guides/journey" ? Eye
                : f.to === "/guides" ? FileText
                : CreditCard;
              const accent = f.to === "/portal";
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy">Materials support</p>
              <h2 className="mt-2 font-display text-[2rem] leading-none text-maroon md:text-[2.6rem]">
                Need product comparison while you are abroad?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/70 md:text-base">
                MyHardware helps with supplier supporting materials and product checks while ATRO handles design, planning and delivery oversight in Kenya.
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

      {/* ── Trust signals ── */}
      <section className="bg-stone/60 py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl">
            <Badge tone="gold" className="mb-3">How we protect your build</Badge>
            <h2 className="font-display text-[2.1rem] leading-none text-maroon md:text-[2.8rem]">
              A clear record at every stage.
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {ABROAD_INCLUDED.slice(0, 4).map((signal) => {
              const Icon = INCLUDED_ICON[signal.icon] ?? BadgeCheck;
              return (
                <article key={signal.title} className="rounded-xl border border-ink/10 bg-paper p-3 sm:rounded-2xl sm:p-4">
                  <Icon className="size-4 text-maroon sm:size-5" aria-hidden />
                  <h3 className="mt-2 font-display text-xs leading-tight text-maroon sm:mt-3 sm:text-base">{signal.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-ink/65 sm:text-sm sm:leading-relaxed">
                    {signal.desc}
                  </p>
                </article>
              );
            })}
          </div>

          <details className="group mt-4 rounded-2xl border border-ink/10 bg-paper px-5">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-maroon marker:hidden">
              See all safeguards, reporting standards and red flags
              <span className="text-xl text-gold transition-transform group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <div className="border-t border-ink/10 py-5">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {ABROAD_INCLUDED.slice(4).map((signal) => {
                  const Icon = INCLUDED_ICON[signal.icon] ?? BadgeCheck;
                  return (
                    <article key={signal.title} className="rounded-xl border border-ink/10 p-3 sm:p-4">
                      <Icon className="size-4 text-maroon sm:size-5" aria-hidden />
                      <h3 className="mt-2 text-xs font-medium leading-tight text-maroon sm:text-base">{signal.title}</h3>
                      <p className="mt-1 line-clamp-3 text-[10px] leading-snug text-ink/65 sm:text-sm sm:leading-relaxed">{signal.desc}</p>
                    </article>
                  );
                })}
              </div>

              <h3 className="mt-7 font-display text-xl text-maroon">How we stay in touch</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {ABROAD_CHANNELS.map((channel) => (
                  <article key={channel.name} className="rounded-xl border border-ink/10 p-3 sm:p-4">
                    <h4 className="text-xs font-medium text-maroon sm:text-base">{channel.name}</h4>
                    <p className="text-[9px] leading-snug text-ink/55 sm:text-xs">
                      {channel.frequency} · {channel.format}
                    </p>
                    <p className="mt-2 line-clamp-3 text-[10px] leading-snug text-ink/65 sm:text-sm sm:leading-relaxed">
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

      {/* ── Process walkthrough ── */}
      <section id="process" className="mx-auto max-w-[1400px] px-6 py-12 sm:px-8 md:px-12 md:py-16 lg:px-16">
        <div className="max-w-3xl">
          <Badge tone="maroon" className="mb-3">The process</Badge>
          <h2 className="font-display text-[2.1rem] leading-none text-maroon md:text-[2.8rem]">
            From first call to keys.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/65 md:text-base">
            Four clear phases. Detailed checks and decisions stay available when you need them.
          </p>
        </div>

        <ol className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["01", "Plan", "Brief, site and land checks before design starts."],
            ["02", "Design & cost planning", "Develop the scope, measurements and current quotations before agreeing a construction budget."],
            ["03", "Build with visibility", "Written scope, weekly evidence and certified payments."],
            ["04", "Handover", "Inspections, keys, manuals and a complete record."],
          ].map(([number, title, detail]) => (
            <li key={number} className="rounded-xl border border-ink/10 bg-white p-3 sm:rounded-2xl sm:p-5">
              <span className="text-xs font-bold tracking-[0.14em] text-gold">{number}</span>
              <h3 className="mt-2 font-display text-sm leading-tight text-maroon sm:text-xl">{title}</h3>
              <p className="mt-2 text-[10px] leading-snug text-ink/65 sm:text-sm sm:leading-relaxed">{detail}</p>
            </li>
          ))}
        </ol>

        <details className="group mt-4 rounded-2xl border border-ink/10 bg-white px-5">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-maroon">
            View the full eight-step process
            <span className="text-xl text-gold transition-transform group-open:rotate-45" aria-hidden>
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
      </section>

      {/* ── Payment protection ── */}
      <section className="bg-cream py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <Badge tone="maroon" className="mb-3">Payment protection</Badge>
              <h2 className="font-display text-3xl text-maroon md:text-4xl">
                Pay for completed work.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                Payments follow agreed deliverables, inspection and written approval.
              </p>
            </div>
            <Button asChild variant="outline" className="min-h-11">
              <Link to="/fees">
                Fees and terms
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <ol className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
            {ABROAD_PAYMENT_PHASES.map((item, index) => (
              <li key={item.phase} className="rounded-2xl border border-ink/10 bg-white p-4">
                <span className="text-xs font-bold tracking-[0.14em] text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-medium text-maroon">{item.phase}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/65">{item.pay}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink/55">{item.protect}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="mx-auto max-w-[1400px] px-6 py-12 sm:px-8 md:px-12 md:py-16 lg:px-16">
        <div className="max-w-3xl mb-6">
          <Badge tone="gold" className="mb-3">Common questions</Badge>
          <h2 className="font-display text-3xl text-maroon md:text-4xl">
            What diaspora clients ask.
          </h2>
        </div>

        <div className="max-w-3xl space-y-2">
          {ABROAD_FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-ink/10 bg-paper px-4">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-medium text-maroon marker:hidden">
                {faq.q}
                <span className="shrink-0 text-xl text-gold transition-transform group-open:rotate-45" aria-hidden>
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
        ctaLabel="Tell us about your project"
      />
    </main>
  );
}