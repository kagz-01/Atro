import { Link } from "@tanstack/react-router";
import { Camera, Clock, MapPin, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRevealOnScroll } from "@/hooks/use-reveal";

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
  const { ref, revealed } = useRevealOnScroll();

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone/60 to-paper" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
      </div>

      <div ref={ref} className={cn("relative mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16 py-20 md:py-28 reveal-on-scroll", revealed && "revealed")}>
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[11px] uppercase tracking-[0.2em] text-green-700">Live from site</p>
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-maroon">See what we are building now.</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 stagger">
          {LIVE_PROJECTS.map((project, i) => {
            const { ref: cardRef, revealed: cardRevealed } = useRevealOnScroll();
            return (
              <div
                key={project.name}
                ref={cardRef}
                className={cn(
                  "reveal-on-scroll group bg-paper border border-line/50 rounded-2xl overflow-hidden card-lift hover:border-gold/30",
                  cardRevealed && "revealed",
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Image with progress overlay */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 via-maroon/20 to-transparent" />

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                    <div
                      className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-1000"
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
                      <h3 className="font-display text-2xl text-maroon group-hover:text-burgundy transition-colors duration-300">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted">
                        <MapPin className="size-3.5" />
                        <span>{project.location}</span>
                      </div>
                    </div>
                    <div className="size-10 rounded-full bg-maroon/5 flex items-center justify-center group-hover:bg-gold/10 transition-colors duration-300">
                      <ArrowUpRight className="size-4 text-maroon group-hover:text-gold transition-colors" />
                    </div>
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
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-2xl">
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
