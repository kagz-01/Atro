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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 grid md:grid-cols-3 gap-8">
        {ARTICLES.map((a) => (
          <Link key={a.slug} to="/insights/$slug" params={{ slug: a.slug }} className="group border border-line bg-cream rounded-sm overflow-hidden hover:border-burgundy">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={a.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
            </div>
            <div className="p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                {a.kicker} · {a.date} · {a.read}
              </p>
              <h2 className="mt-2 font-display text-2xl text-maroon group-hover:text-burgundy">{a.title}</h2>
              <p className="mt-2 text-sm text-ink/70">{a.excerpt}</p>
            </div>
          </Link>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
