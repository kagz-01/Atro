import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/site";
import { ZONES } from "@/lib/site";
import { ArrowUpRight } from "lucide-react";

export function ProjectCard({ project }: { project: Project }) {
  const zone = ZONES.find((z) => z.slug === project.zone);

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      aria-label={`Read about ${project.name}`}
      className="group block overflow-hidden rounded-[1.25rem] border border-line/50 bg-white shadow-card transition-all duration-300 hover:border-gold/30 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
    >
      <div className="relative aspect-square overflow-hidden bg-stone sm:aspect-[4/3]">
        <img
          src={project.image}
          alt={
            project.status === "Illustrative"
              ? `Illustrative concept image for ${project.name}`
              : project.name
          }
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone={project.status === "Ongoing" ? "live" : "paper"}>
            {project.status === "Illustrative" ? "Illustrative concept" : project.status}
          </Badge>
        </div>
        <div className="absolute bottom-3 right-3 flex size-10 translate-y-2 items-center justify-center rounded-full bg-white/90 text-maroon opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </div>
      </div>

      <div className="p-3 sm:p-5 lg:p-6">
        <p className="text-[8px] uppercase tracking-[0.12em] text-muted sm:text-[11px] sm:tracking-[0.16em]">
          {project.type} · {zone?.name ?? project.location}
        </p>
        <h3 className="mt-2 font-display text-sm leading-tight text-maroon transition-colors duration-300 group-hover:text-burgundy sm:text-xl">
          {project.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-ink/70 sm:mt-2 sm:text-sm sm:leading-relaxed">
          {project.excerpt}
        </p>
      </div>
    </Link>
  );
}
