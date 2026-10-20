import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
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
  MessageCircle,
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
  ABROAD_HERO_STATS,
  ABROAD_INCLUDED,
  ABROAD_NEVER,
  ABROAD_PAYMENT_PHASES,
  ABROAD_PROCESS,
  ABROAD_RED_FLAGS,
  abroadService,
} from "@/lib/diaspora/abroad";
import { DIASPORA_LINK, SERVICES } from "@/lib/site";
import { getDiasporaHome } from "@/lib/diaspora-home";
import { stampIn } from "@/lib/tz";
import { whatsappHref, defaultWhatsappText } from "@/lib/whatsapp";

export const Route = createFileRoute("/diaspora")({
  component: DiasporaPage,
  head: () => ({
    meta: [
      { title: "Building from Abroad — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Kenyans abroad: build your home with confidence. Milestone payments, a private project portal, weekly reports, independent verification and a named project manager — not WhatsApp guesses.",
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
              {first ? `${first}, here is where things stand.` : "Here is where things stand."}
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
                {DIASPORA_LINK.label === "Abroad" ? "See the client portal" : DIASPORA_LINK.label}
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

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
            {ABROAD_HERO_STATS.map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="font-display text-2xl text-gold">{s.value}</p>
                <p className="text-xs text-paper/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <YourProjects />

      {/* ── The service, as a scope ── */}
      {service ? (
        <section className="border-b border-ink/10 bg-cream">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
              <div>
                <Badge tone="maroon" className="mb-4">The service</Badge>
                <h2 className="font-display text-3xl md:text-4xl text-maroon">
                  {service.title}
                </h2>
                <p className="mt-4 text-lg font-display text-burgundy">{service.kicker}</p>
                <p className="mt-5 text-[15px] leading-relaxed text-ink/70">{service.lede}</p>
                <Button asChild className="mt-7">
                  <Link to="/services/$slug" params={{ slug: service.slug }}>
                    Service detail
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  What is included
                </p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.included.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white p-4"
                    >
                      <CheckCircle2 className="size-4.5 mt-0.5 shrink-0 text-maroon" />
                      <span className="text-[14px] leading-relaxed text-ink/75">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-ink/10 bg-white p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                      Who it is for
                    </p>
                    <ul className="mt-3 space-y-2">
                      {service.types.map((t) => (
                        <li key={t} className="flex items-center gap-2 text-[13px] text-ink/70">
                          <span className="size-1.5 rounded-full bg-gold" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-white p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                      What we need from you
                    </p>
                    <ul className="mt-3 space-y-2">
                      {service.inputs.map((t) => (
                        <li key={t} className="flex items-center gap-2 text-[13px] text-ink/70">
                          <span className="size-1.5 rounded-full bg-gold" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

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
                  className={`group flex flex-col rounded-3xl border p-7 transition-all ${
                    accent
                      ? "border-gold/60 bg-maroon text-paper shadow-[0_12px_50px_rgb(60_5_8/0.25)]"
                      : "border-ink/10 bg-white hover:border-gold/60 hover:shadow-[0_10px_40px_rgb(201_146_79/0.16)]"
                  }`}
                >
                  <span
                    className={`flex size-12 items-center justify-center rounded-2xl ${
                      accent ? "bg-gold text-maroon" : "bg-maroon/10 text-maroon"
                    }`}
                  >
                    <Icon className="size-6" />
                  </span>
                  <p
                    className={`mt-5 text-[10px] font-bold uppercase tracking-[0.16em] ${
                      accent ? "text-gold" : "text-gold"
                    }`}
                  >
                    {f.kicker}
                  </p>
                  <h3
                    className={`mt-2 font-display text-2xl ${accent ? "text-paper" : "text-maroon"}`}
                  >
                    {f.title}
                  </h3>
                  <p
                    className={`mt-3 flex-1 text-[15px] leading-relaxed ${
                      accent ? "text-paper/75" : "text-ink/65"
                    }`}
                  >
                    {f.body}
                  </p>
                  <span
                    className={`mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-bold ${
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

      {/* ── The honest truth ── */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 md:py-24">
        <div className="max-w-3xl">
          <Badge tone="maroon" className="mb-4">The honest truth</Badge>
          <h2 className="font-display text-3xl md:text-4xl text-maroon">
            Kenyans abroad lose millions every year to construction scams.
          </h2>
          <p className="mt-6 text-ink/70 text-lg leading-relaxed">
            From Dubai to Atlanta, thousands of Kenyans have poured savings into off-plan
            apartments and gated communities — only to discover the show house was
            rented, the title deed was forged, or the developer vanished.
          </p>
          <p className="mt-4 text-ink/70 text-lg leading-relaxed">
            The scams start with glossy adverts, flexible payment plans, and developers
            who call themselves &ldquo;young visionaries building a better Kenya.&rdquo;
            They send holiday greetings, ask about your family. Then the updates stop.
            Construction halts. Communication dries up.
          </p>
          <p className="mt-4 text-ink/70 text-lg leading-relaxed">
            <strong className="text-maroon">We are not here to sell you a dream.</strong>{" "}
            We are here to give you a system that makes sure your money becomes a
            building — not a WhatsApp story.
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
            {ABROAD_RED_FLAGS.map((flag) => (
              <div key={flag} className="flex items-start gap-3 text-sm text-red-800">
                <AlertTriangle className="size-4 mt-0.5 shrink-0 text-red-500" />
                <span>{flag}</span>
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
              Every one of these is contractual — not optional, not &ldquo;if we have
              time,&rdquo; not &ldquo;our usual practice.&rdquo; It is in the contract or it
              does not happen.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ABROAD_INCLUDED.map((signal) => {
              const Icon = INCLUDED_ICON[signal.icon] ?? BadgeCheck;
              return (
                <div
                  key={signal.title}
                  className="group p-6 bg-paper border border-line/50 rounded-2xl hover:border-burgundy/30 hover:shadow-card-hover card-lift transition-all duration-300"
                >
                  <div className="size-12 rounded-2xl bg-maroon/10 flex items-center justify-center text-maroon mb-4 group-hover:bg-maroon/15 transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-display text-lg text-maroon">{signal.title}</h3>
                  <p className="mt-2 text-sm text-ink/60 leading-relaxed">{signal.desc}</p>
                </div>
              );
            })}
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
            You do not need to be in Kenya for any of this. We adapt to your time zone,
            your schedule, and your communication preferences.
          </p>
        </div>

        <div className="space-y-6">
          {ABROAD_PROCESS.map((step) => {
            const Icon = PROCESS_ICON[step.icon] ?? ClipboardCheck;
            return (
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
                      <Icon className="size-5 text-maroon" />
                      <h3 className="font-display text-xl text-maroon">{step.title}</h3>
                    </div>
                    <p className="text-ink/70">{step.desc}</p>
                    <p className="mt-2 text-sm text-ink/50 italic">{step.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
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
              We communicate on a schedule, not when something goes wrong. Every channel
              has a purpose. Every decision is documented.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {ABROAD_CHANNELS.map((ch) => (
              <div
                key={ch.name}
                className="p-6 bg-paper border border-line/50 rounded-2xl hover:border-burgundy/30 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-maroon">{ch.name}</h3>
                    <p className="text-xs text-muted">
                      {ch.frequency} · {ch.format}
                    </p>
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
              Every payment is certified against verified progress. You never pay for
              work that has not been completed and inspected. This is contractual, not a
              favour.
            </p>
            <Button asChild variant="outline" className="mt-7">
              <Link to="/fees">
                Fees and payment terms
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {ABROAD_PAYMENT_PHASES.map((item) => (
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
            {ABROAD_NEVER.map((item) => (
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
          {ABROAD_FAQS.map((faq) => (
            <details key={faq.q} className="group p-6 bg-paper border border-line/50 rounded-2xl hover:border-burgundy/30 transition-colors">
              <summary className="font-display text-lg text-maroon cursor-pointer list-none flex items-center justify-between gap-4">
                {faq.q}
                <span className="text-ink/30 group-open:rotate-180 transition-transform shrink-0">
                  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 text-ink/70 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Two ways forward: an account, or a conversation ── */}
      <section className="bg-cream py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-gold/40 bg-white p-7 md:p-8">
              <Badge tone="gold" className="mb-4">Already a client</Badge>
              <h3 className="font-display text-2xl text-maroon">
                Open your project
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
                Your portal holds the live milestones, the payment ledger and every
                document. One click with the account you already have.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/login">
                    Sign in
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/portal">Go to the portal</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-ink/10 bg-white p-7 md:p-8">
              <Badge tone="maroon" className="mb-4">Not a client yet</Badge>
              <h3 className="font-display text-2xl text-maroon">
                Start with a conversation
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
                Tell us the plot, the programme and the budget band. We will give you
                an indicative range and say whether we are the right studio.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/start" search={{ from: "diaspora" }}>
                    Start a project
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to build with confidence?"
        body="Tell us about your project. We will give you an indicative range, a realistic programme, and a system that keeps you informed — not guessing."
        ctaTo={{ to: "/start", search: { from: "diaspora" } }}
        ctaLabel="Start a project"
      />
    </main>
  );
}