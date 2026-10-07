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
            For Kenyans building from abroad
          </p>
          <h1 className="reveal mt-4 max-w-4xl font-display text-5xl text-paper sm:text-6xl md:text-7xl">
            Everything to know before you build
          </h1>
          <p className="reveal reveal-delay-1 mt-6 max-w-2xl text-lg text-paper/75">
            Written to be read before money moves, not after it has. No pitch, no
            gated download — just how the process actually works, where it goes
            wrong, and what to check yourself.
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
      <section className="bg-paper py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                The full sequence
              </p>
              <h2 className="mt-3 font-display text-4xl text-maroon md:text-5xl">
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

          <ol className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {JOURNEY.map((s) => (
              <li key={s.id}>
                <Link
                  to="/guides/journey"
                  className="group flex h-full items-start gap-4 rounded-2xl border border-ink/10 bg-white p-5 transition-all hover:border-gold/60 hover:shadow-[0_8px_30px_rgb(201_146_79/0.15)]"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-maroon font-display text-base text-paper">
                    {s.order}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium text-maroon transition-colors group-hover:text-burgundy">
                      {s.name}
                    </span>
                    <span className="mt-1.5 block text-[12px] text-ink/50">
                      {s.duration} · {s.costShare}
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
            className="bg-stone/50 py-14 md:py-16"
          >
            <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                {cat}
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {items.map((g) => (
                  <Link
                    key={g.slug}
                    to="/guides/$slug"
                    params={{ slug: g.slug }}
                    className="group flex flex-col rounded-3xl border border-ink/10 bg-white p-7 transition-all hover:border-gold/60 hover:shadow-[0_10px_40px_rgb(201_146_79/0.16)]"
                  >
                    <h3 className="font-display text-2xl leading-snug text-maroon transition-colors group-hover:text-burgundy">
                      {g.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[14px] leading-relaxed text-ink/65">
                      {g.summary}
                    </p>
                    <p className="mt-5 border-t border-ink/8 pt-4 text-[11px] uppercase tracking-[0.14em] text-ink/45">
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
