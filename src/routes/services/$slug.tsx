import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BackLink } from "@/components/back-link";
import { CtaBand } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { PROJECTS, serviceBySlug, SERVICE_CATEGORIES } from "@/lib/site";

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
  const category = SERVICE_CATEGORIES.find((item) => item.id === service.category);
  const projectExamples = PROJECTS.filter((project) =>
    service.projectSlugs?.includes(project.slug),
  );

  return (
    <>
      <section className="relative min-h-[52vh] flex items-end text-paper">
        <img src={service.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon via-maroon/60 to-maroon/30" />
        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 w-full pb-12 pt-32">
          <BackLink to="/services" tone="light">All services</BackLink>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gold">
            {category?.title ?? "Service"}
          </p>
          <h1 className="mt-4 font-display text-[2.5rem] md:text-[3.5rem] leading-[0.9] tracking-[-0.05em] text-paper max-w-4xl">
            {service.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-paper/80">{service.kicker}</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-gold">Service overview</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink/80">{service.lede}</p>
          </div>
          <List title="A good fit for" items={service.types} />
          {service.note ? (
            <p className="border-l-2 border-gold pl-4 text-sm leading-relaxed text-ink/70">
              {service.note}
            </p>
          ) : null}
          <div className="space-y-3">
            <Button asChild className="h-12 px-6">
              <Link to="/start" search={{ service: service.slug }}>
                Discuss {service.title}
              </Link>
            </Button>
            <p className="text-sm text-ink/60">
              Your enquiry will include this service, so you do not have to explain where you
              started.
            </p>
          </div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <List title="What this scope can include" items={service.included} />
          <List title="Useful to have ready" items={service.inputs} />
        </div>
      </section>
      {projectExamples.length ? (
        <section
          aria-labelledby="service-projects-heading"
          className="border-y border-line/60 bg-cream py-16 md:py-20"
        >
          <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-burgundy">
              From the project catalogue
            </p>
            <h2
              id="service-projects-heading"
              className="mt-3 font-display text-3xl text-maroon md:text-4xl"
            >
              Project examples for this service
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-6 lg:grid-cols-3">
              {projectExamples.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <CtaBand
        title="Talk through the right scope for your project"
        ctaTo={{ to: "/start", search: { service: service.slug } }}
        ctaLabel="Discuss this service"
      />
    </>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-line bg-cream p-6 rounded-2xl">
      <h2 className="text-[11px] uppercase tracking-[0.16em] text-gold">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink/80">
        {items.map((item) => (
          <li key={item} className="pl-4 border-l border-gold/60">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
