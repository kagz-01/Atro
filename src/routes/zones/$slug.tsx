import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CtaBand } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projectsInZone, zoneBySlug } from "@/lib/site";
import { useSiteStore } from "@/lib/store";
import { useEffect } from "react";

export const Route = createFileRoute("/zones/$slug")({
  component: ZoneDetail,
  loader: ({ params }) => {
    const zone = zoneBySlug(params.slug);
    if (!zone) throw notFound();
    return { zone, projects: projectsInZone(zone.slug) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.zone.seoTitle ?? "Zone — ATRO" },
      { name: "description", content: loaderData?.zone.seoDescription ?? "" },
    ],
  }),
});

function ZoneDetail() {
  const { zone, projects } = Route.useLoaderData();
  const setZone = useSiteStore((s) => s.setSelectedZone);
  useEffect(() => {
    setZone(zone.slug);
  }, [zone.slug, setZone]);

  return (
    <>
      <section className="pt-28 md:pt-36 pb-12 bg-maroon text-paper">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
            <Link to="/zones" className="hover:text-paper">Zones</Link>
            {" / "}
            {zone.region}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="gold">{zone.coverage}</Badge>
          </div>
          <h1 className="mt-4 font-display text-5xl md:text-7xl text-paper max-w-4xl">
            {zone.name}
          </h1>
          <p className="mt-6 max-w-2xl text-paper/75 text-lg">{zone.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold">
              <Link to="/start">Start a project in {zone.name}</Link>
            </Button>
            <Button asChild variant="line">
              <Link to="/projects">Work in this zone</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 grid md:grid-cols-3 gap-8">
        <Fact label="Coverage" value={zone.coverage} />
        <Fact label="Typical work" value={zone.typical} />
        <Fact label="Logistics" value={zone.logistics} />
      </section>

      {projects.length ? (
        <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 pb-12">
          <h2 className="font-display text-3xl text-maroon mb-8">Work in {zone.name}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      ) : (
        <p className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 pb-12 text-ink/70">
          No published projects in this zone yet. The enquiry form still works — we will tell you if the site is outside current coverage.
        </p>
      )}

      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 pb-20">
        <h2 className="font-display text-3xl text-maroon mb-6">Questions we hear here</h2>
        <div className="space-y-3">
          {zone.faqs.map((f) => (
            <details key={f.q} className="border border-line bg-cream p-5 rounded-sm">
              <summary className="cursor-pointer font-display text-xl text-maroon">{f.q}</summary>
              <p className="mt-3 text-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line p-6 bg-cream rounded-sm">
      <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{label}</p>
      <p className="mt-2 text-ink/80">{value}</p>
    </div>
  );
}
