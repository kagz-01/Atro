import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CtaBand } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { serviceBySlug } from "@/lib/site";

export const Route = createFileRoute("/services/$slug")({
  component: ServiceDetail,
  loader: ({ params }) => {
    const service = serviceBySlug(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.service.title ?? "Service"} — ATRO` },
      { name: "description", content: loaderData?.service.lede ?? "" },
    ],
  }),
});

function ServiceDetail() {
  const { service } = Route.useLoaderData();
  return (
    <>
      <section className="relative min-h-[52vh] flex items-end text-paper">
        <img src={service.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon via-maroon/60 to-maroon/30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full pb-12 pt-32">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
            <Link to="/services" className="hover:text-paper">Services</Link>
            {" / "}
            {service.kicker}
          </p>
          <h1 className="mt-4 font-display text-5xl md:text-7xl text-paper max-w-4xl">{service.title}</h1>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <p className="text-lg text-ink/80">{service.lede}</p>
          {service.note ? (
            <p className="mt-6 text-sm border-l-2 border-gold pl-4 text-ink/70">{service.note}</p>
          ) : null}
          <Button asChild className="mt-8">
            <Link to="/start">Enquire about this service</Link>
          </Button>
        </div>
        <div className="lg:col-span-5 space-y-8">
          <List title="What is included" items={service.included} />
          <List title="Typical project types" items={service.types} />
          <List title="What we need from you" items={service.inputs} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-line bg-cream p-6 rounded-sm">
      <h2 className="text-[11px] uppercase tracking-[0.16em] text-gold">{title}</h2>
      <ul className="mt-3 space-y-2 text-ink/80">
        {items.map((item) => (
          <li key={item} className="pl-4 border-l border-gold/60">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
