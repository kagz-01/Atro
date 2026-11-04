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

const TYPES: Array<ProjectType | "All"> = [
  "All",
  "Residential",
  "Commercial",
  "Institutional",
  "Church",
  "School",
  "Renovation",
];
const STATUSES: Array<ProjectStatus | "All"> = [
  "All",
  "Completed",
  "Ongoing",
  "In design",
  "Proposed",
  "Illustrative",
];

function ProjectsPage() {
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [zone, setZone] = useState("All");

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
        title="Projects, tagged to the ground they stand on."
        lede="Explore catalogue-backed projects and illustrative design concepts. Filter by type, status and location."
        image="/catalog/images/karen.webp"
      />
      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 md:px-12 lg:px-16 lg:py-12">
        <div className="flex flex-col gap-3 sm:gap-4">
          <FilterRow label="Type" value={type} onChange={setType} options={TYPES} />
          <FilterRow label="Status" value={status} onChange={setStatus} options={STATUSES} />
          <FilterRow
            label="Zone"
            value={zone}
            onChange={setZone}
            options={["All", ...ZONES.map((z) => z.slug)]}
            labels={{ All: "All", ...Object.fromEntries(ZONES.map((z) => [z.slug, z.name])) }}
          />
        </div>
        <p className="mt-8 text-[10px] uppercase tracking-[0.16em] text-muted sm:text-[11px]">
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

function FilterRow<T extends string>({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly T[] | T[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <span className="w-full text-[10px] uppercase tracking-[0.16em] text-muted sm:w-16 sm:text-[11px]">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`h-9 rounded-full border px-2.5 text-[9px] font-medium uppercase tracking-[0.12em] transition-colors sm:h-10 sm:px-3 sm:text-[11px] ${
              value === opt
                ? "border-burgundy bg-burgundy text-paper"
                : "border-line text-ink hover:border-burgundy hover:text-burgundy"
            }`}
          >
            {labels?.[opt] ?? opt}
          </button>
        ))}
      </div>
    </div>
  );
}
