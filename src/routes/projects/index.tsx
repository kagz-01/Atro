import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CtaBand, PageHero } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { PROJECTS, type ProjectStatus, type ProjectType, ZONES } from "@/lib/site";

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: "Work — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Explore ATRO's completed projects, active sites and designs in development across Kenya.",
      },
    ],
  }),
});

const TYPES: ProjectType[] = [
  "Residential",
  "Commercial",
  "Institutional",
  "Church",
  "School",
  "Renovation",
];
const STATUSES: ProjectStatus[] = [
  "Completed",
  "Ongoing",
  "In design",
  "Proposed",
  "Illustrative",
];

function ProjectsPage() {
  const [type, setType] = useState<ProjectType | "All">("All");
  const [status, setStatus] = useState<ProjectStatus | "All">("All");
  const [zone, setZone] = useState("All");
  const activeFilters = [
    type !== "All" ? type : "",
    status !== "All" ? status : "",
    zone !== "All" ? ZONES.find((item) => item.slug === zone)?.name ?? zone : "",
  ].filter(Boolean);

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      if (type !== "All" && p.type !== type) return false;
      if (status !== "All" && p.status !== status) return false;
      if (zone !== "All" && (p.status === "Illustrative" || p.zone !== zone)) return false;
      return true;
    });
  }, [type, status, zone]);

  return (
    <>
      <PageHero
        kicker="Work"
        title="Explore our construction and design work."
        lede="Browse documented ATRO projects and clearly labeled illustrative concepts by project type, status and location."
        image="/catalog/images/karen.webp"
      />
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 md:px-12 lg:px-16 lg:py-12">
        <details className="group rounded-2xl border border-line bg-paper">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-maroon">Filter projects</span>
              <span className="mt-0.5 block truncate text-[11px] text-muted">
                {activeFilters.length > 0 ? activeFilters.join(" · ") : "Type, status or location"}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {activeFilters.length > 0 ? (
                <span className="rounded-full bg-burgundy px-2 py-0.5 text-[10px] font-semibold text-white">
                  {activeFilters.length} active
                </span>
              ) : null}
              <span className="text-xs text-burgundy group-open:hidden">Show</span>
              <span className="hidden text-xs text-burgundy group-open:inline">Hide</span>
            </span>
          </summary>
          <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-3">
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Type
              <select
                aria-label="Filter projects by type"
                value={type}
                onChange={(event) => setType(event.target.value as ProjectType | "All")}
                className="h-10 min-w-0 rounded-xl border border-line bg-white px-3 text-sm font-normal normal-case tracking-normal text-ink"
              >
                <option value="All">All types</option>
                {TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Status
              <select
                aria-label="Filter projects by status"
                value={status}
                onChange={(event) => setStatus(event.target.value as ProjectStatus | "All")}
                className="h-10 min-w-0 rounded-xl border border-line bg-white px-3 text-sm font-normal normal-case tracking-normal text-ink"
              >
                <option value="All">All statuses</option>
                {STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Location
              <select
                aria-label="Filter projects by location"
                value={zone}
                onChange={(event) => setZone(event.target.value)}
                className="h-10 min-w-0 rounded-xl border border-line bg-white px-3 text-sm font-normal normal-case tracking-normal text-ink"
              >
                <option value="All">All locations</option>
                {ZONES.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            {activeFilters.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setType("All");
                  setStatus("All");
                  setZone("All");
                }}
                className="justify-self-start text-xs font-medium text-burgundy underline sm:col-span-3"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </details>
        <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-muted sm:text-[11px]">
          {filtered.length} project{filtered.length === 1 ? "" : "s"}
        </p>
        {filtered.length === 0 ? (
          <p className="mt-8 text-sm text-ink/70 sm:text-base">
            Nothing in that combination yet. Clear a filter or pick another zone.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            {filtered.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        )}
      </section>
      <CtaBand title="Discuss your project" />
    </>
  );
}
