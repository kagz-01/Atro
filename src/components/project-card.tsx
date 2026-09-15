import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/site";
import { ZONES } from "@/lib/site";

export function ProjectCard({ project }: { project: Project }) {
  const zone = ZONES.find((z) => z.slug === project.zone);
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group block border border-line bg-cream rounded-sm overflow-hidden hover:border-burgundy transition-colors"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge tone={project.status === "Ongoing" ? "live" : "paper"}>{project.status}</Badge>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
          {project.type} · {zone?.name ?? project.location}
        </p>
        <h3 className="mt-2 font-display text-2xl text-maroon group-hover:text-burgundy">
          {project.name}
        </h3>
        <p className="mt-2 text-sm text-ink/70">{project.excerpt}</p>
      </div>
    </Link>
  );
}
