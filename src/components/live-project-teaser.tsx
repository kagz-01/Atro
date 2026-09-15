import { Link } from "@tanstack/react-router";
import { Camera, Clock, MapPin, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LiveProject = {
  name: string;
  location: string;
  progress: number;
  lastUpdate: string;
  image: string;
  milestone: string;
  daysAgo: number;
};

const LIVE_PROJECTS: LiveProject[] = [
  {
    name: "Lavington Frame",
    location: "Lavington, Nairobi",
    progress: 65,
    lastUpdate: "First-floor frame complete. Finishes being priced.",
    image: "/images/site.webp",
    milestone: "Structure",
    daysAgo: 3,
  },
  {
    name: "Ruiru Garden House",
    location: "Ruiru, Kiambu",
    progress: 15,
    lastUpdate: "Foundations underway. Site cleared and set out.",
    image: "/images/kiambu.webp",
    milestone: "Foundations",
    daysAgo: 5,
  },
];

export function LiveProjectTeaser() {
  return (
    <section className="py-20 md:py-28 bg-stone/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Live from site</p>
            </div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">See what we are building now.</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {LIVE_PROJECTS.map((project) => (
            <div
              key={project.name}
              className="group bg-paper border border-line rounded-md overflow-hidden hover:border-burgundy transition-colors"
            >
              {/* Image with progress overlay */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 via-maroon/20 to-transparent" />

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-paper/20">
                  <div
                    className="h-full bg-gold transition-all duration-1000"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                {/* Progress badge */}
                <div className="absolute top-4 left-4">
                  <Badge tone="gold">{project.progress}% complete</Badge>
                </div>

                {/* Milestone badge */}
                <div className="absolute top-4 right-4">
                  <Badge tone="maroon">{project.milestone}</Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl text-maroon group-hover:text-burgundy">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted">
                      <MapPin className="size-3.5" />
                      <span>{project.location}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="size-5 text-muted group-hover:text-burgundy transition-colors shrink-0 mt-1" />
                </div>

                <p className="mt-4 text-sm text-ink/70">{project.lastUpdate}</p>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                  <div className="flex items-center gap-1.5">
                    <Camera className="size-3.5" />
                    <span>Photo update</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    <span>{project.daysAgo} days ago</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/projects">
              View all projects
              <ArrowUpRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
