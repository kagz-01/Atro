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
          "Completed, ongoing and proposed projects by ATRO across Nairobi, Kiambu, the Coast and beyond.",
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
const STATUSES: Array<ProjectStatus | "All"> = ["All", "Completed", "Ongoing", "Proposed"];

function ProjectsPage() {
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [zone, setZone] = useState("All");

  const filtered = useMemo(() => {
    return PROJECTS.filter((p) => {
      if (type !== "All" && p.type !== type) return false;
      if (status !== "All" && p.status !== status) return false;
      if (zone !== "All" && p.zone !== zone) return false;
      return true;
    });
  }, [type, status, zone]);

  return (
    <>
      <PageHero
        kicker="Work"
        title="Projects, tagged to the ground they stand on."
        lede="Filter by type, status and zone. Ongoing work is labelled ongoing — never dressed as finished."
        image="/images/karen.webp"
      />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex flex-col gap-4">
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
        <p className="mt-8 text-[11px] uppercase tracking-[0.16em] text-muted">
          {filtered.length} project{filtered.length === 1 ? "" : "s"}
        </p>
        {filtered.length === 0 ? (
          <p className="mt-8 text-ink/70">Nothing in that combination yet. Clear a filter or pick another zone.</p>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted w-16">{label}</span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`h-10 px-3 text-[11px] uppercase tracking-[0.12em] border rounded-xs ${
            value === opt
              ? "bg-burgundy text-paper border-burgundy"
              : "border-line text-ink hover:border-burgundy"
          }`}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}
