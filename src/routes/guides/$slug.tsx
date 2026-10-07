import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, Lightbulb } from "lucide-react";
import { guideBySlug, GUIDES, type GuideBlock } from "@/lib/diaspora/guides";
import { CtaBand } from "@/components/page-hero";

export const Route = createFileRoute("/guides/$slug")({
  component: GuidePage,
  head: ({ params }) => {
    const g = guideBySlug(params.slug);
    return {
      meta: [
        {
          title: g ? `${g.title} — ATRO guides` : "Guide not found — ATRO",
        },
        { name: "description", content: g?.summary ?? "ATRO building guides" },
      ],
    };
  },
});

function Blocks({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h":
            return (
              <h2
                key={i}
                className="mt-12 font-display text-2xl text-maroon first:mt-0 md:text-[28px]"
              >
                {b.text}
              </h2>
            );
          case "p":
            return (
              <p key={i} className="text-[15px] leading-[1.75] text-ink/80">
                {b.text}
              </p>
            );
          case "list":
            return (
              <ul key={i} className="ml-5 list-disc space-y-2.5 marker:text-gold">
                {b.items.map((it) => (
                  <li key={it} className="text-[15px] leading-[1.7] text-ink/80">
                    {it}
                  </li>
                ))}
              </ul>
            );
          case "ordered":
            return (
              <ol
                key={i}
                className="ml-5 list-decimal space-y-3 marker:text-gold/70 marker:font-display"
              >
                {b.items.map((it) => (
                  <li key={it} className="text-[15px] leading-[1.7] text-ink/80">
                    {it}
                  </li>
                ))}
              </ol>
            );
          case "warn":
            return (
              <div
                key={i}
                className="flex gap-3.5 rounded-2xl border-l-[3px] border-l-red-600 bg-red-50/70 px-5 py-4"
              >
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0 text-red-700"
                />
                <p className="text-[14px] leading-[1.7] text-red-950">{b.text}</p>
              </div>
            );
          case "tip":
            return (
              <div
                key={i}
                className="flex gap-3.5 rounded-2xl border-l-[3px] border-l-gold bg-cream px-5 py-4"
              >
                <Lightbulb size={17} className="mt-0.5 shrink-0 text-gold" />
                <p className="text-[14px] leading-[1.7] text-ink/80">{b.text}</p>
              </div>
            );
          case "table":
            return (
              <div
                key={i}
                className="overflow-x-auto rounded-2xl border border-ink/10"
              >
                <table className="w-full min-w-[560px] text-left">
                  <thead className="border-b border-ink/10 bg-cream">
                    <tr>
                      {b.head.map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-ink/6 last:border-0">
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className={
                              ci === 0
                                ? "px-4 py-3.5 align-top text-[13px] font-medium text-maroon"
                                : "px-4 py-3.5 align-top text-[13px] leading-relaxed text-ink/70"
                            }
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "link":
            return (
              <Link
                key={i}
                to={b.href}
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-burgundy"
              >
                {b.label} →
              </Link>
            );
        }
      })}
    </>
  );
}

function GuidePage() {
  const { slug } = Route.useParams();
  const guide = guideBySlug(slug);

  if (!guide) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl text-maroon">Guide not found</h1>
        <p className="mt-4 text-ink/65">
          That guide does not exist. It may have been moved.
        </p>
        <Link
          to="/guides"
          className="mt-8 inline-block rounded-2xl bg-maroon px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-paper"
        >
          All guides
        </Link>
      </div>
    );
  }

  const others = GUIDES.filter((g) => g.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-maroon pt-28 pb-14 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/60 via-maroon to-maroon" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 size-[380px] rounded-full bg-gold/10 blur-[140px]" />

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <Link
            to="/guides"
            className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-paper/60 transition-colors hover:text-gold"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
            All guides
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.18em]">
            <span className="rounded-full bg-gold/15 px-3 py-1.5 text-gold">
              {guide.category}
            </span>
            <span className="text-paper/45">{guide.readMinutes} min read</span>
          </div>

          <h1 className="reveal mt-5 max-w-4xl font-display text-5xl text-paper sm:text-6xl">
            {guide.title}
          </h1>
          <p className="reveal reveal-delay-1 mt-6 max-w-2xl text-lg text-paper/75">
            {guide.summary}
          </p>
        </div>
      </section>

      <article className="bg-paper py-14 md:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
            <div className="min-w-0 max-w-3xl space-y-5">
              <Blocks blocks={guide.blocks} />
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl bg-maroon p-6 text-paper">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gold">
                  Read this, then verify us
                </p>
                <p className="mt-4 text-[14px] leading-relaxed text-paper/75">
                  Everything above applies to ATRO exactly as it applies to anyone
                  else. Check our registration numbers yourself.
                </p>
                <Link
                  to="/verify"
                  className="mt-5 block rounded-2xl bg-gradient-to-r from-gold to-gold-light px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-maroon transition-transform hover:scale-[1.02]"
                >
                  Verification page
                </Link>
              </div>

              <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gold">
                  More guides
                </p>
                <ul className="mt-4 space-y-3">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <Link
                        to="/guides/$slug"
                        params={{ slug: o.slug }}
                        className="group block text-[13px] leading-snug text-ink/70 transition-colors hover:text-maroon"
                      >
                        <span className="text-[10px] uppercase tracking-[0.14em] text-ink/40">
                          {o.category}
                        </span>
                        <span className="mt-1 block font-medium text-maroon">
                          {o.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <CtaBand
        title="Questions about any of this?"
        body="If something is unclear, ask before you commit. We would rather answer a hard question now than handle a misunderstanding later."
        ctaLabel="Start a project"
      />
    </>
  );
}
