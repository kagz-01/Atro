import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero } from "@/components/page-hero";
import { ARTICLES } from "@/lib/site";

export const Route = createFileRoute("/insights/")({
  component: InsightsPage,
  head: () => ({
    meta: [
      { title: "Insights — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Notes on BOQ-led costing, diaspora building, and what actually changes between Nairobi and Kiambu.",
      },
    ],
  }),
});

function InsightsPage() {
  return (
    <>
      <PageHero
        kicker="Insights"
        title="Useful pages. Not a newsroom."
        lede="How costing, geography and remote clients actually behave on Kenyan sites."
      />
      <section className="mx-auto grid max-w-[1400px] grid-cols-2 gap-3 px-6 pb-12 sm:gap-5 sm:px-8 md:grid-cols-3 md:px-12 md:pb-20 lg:px-16">
        {ARTICLES.map((a) => (
          <Link key={a.slug} to="/insights/$slug" params={{ slug: a.slug }} className="group border border-line bg-cream rounded-sm overflow-hidden hover:border-burgundy">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={a.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
            </div>
            <div className="p-3 sm:p-5">
              <p className="line-clamp-1 text-[8px] uppercase tracking-[0.08em] text-muted sm:text-[11px] sm:tracking-[0.16em]">
                {a.kicker} · {a.date} · {a.read}
              </p>
              <h2 className="mt-2 font-display text-sm leading-tight text-maroon group-hover:text-burgundy sm:text-xl md:text-2xl">{a.title}</h2>
              <p className="mt-2 line-clamp-3 text-[10px] leading-snug text-ink/70 sm:text-sm sm:leading-normal">{a.excerpt}</p>
            </div>
          </Link>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
