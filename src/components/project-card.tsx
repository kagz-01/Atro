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
      className="group block bg-cream rounded-2xl overflow-hidden card-lift border border-line/50 hover:border-gold/30 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-maroon/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge tone={project.status === "Ongoing" ? "live" : "paper"}>{project.status}</Badge>
        </div>
        {/* Arrow indicator */}
        <div className="absolute bottom-3 right-3 size-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight className="size-4 text-maroon" />
        </div>
      </div>
      <div className="p-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
          {project.type} · {zone?.name ?? project.location}
        </p>
        <h3 className="mt-2 font-display text-xl text-maroon group-hover:text-burgundy transition-colors duration-300">
          {project.name}
        </h3>
        <p className="mt-2 text-sm text-ink/70 line-clamp-2">{project.excerpt}</p>
      </div>
    </Link>
  );
}
