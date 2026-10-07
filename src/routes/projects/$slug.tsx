import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Lightbox } from "@/components/lightbox";
import { CtaBand } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROJECTS, projectBySlug, ZONES } from "@/lib/site";

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
  const zone = ZONES.find((z) => z.slug === project.zone);
  const related = PROJECTS.filter((p) => p.slug !== project.slug && (p.zone === project.zone || p.type === project.type)).slice(0, 3);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <section className="relative min-h-[70vh] flex items-end text-paper">
        <img src={project.image} alt={project.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon via-maroon/50 to-maroon/20" />
        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 w-full pb-12 pt-32">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
            <Link to="/projects" className="hover:text-paper">Work</Link>
            {" / "}
            {project.location}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={project.status === "Ongoing" ? "live" : "paper"}>{project.status}</Badge>
            <Badge tone="gold">{project.type}</Badge>
            {zone ? <Badge tone="paper">{zone.name}</Badge> : null}
          </div>
          <h1 className="mt-4 font-display text-5xl md:text-7xl text-paper max-w-4xl">{project.name}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <dl className="grid grid-cols-2 gap-6 text-sm">
            <Item label="Location" value={project.location} />
            <Item label="Year" value={project.year} />
            <Item label="Area" value={project.area} />
            <Item label="Duration" value={project.duration} />
            <Item label="Scope" value={project.scope} />
            <Item label="Status" value={project.status} />
          </dl>
          <div className="mt-12 space-y-8">
            <Block title="Challenge" body={project.challenge} />
            <Block title="ATRO’s role" body={project.role} />
            <Block title="Solution" body={project.solution} />
          </div>
        </div>
        <aside className="lg:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Gallery</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {project.gallery.map((g, i) => (
              <button
                key={g.src + i}
                type="button"
                onClick={() => setOpen(i)}
                className="aspect-[4/3] overflow-hidden bg-stone"
              >
                <img src={g.src} alt={g.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {project.timeline ? (
            <div className="mt-10">
              <p className="text-[11px] uppercase tracking-[0.16em] text-gold">Living timeline</p>
              <ol className="mt-4 space-y-4">
                {project.timeline.map((t) => (
                  <li key={t.date} className="border border-line p-4 bg-cream rounded-sm">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{t.date}</p>
                    <h3 className="font-display text-xl text-maroon mt-1">{t.title}</h3>
                    <p className="text-sm text-ink/75 mt-1">{t.caption}</p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          <Button asChild className="mt-8">
            <Link to="/start">Discuss a project like this</Link>
          </Button>
        </aside>
      </section>

      {related.length ? (
        <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 pb-20">
          <h2 className="font-display text-3xl text-maroon mb-8">Related work</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProjectCard key={p.slug} project={p} />
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
      <CtaBand />
    </>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-maroon">{title}</h2>
      <p className="mt-2 text-ink/80">{body}</p>
    </div>
  );
}
