import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { COMPANY } from "@/lib/site";

export type LegalSection = {
  id: string;
  heading: string;
  body: ReactNode;
};

/** Sibling policies, used for the cross-links at the foot of every legal page. */
export const LEGAL_PAGES = [
  { to: "/privacy", label: "Privacy notice" },
  { to: "/terms", label: "Terms of use" },
  { to: "/fees", label: "Fees & payment" },
  { to: "/cookies", label: "Cookies" },
  { to: "/scam-warning", label: "Scam warning" },
  { to: "/accessibility", label: "Accessibility" },
] as const;

export function LegalPage({
  slug,
  title,
  lede,
  updated,
  intro,
  sections,
  callout,
}: {
  slug: string;
  title: string;
  lede: string;
  updated: string;
  intro?: ReactNode;
  sections: LegalSection[];
  callout?: { heading: string; body: ReactNode };
}) {
  const siblings = LEGAL_PAGES.filter((p) => p.to !== slug);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-maroon pt-28 pb-14 md:pt-36 md:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/60 via-maroon to-maroon" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 size-[420px] rounded-full bg-gold/10 blur-[140px]" />

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-paper/60 transition-colors hover:text-gold"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
            Back to ATRO
          </Link>

          <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-gold">
            Legal
          </p>
          <h1 className="reveal mt-3 max-w-3xl font-display text-5xl text-paper sm:text-6xl">
            {title}
          </h1>
          <p className="reveal reveal-delay-1 mt-6 max-w-2xl text-lg text-paper/75">
            {lede}
          </p>

          <div className="reveal reveal-delay-2 mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-paper/45">
            <span>Last updated {updated}</span>
            <span aria-hidden className="text-gold/50">
              ·
            </span>
            <span>{COMPANY.address}</span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-paper py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-16">
            {/* Sticky contents */}
            <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
                On this page
              </p>
              <ol className="mt-5 space-y-2.5 border-l border-ink/10 pl-4 text-[13px]">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex gap-2.5 text-ink/60 transition-colors hover:text-maroon"
                    >
                      <span className="tabular-nums text-gold/70">{i + 1}.</span>
                      <span className="transition-colors group-hover:text-maroon">
                        {s.heading}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>

              <div className="mt-8 rounded-2xl border border-ink/10 bg-cream p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
                  Ask us anything
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-ink/70">
                  Plain-language questions about this page are welcome. We answer in
                  writing.
                </p>
                <div className="mt-4 space-y-2.5">
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="flex items-center gap-2 text-[13px] text-maroon transition-colors hover:text-gold"
                  >
                    <Mail size={14} className="shrink-0 opacity-70" />
                    {COMPANY.email}
                  </a>
                  <a
                    href={`tel:${COMPANY.phoneTel}`}
                    className="flex items-center gap-2 text-[13px] text-maroon transition-colors hover:text-gold"
                  >
                    <Phone size={14} className="shrink-0 opacity-70" />
                    {COMPANY.phoneDisplay}
                  </a>
                </div>
              </div>
            </nav>

            {/* Sections */}
            <article className="min-w-0 max-w-3xl">
              {intro ? (
                <div className="border-l-2 border-gold bg-cream px-6 py-5 text-[15px] leading-relaxed text-ink/80">
                  {intro}
                </div>
              ) : null}

              <div className={intro ? "mt-12 space-y-12" : "space-y-12"}>
                {sections.map((s, i) => (
                  <section key={s.id} id={s.id} className="scroll-mt-28">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-2xl text-gold/80 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2 className="font-display text-2xl text-maroon md:text-[28px]">
                        {s.heading}
                      </h2>
                    </div>
                    <div className="mt-4 space-y-4 text-[15px] leading-[1.75] text-ink/80">
                      {s.body}
                    </div>
                  </section>
                ))}
              </div>

              {/* Callout */}
              {callout ? (
                <div className="mt-14 rounded-3xl bg-maroon px-7 py-8 text-paper md:px-9">
                  <h3 className="font-display text-xl text-gold">{callout.heading}</h3>
                  <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-paper/80">
                    {callout.body}
                  </div>
                </div>
              ) : null}

              {/* Sibling policies */}
              <div className="mt-14 border-t border-ink/10 pt-8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
                  Other policies
                </p>
                <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {siblings.map((p) => (
                    <Link
                      key={p.to}
                      to={p.to}
                      className="group flex items-center justify-between gap-4 border-b border-ink/10 pb-3 text-[14px] text-ink/75 transition-colors hover:border-gold/50 hover:text-maroon"
                    >
                      {p.label}
                      <span className="text-gold opacity-0 transition-opacity group-hover:opacity-100">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
