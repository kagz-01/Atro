import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowRight, MapPin } from "lucide-react";
import { Lightbox } from "@/components/lightbox";
import { BackLink } from "@/components/back-link";
import { CtaBand } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { PROJECTS, projectBySlug, SERVICES, ZONES } from "@/lib/site";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectDetail,
  loader: ({ params }) => {
    const project = projectBySlug(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.project.name ?? "Project"} — ATRO` },
      { name: "description", content: loaderData?.project.excerpt ?? "" },
    ],
  }),
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const zone = ZONES.find((item) => item.slug === project.zone);
  const related = PROJECTS.filter((item) => {
    if (
      item.slug === project.slug ||
      (item.status === "Illustrative") !== (project.status === "Illustrative")
    ) {
      return false;
    }
    return (
      (project.zone !== undefined && item.zone === project.zone) ||
      item.type === project.type
    );
  }).slice(0, 3);
  const projectServices = SERVICES.filter((service) =>
    project.serviceSlugs?.includes(service.slug),
  );
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <main>
        <section className="bg-[#150e0f] pb-6 pt-20 text-paper sm:pb-10 sm:pt-24">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-8 md:px-12 lg:px-16">
            <BackLink to="/projects" tone="light">All projects</BackLink>

            <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-[#1d1516] lg:grid-cols-[0.88fr_1.12fr] lg:rounded-[1.75rem]">
              <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={project.status === "Ongoing" ? "live" : "paper"}>
                    {project.status === "Illustrative"
                      ? "Illustrative concept"
                      : project.status}
                  </Badge>
                  <Badge tone="gold">{project.type}</Badge>
                </div>
                <h1 className="mt-4 max-w-xl font-display text-[2rem] leading-[0.98] text-paper sm:mt-6 sm:text-5xl lg:text-6xl">
                  {project.name}
                </h1>
                <p className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-paper/60 sm:mt-4 sm:text-[11px]">
                  <MapPin className="size-3.5 text-gold" aria-hidden="true" />
                  {project.location}
                  {zone ? ` · ${zone.name}` : ""}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-paper/75 sm:mt-6 sm:text-base">
                  {project.excerpt}
                </p>
                <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
                  <a
                    href="#project-story"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-maroon transition-colors hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:px-5 sm:text-[11px] sm:tracking-[0.14em]"
                  >
                    Read the project story
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </a>
                  <a
                    href="#project-gallery"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:px-5 sm:text-[11px] sm:tracking-[0.14em]"
                  >
                    See the work
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(0)}
                aria-label={`Open ${project.name} photo gallery`}
                className="group relative block min-h-64 w-full overflow-hidden bg-stone text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-gold sm:min-h-80 lg:min-h-[34rem]"
              >
                <img
                  src={project.image}
                  alt={project.gallery[0]?.alt ?? project.name}
                  fetchPriority="high"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12 text-[10px] text-white sm:px-6 sm:pb-6 sm:text-xs">
                  <span className="line-clamp-2">
                    {project.gallery[0]?.alt ?? project.name}
                  </span>
                  <span className="shrink-0 uppercase tracking-[0.14em]">
                    View photos <ArrowRight className="ml-1 inline size-3.5" aria-hidden="true" />
                  </span>
                </span>
              </button>
            </div>
          </div>
        </section>

        <section
          id="project-story"
          className="scroll-mt-24 bg-paper px-4 py-10 sm:px-8 sm:py-14 md:px-12 lg:px-16"
        >
          <div className="mx-auto max-w-5xl">
            {project.status === "Illustrative" ? (
              <aside className="mb-7 rounded-xl border border-gold/30 bg-[#f8f1e5] p-3 text-xs leading-relaxed text-ink/75 sm:mb-9 sm:p-4 sm:text-sm">
                <span className="font-semibold text-maroon">Illustrative concept. </span>
                This shows a possible design direction. It is not a verified ATRO
                commission, completed project or active construction site; images
                are design references, not progress photographs.
              </aside>
            ) : null}

            <div className="grid gap-6 md:grid-cols-[0.72fr_1.28fr] md:gap-12">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy sm:text-[11px]">
                  The project story
                </p>
                <h2 className="mt-3 max-w-md font-display text-2xl leading-tight text-maroon sm:text-4xl">
                  {project.challenge
                    ? "The brief, and what it called for."
                    : "A closer look at the project."}
                </h2>
              </div>
              <div>
                <p className="text-sm leading-relaxed text-ink/75 sm:text-base sm:leading-[1.75]">
                  {project.challenge ?? project.description ?? project.excerpt}
                </p>
                {project.role || project.solution ? (
                  <div className="mt-5 grid gap-4 sm:mt-7 sm:grid-cols-2">
                    {project.role ? (
                      <div className="border-l-2 border-gold pl-3 sm:pl-4">
                        <h3 className="font-display text-lg text-maroon">ATRO’s role</h3>
                        <p className="mt-1 text-xs leading-relaxed text-ink/70 sm:text-sm">
                          {project.role}
                        </p>
                      </div>
                    ) : null}
                    {project.solution ? (
                      <div className="border-l-2 border-gold pl-3 sm:pl-4">
                        <h3 className="font-display text-lg text-maroon">The response</h3>
                        <p className="mt-1 text-xs leading-relaxed text-ink/70 sm:text-sm">
                          {project.solution}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <dl className="mt-7 grid grid-cols-2 gap-3 border-t border-line/70 pt-5 sm:mt-10 sm:grid-cols-4 sm:gap-4 sm:pt-6">
              <Item label="Location" value={project.location} />
              <Item label="Year" value={project.year} />
              <Item label="Area" value={project.area} />
              <Item label="Duration" value={project.duration} />
              <Item label="Scope" value={project.scope} />
              {project.client ? <Item label="Client" value={project.client} /> : null}
            </dl>

            {project.keyFacts?.length ? (
              <div className="mt-7 sm:mt-9">
                <h3 className="font-display text-lg text-maroon sm:text-xl">
                  Project highlights
                </h3>
                <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-6">
                  {project.keyFacts.slice(0, 4).map((fact) => (
                    <li
                      key={fact}
                      className="flex gap-2 text-xs leading-relaxed text-ink/75 sm:gap-3 sm:text-sm"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"
                      />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
                {project.keyFacts.length > 4 ? (
                  <details className="group mt-3 rounded-xl border border-line/70 bg-cream px-3 sm:px-4">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-xs font-medium text-maroon marker:hidden sm:text-sm">
                      See all project details
                      <span
                        className="text-lg text-gold transition-transform group-open:rotate-45"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line/70 py-3 sm:gap-x-6">
                      {project.keyFacts.slice(4).map((fact) => (
                        <li
                          key={fact}
                          className="flex gap-2 text-xs leading-relaxed text-ink/75 sm:gap-3 sm:text-sm"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"
                          />
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            ) : null}

            {projectServices.length ? (
              <div className="mt-7 border-t border-line/70 pt-5 sm:mt-9 sm:pt-6">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                  Services involved
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {projectServices.map((service) => (
                    <li key={service.slug}>
                      <Link
                        to="/services/$slug"
                        params={{ slug: service.slug }}
                        className="inline-flex min-h-9 items-center rounded-full border border-line px-3 py-1.5 text-xs text-burgundy transition-colors hover:border-gold hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy sm:text-sm"
                      >
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {project.projectContact && project.status !== "Illustrative" ? (
              <p className="mt-6 border-l-2 border-gold pl-3 text-xs leading-relaxed text-ink/60 sm:pl-4 sm:text-sm">
                Project contact:{" "}
                <span className="font-medium text-maroon">
                  {project.projectContact.name}
                </span>
                {" · "}
                {project.projectContact.role}
              </p>
            ) : null}
          </div>
        </section>

        <section
          id="project-gallery"
          className="scroll-mt-24 bg-[#f1ece4] px-4 py-10 sm:px-8 sm:py-14 md:px-12 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy sm:text-[11px]">
                  The proof
                </p>
                <h2 className="mt-2 font-display text-2xl leading-tight text-maroon sm:text-4xl">
                  See the work up close.
                </h2>
              </div>
              <span className="shrink-0 text-[9px] uppercase tracking-[0.12em] text-muted sm:text-[11px]">
                {project.gallery.length} photo{project.gallery.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {project.gallery.map((image, index) => (
                <figure
                  key={`${image.src}-${index}`}
                  className="min-w-0 overflow-hidden rounded-xl border border-line/60 bg-white sm:rounded-2xl"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(index)}
                    aria-label={`View image ${index + 1}: ${image.alt}`}
                    className="group relative block aspect-[4/3] w-full overflow-hidden bg-stone focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-burgundy"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                      className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.03] ${
                        image.fit === "contain" ? "object-contain" : "object-cover"
                      }`}
                    />
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-1 text-[8px] uppercase tracking-[0.1em] text-white sm:bottom-3 sm:right-3 sm:text-[10px]">
                      View
                    </span>
                  </button>
                  <figcaption className="line-clamp-2 p-2 text-[9px] leading-snug text-ink/65 sm:p-3 sm:text-xs sm:leading-relaxed">
                    {image.alt}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {project.timeline?.length ? (
          <section className="bg-paper px-4 py-10 sm:px-8 sm:py-14 md:px-12 lg:px-16">
            <div className="mx-auto max-w-5xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy sm:text-[11px]">
                Project progress
              </p>
              <h2 className="mt-2 font-display text-2xl text-maroon sm:text-3xl">
                The timeline so far
              </h2>
              <ol className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-4 md:grid-cols-3">
                {project.timeline.map((item) => (
                  <li
                    key={item.date}
                    className="overflow-hidden rounded-xl border border-line/60 bg-cream sm:rounded-2xl"
                  >
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-3 sm:p-4">
                      <p className="text-[9px] uppercase tracking-[0.14em] text-muted sm:text-[10px]">
                        {item.date}
                      </p>
                      <h3 className="mt-1 font-display text-sm text-maroon sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[10px] leading-snug text-ink/70 sm:text-sm sm:leading-relaxed">
                        {item.caption}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}
      </main>

      {related.length ? (
        <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 sm:py-14 md:px-12 lg:px-16">
          <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy sm:text-[11px]">
                Keep exploring
              </p>
              <h2 className="mt-2 font-display text-2xl text-maroon sm:text-3xl">
                More work like this.
              </h2>
            </div>
            <Link
              to="/projects"
              className="inline-flex min-h-11 shrink-0 items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-burgundy hover:text-maroon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy sm:text-[11px] sm:tracking-[0.14em]"
            >
              All projects <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {related.map((item) => (
              <ProjectCard key={item.slug} project={item} />
            ))}
          </div>
        </section>
      ) : null}

      {open !== null ? (
        <Lightbox
          images={project.gallery}
          index={open}
          onClose={() => setOpen(null)}
          onIndex={setOpen}
        />
      ) : null}

      <CtaBand
        title="Planning something similar?"
        body="Tell us what you have in mind, where you want to build and what matters most. We will help you work out a practical next step."
        ctaTo={
          projectServices[0]
            ? { to: "/start", search: { service: projectServices[0].slug } }
            : "/start"
        }
        ctaLabel="Discuss a similar project"
      />
    </>
  );
}

function Item({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="min-w-0">
      <dt className="text-[9px] uppercase tracking-[0.12em] text-muted sm:text-[10px] sm:tracking-[0.16em]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-[11px] leading-snug text-ink sm:text-sm sm:leading-relaxed">
        {value}
      </dd>
    </div>
  );
}
