import { createFileRoute, Link } from "@tanstack/react-router";
import { GUIDES, GUIDE_CATEGORIES } from "@/lib/diaspora/guides";
import { JOURNEY } from "@/lib/diaspora/journey";
import { CtaBand } from "@/components/page-hero";

export const Route = createFileRoute("/guides/")({
  component: GuidesIndex,
  head: () => ({
    meta: [
      { title: "Guides — building in Kenya from abroad — ATRO" },
      {
        name: "description",
        content:
          "Practical guides to buying land, sending money legally, verifying a contractor, reading a bill of quantities and managing a construction project from abroad.",
      },
    ],
  }),
});

function GuidesIndex() {
  return (
    <>
      <section className="relative overflow-hidden bg-maroon pt-28 pb-16 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/60 via-maroon to-maroon" />
        <div className="pointer-events-none absolute -top-24 right-10 size-[420px] rounded-full bg-gold/10 blur-[150px]" />

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
            Building in Kenya
          </p>
          <h1 className="reveal mt-4 max-w-4xl font-display text-[2.3rem] leading-[0.96] text-paper sm:text-5xl md:text-6xl lg:text-7xl">
            Know what to expect before construction begins.
          </h1>
          <p className="reveal reveal-delay-1 mt-6 max-w-2xl text-base text-paper/75 sm:text-lg">
            Clear guides to planning, costing, approvals and project stages—so
            you can ask better questions before work begins.
          </p>

          <div className="reveal reveal-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              to="/guides/journey"
              className="rounded-2xl bg-gradient-to-r from-gold to-gold-light px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-maroon shadow-glow-gold transition-transform hover:scale-[1.02]"
            >
              Follow the build stage by stage
            </Link>
            <Link
              to="/verify"
              className="rounded-2xl border border-paper/25 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-paper transition-colors hover:border-gold hover:text-gold"
            >
              Check anyone, including us
            </Link>
          </div>
        </div>
      </section>

      {/* Journey teaser */}
      <section className="bg-paper py-9 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                The full sequence
              </p>
              <h2 className="mt-3 font-display text-[1.85rem] text-maroon sm:text-3xl md:text-4xl lg:text-5xl">
                Ten stages, start to handover
              </h2>
            </div>
            <Link
              to="/guides/journey"
              className="text-[12px] uppercase tracking-[0.16em] font-bold text-burgundy transition-colors hover:text-gold"
            >
              Open the journey →
            </Link>
          </div>

          <ol className="mt-5 grid grid-cols-2 gap-2 sm:mt-9 sm:gap-3 lg:grid-cols-5">
            {JOURNEY.map((s) => (
              <li key={s.id}>
                <Link
                  to="/guides/journey"
                  className="group flex h-full items-start gap-2 rounded-xl border border-ink/10 bg-white p-3 transition-all hover:border-gold/60 hover:shadow-[0_8px_30px_rgb(201_146_79/0.15)] sm:gap-4 sm:rounded-2xl sm:p-5"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-maroon font-display text-xs text-paper sm:size-9 sm:text-base">
                    {s.order}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium leading-tight text-maroon transition-colors group-hover:text-burgundy sm:text-[15px]">
                      {s.name}
                    </span>
                    <span className="mt-1 block text-[9px] leading-tight text-ink/50 sm:mt-1.5 sm:text-[12px]">
                      {s.duration}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Guides by category */}
      {GUIDE_CATEGORIES.map((cat) => {
        const items = GUIDES.filter((g) => g.category === cat);
        if (!items.length) return null;
        return (
          <section
            key={cat}
            className="bg-stone/50 py-9 md:py-16"
          >
            <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                {cat}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-5">
                {items.map((g) => (
                  <Link
                    key={g.slug}
                    to="/guides/$slug"
                    params={{ slug: g.slug }}
                    className="group flex flex-col rounded-xl border border-ink/10 bg-white p-3 transition-all hover:border-gold/60 hover:shadow-[0_10px_40px_rgb(201_146_79/0.16)] sm:rounded-3xl sm:p-5 md:p-7"
                  >
                    <h3 className="font-display text-sm leading-tight text-maroon transition-colors group-hover:text-burgundy sm:text-xl md:text-2xl sm:leading-snug">
                      {g.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-[10px] leading-snug text-ink/65 sm:mt-3 sm:text-[14px] sm:leading-relaxed">
                      {g.summary}
                    </p>
                    <p className="mt-3 border-t border-ink/8 pt-2 text-[8px] uppercase tracking-[0.1em] text-ink/45 sm:mt-5 sm:pt-4 sm:text-[11px] sm:tracking-[0.14em]">
                      {g.readMinutes} min read →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <CtaBand
        title="Read the guides, then talk to us"
        body="We would rather you understand the process first. When you are ready, tell us about the plot and we will tell you honestly whether we are the right studio for it."
        ctaLabel="Start a project"
      />
    </>
  );
}
