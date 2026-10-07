import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { MapPin, CheckCircle, Clock, AlertCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ZONES, type Zone, type ZoneStatus } from "@/lib/site";

const STATUS_CONFIG: Record<ZoneStatus, { icon: typeof MapPin; color: string; bg: string; hex: string; label: string }> = {
  active: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-500", hex: "#22c55e", label: "Active delivery" },
  limited: { icon: Clock, color: "text-amber-600", bg: "bg-amber-500", hex: "#f59e0b", label: "Limited availability" },
  request: { icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-500", hex: "#f97316", label: "By request" },
  diaspora: { icon: Users, color: "text-burgundy", bg: "bg-burgundy", hex: "#5C1018", label: "Remote-first" },
};

// Kenya center for initial view
const KENYA_CENTER: [number, number] = [-1.0, 38.0];
const KENYA_ZOOM = 6;

export function ZoneMap({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<Zone | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let cancelled = false;

    async function initMap() {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;

      // Fix default marker icon paths for bundled builds
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: KENYA_CENTER,
        zoom: KENYA_ZOOM,
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Zoom control top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // Add zone markers
      const kenyaZones = ZONES.filter((z) => z.slug !== "diaspora");
      const markers: unknown[] = [];

      kenyaZones.forEach((zone) => {
        const status = STATUS_CONFIG[zone.status];

        // Create custom icon
        const icon = L.divIcon({
          className: "zone-marker",
          html: `<div class="relative">
            <div class="absolute -inset-2 ${status.bg}/20 rounded-full animate-pulse"></div>
            <div class="relative size-3 ${status.bg} rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-150 transition-transform"></div>
          </div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([zone.lat, zone.lng], { icon })
          .addTo(map)
          .bindTooltip(zone.name, {
            permanent: false,
            direction: "top",
            offset: [0, -8],
            className: "bg-paper text-maroon text-xs font-medium px-2 py-1 rounded-lg shadow-sm border border-line",
          })
          .on("click", () => setSelected(zone));

        markers.push(marker);
      });

      // Draw coverage circles
      kenyaZones.forEach((zone) => {
        const status = STATUS_CONFIG[zone.status];
        const radius = zone.status === "active" ? 60000 : zone.status === "limited" ? 40000 : 25000;
        L.circle([zone.lat, zone.lng], {
          radius,
          color: status.hex,
          fillColor: status.hex,
          fillOpacity: 0.08,
          weight: 1,
          opacity: 0.25,
        }).addTo(map);
      });

      mapInstance.current = map;
      markersRef.current = markers;
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Fly to selected zone
  useEffect(() => {
    if (!selected || !mapInstance.current) return;
    const map = mapInstance.current as { flyTo: (latlng: [number, number], zoom: number, options?: object) => void };
    map.flyTo([selected.lat, selected.lng], 9, { duration: 1.2 });
  }, [selected]);

  return (
    <div className={cn("grid gap-8", compact ? "lg:grid-cols-2" : "lg:grid-cols-12")}>
      {/* Map */}
      <div className={cn(compact ? "order-2" : "lg:col-span-7")}>
        <div className="relative bg-cream border border-line rounded-xl overflow-hidden">
          {/* Leaflet map container */}
          <div
            ref={mapRef}
            className="w-full h-[400px] lg:h-[500px]"
            style={{ background: "#e8e0d4" }}
          />

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 bg-paper/90 backdrop-blur-sm border border-line rounded-xl px-4 py-3 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.12em]">
            {Object.entries(STATUS_CONFIG).filter(([k]) => k !== "diaspora").map(([status, config]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn("size-2 rounded-full", config.bg)} />
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
            className="w-full text-left p-4 border border-line rounded-xl hover:border-burgundy bg-paper transition-colors"
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
    <div className="bg-paper border border-line rounded-xl p-6">
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
