import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero } from "@/components/page-hero";
import { SERVICES } from "@/lib/site";

export const Route = createFileRoute("/services/")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Architectural design, construction, BOQ and cost planning, project management and interiors — delivered as one sequence.",
      },
    ],
  }),
});

function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="Services"
        title="What is included. What we need from you. What happens next."
        lede="Not a list of virtues. Each service is a scope: drawings, quantities, a site, a conversation."
        image="/images/detail.webp"
      />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 space-y-10">
        {SERVICES.map((s, i) => (
          <Link
            key={s.slug}
            to="/services/$slug"
            params={{ slug: s.slug }}
            className="grid md:grid-cols-12 gap-6 md:gap-10 items-center group"
          >
            <div className={`md:col-span-5 ${i % 2 === 1 ? "md:order-2" : ""}`}>
              <div className="aspect-[4/3] overflow-hidden bg-stone">
                <img src={s.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
              </div>
            </div>
            <div className="md:col-span-7">
              <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{s.kicker}</p>
              <h2 className="mt-2 font-display text-4xl text-maroon group-hover:text-burgundy">{s.title}</h2>
              <p className="mt-4 text-ink/75 max-w-xl">{s.lede}</p>
              <p className="mt-4 text-[12px] uppercase tracking-[0.16em] text-burgundy">Read the scope →</p>
            </div>
          </Link>
        ))}
      </section>
      <CtaBand title="Request a consultation" />
    </>
  );
}
