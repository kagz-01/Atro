import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, CheckCircle, Clock, AlertCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ZONES, type Zone, type ZoneStatus } from "@/lib/site";

const STATUS_CONFIG: Record<ZoneStatus, { icon: typeof MapPin; color: string; label: string }> = {
  active: { icon: CheckCircle, color: "text-green-600", label: "Active delivery" },
  limited: { icon: Clock, color: "text-amber-600", label: "Limited availability" },
  request: { icon: AlertCircle, color: "text-orange-600", label: "By request" },
  diaspora: { icon: Users, color: "text-burgundy", label: "Remote-first" },
};

export function ZoneMap({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<Zone | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className={cn("grid gap-8", compact ? "lg:grid-cols-2" : "lg:grid-cols-12")}>
      {/* Map */}
      <div className={cn(compact ? "order-2" : "lg:col-span-7")}>
        <div className="relative bg-cream border border-line rounded-md p-6 overflow-hidden">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-auto max-h-[500px]"
            aria-label="Interactive map of Kenya showing ATRO coverage zones"
          >
            {/* Kenya outline (simplified) */}
            <path
              d="M30,15 L50,10 L70,15 L85,25 L90,40 L85,55 L80,65 L75,80 L65,90 L50,95 L35,90 L25,80 L20,65 L15,50 L20,35 L25,25 Z"
              className="fill-stone/30 stroke-line stroke-1"
            />

            {/* Zone markers */}
            {ZONES.map((zone) => {
              const status = STATUS_CONFIG[zone.status];
              const isActive = selected?.slug === zone.slug || hovered === zone.slug;
              return (
                <g
                  key={zone.slug}
                  className="cursor-pointer"
                  onMouseEnter={() => setHovered(zone.slug)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(zone)}
                >
                  {/* Pulse ring for active zones */}
                  {zone.status === "active" && (
                    <circle
                      cx={zone.cx}
                      cy={zone.cy}
                      r={isActive ? 6 : 4}
                      className="fill-green-500/20 animate-pulse"
                    />
                  )}
                  {/* Main dot */}
                  <circle
                    cx={zone.cx}
                    cy={zone.cy}
                    r={isActive ? 4 : 3}
                    className={cn(
                      "transition-all duration-200",
                      zone.status === "active" && "fill-green-500",
                      zone.status === "limited" && "fill-amber-500",
                      zone.status === "request" && "fill-orange-500",
                      zone.status === "diaspora" && "fill-burgundy",
                    )}
                  />
                  {/* Label */}
                  <text
                    x={zone.cx}
                    y={zone.cy - 6}
                    textAnchor="middle"
                    className={cn(
                      "text-[4px] font-medium fill-ink transition-opacity",
                      isActive ? "opacity-100" : "opacity-70",
                    )}
                  >
                    {zone.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.12em]">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn("size-2 rounded-full", config.color.replace("text-", "bg-"))} />
                <span className="text-muted">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone list / detail */}
      <div className={cn(compact ? "order-1" : "lg:col-span-5")}>
        {selected ? (
          <ZoneDetail zone={selected} onBack={() => setSelected(null)} />
        ) : (
          <ZoneList zones={ZONES} onSelect={setSelected} />
        )}
      </div>
    </div>
  );
}

function ZoneList({ zones, onSelect }: { zones: Zone[]; onSelect: (z: Zone) => void }) {
  return (
    <div className="space-y-2">
      <h3 className="font-display text-2xl text-maroon mb-4">Where we build</h3>
      <p className="text-sm text-ink/70 mb-6">
        Tap a county to see coverage, logistics and FAQs.
      </p>
      {zones.map((zone) => {
        const config = STATUS_CONFIG[zone.status];
        return (
          <button
            key={zone.slug}
            type="button"
            onClick={() => onSelect(zone)}
            className="w-full text-left p-4 border border-line rounded-sm hover:border-burgundy bg-paper transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <config.icon className={cn("size-4", config.color)} />
                <div>
                  <p className="font-medium text-maroon">{zone.name}</p>
                  <p className="text-xs text-muted">{zone.region}</p>
                </div>
              </div>
              <Badge tone={zone.status === "active" ? "gold" : "maroon"}>
                {zone.coverage}
              </Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ZoneDetail({ zone, onBack }: { zone: Zone; onBack: () => void }) {
  const config = STATUS_CONFIG[zone.status];

  return (
    <div className="bg-paper border border-line rounded-md p-6">
      <button
        type="button"
        onClick={onBack}
        className="text-[11px] uppercase tracking-[0.14em] text-burgundy hover:text-maroon mb-4"
      >
        ← All zones
      </button>

      <div className="flex items-center gap-3 mb-4">
        <config.icon className={cn("size-5", config.color)} />
        <div>
          <h3 className="font-display text-2xl text-maroon">{zone.name}</h3>
          <p className="text-xs text-muted">{zone.region}</p>
        </div>
      </div>

      <Badge tone="gold">{zone.coverage}</Badge>

      <p className="mt-4 text-sm text-ink/80">{zone.summary}</p>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Typical projects</p>
          <p className="mt-1 text-sm text-ink/80">{zone.typical}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Logistics</p>
          <p className="mt-1 text-sm text-ink/80">{zone.logistics}</p>
        </div>
      </div>

      {zone.faqs.length > 0 && (
        <div className="mt-6 pt-6 border-t border-line">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted mb-3">Common questions</p>
          {zone.faqs.map((faq, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <p className="font-medium text-sm text-maroon">{faq.q}</p>
              <p className="mt-1 text-sm text-ink/70">{faq.a}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild size="sm">
          <Link to="/zones/$slug" params={{ slug: zone.slug }}>
            Full zone page
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/start">Start a project here</Link>
        </Button>
      </div>
    </div>
  );
}
