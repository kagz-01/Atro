import { Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { MapPin, CheckCircle, Clock, AlertCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ZONES, type Zone, type ZoneStatus } from "@/lib/site";
import { KENYA_COUNTIES, type KenyaCounty } from "@/lib/counties";

const STATUS_CONFIG: Record<
  ZoneStatus,
  { icon: typeof MapPin; color: string; bg: string; hex: string; label: string }
> = {
  active: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-500",
    hex: "#22c55e",
    label: "Active delivery",
  },
  limited: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-500",
    hex: "#f59e0b",
    label: "Limited availability",
  },
  request: {
    icon: AlertCircle,
    color: "text-orange-600",
    bg: "bg-orange-500",
    hex: "#f97316",
    label: "By request",
  },
  diaspora: {
    icon: Users,
    color: "text-burgundy",
    bg: "bg-burgundy",
    hex: "#5C1018",
    label: "Remote-first",
  },
};

// Kenya center for initial view
const KENYA_CENTER: [number, number] = [-1.0, 38.0];
const KENYA_ZOOM = 6;

export function ZoneMap({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<Zone | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<KenyaCounty | null>(null);
  const [countySearch, setCountySearch] = useState("");
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
        attributionControl: true,
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
            className:
              "bg-paper text-maroon text-xs font-medium px-2 py-1 rounded-lg shadow-sm border border-line",
          })
          .on("click", () => {
            setSelectedCounty(null);
            setSelected(zone);
          });

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
    const map = mapInstance.current as {
      flyTo: (latlng: [number, number], zoom: number, options?: object) => void;
    };
    map.flyTo([selected.lat, selected.lng], 9, { duration: 1.2 });
  }, [selected]);

  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 gap-8",
        compact ? "lg:grid-cols-2" : "lg:grid-cols-12",
      )}
    >
      {/* Map */}
      <div className={cn("min-w-0", compact ? "order-2" : "order-2 lg:col-span-7 lg:order-1")}>
        <div className="relative bg-cream border border-line rounded-xl overflow-hidden">
          {/* Leaflet map container */}
          <div
            ref={mapRef}
            className="w-full h-[400px] lg:h-[500px]"
            style={{ background: "#e8e0d4" }}
          />

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 bg-paper/90 backdrop-blur-sm border border-line rounded-xl px-4 py-3 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.12em]">
            {Object.entries(STATUS_CONFIG)
              .filter(([k]) => k !== "diaspora")
              .map(([status, config]) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className={cn("size-2 rounded-full", config.bg)} />
                  <span className="text-muted">{config.label}</span>
                </div>
              ))}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Pins and circles show the existing service-area centres; they are illustrative, not county
          boundaries or a promise of service throughout a radius.
        </p>
      </div>

      {/* Zone list / detail */}
      <div className={cn("min-w-0", compact ? "order-1" : "order-1 lg:col-span-5 lg:order-2")}>
        {selectedCounty ? (
          <CountyDetail
            county={selectedCounty}
            onBack={() => {
              setSelectedCounty(null);
              setSelected(null);
            }}
          />
        ) : selected ? (
          <ZoneDetail zone={selected} onBack={() => setSelected(null)} />
        ) : (
          <CountyDirectory
            search={countySearch}
            onSearch={setCountySearch}
            onSelect={(county) => {
              const zone = county.serviceZoneSlug
                ? (ZONES.find((item) => item.slug === county.serviceZoneSlug) ?? null)
                : null;
              setSelected(zone);
              setSelectedCounty(county);
            }}
          />
        )}
      </div>
    </div>
  );
}

function CountyDirectory({
  search,
  onSearch,
  onSelect,
}: {
  search: string;
  onSearch: (value: string) => void;
  onSelect: (county: KenyaCounty) => void;
}) {
  const counties = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return query
      ? KENYA_COUNTIES.filter((county) => county.name.toLocaleLowerCase().includes(query))
      : KENYA_COUNTIES;
  }, [search]);

  return (
    <div>
      <h3 className="font-display text-[1.7rem] leading-none text-maroon">Find your county</h3>
      <p className="mt-2 text-sm text-ink/70">
        Search all 47 counties. We show published delivery areas; elsewhere, availability is
        confirmed after an enquiry.
      </p>
      <p className="mt-2 text-xs text-muted">
        County names follow the{" "}
        <a
          href="https://new.kenyalaw.org/akn/ke/act/2010/constitution/eng@2010-09-03"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-maroon"
        >
          Constitution of Kenya, First Schedule
        </a>
        .
      </p>
      <label className="sr-only" htmlFor="county-search">
        Search counties
      </label>
      <input
        id="county-search"
        type="search"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Search counties, e.g. Nairobi, Kiambu, Mombasa"
        className="mt-5 h-12 w-full rounded-2xl border border-line/60 bg-paper px-4 text-sm text-ink outline-none transition focus:border-burgundy"
      />
      <p className="mt-3 text-xs text-muted" aria-live="polite">
        {counties.length} {counties.length === 1 ? "county" : "counties"}
      </p>
      <ul className="mt-2 max-h-[440px] space-y-2 overflow-y-auto pr-1">
        {counties.map((county) => {
          const zone = county.serviceZoneSlug
            ? ZONES.find((item) => item.slug === county.serviceZoneSlug)
            : undefined;
          return (
            <li key={county.slug}>
              <button
                type="button"
                onClick={() => onSelect(county)}
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-line bg-paper p-3 text-left transition-colors hover:border-burgundy"
              >
                <span>
                  <span className="block font-medium text-maroon">{county.name}</span>
                  {zone ? (
                    <span className="mt-0.5 block text-xs text-muted">{zone.name} area</span>
                  ) : null}
                </span>
                <Badge tone={zone?.status === "active" ? "gold" : zone ? "maroon" : "stone"}>
                  {zone?.coverage ?? "Enquiry first"}
                </Badge>
              </button>
            </li>
          );
        })}
        {counties.length === 0 ? (
          <li className="rounded-xl border border-line bg-paper p-5 text-sm text-muted">
            No county matches that search.
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function CountyDetail({ county, onBack }: { county: KenyaCounty; onBack: () => void }) {
  const zone = county.serviceZoneSlug
    ? ZONES.find((item) => item.slug === county.serviceZoneSlug)
    : undefined;

  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex min-h-12 items-center text-[11px] uppercase tracking-[0.14em] text-burgundy hover:text-maroon"
      >
        ← All counties
      </button>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[1.5rem] leading-none text-maroon">{county.name}</h3>
          {zone ? <p className="mt-1 text-xs text-muted">{zone.name} area</p> : null}
        </div>
        <Badge tone={zone?.status === "active" ? "gold" : zone ? "maroon" : "stone"}>
          {zone?.coverage ?? "Availability unconfirmed"}
        </Badge>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-ink/75">
        {zone
          ? zone.summary
          : "We have not confirmed routine delivery capacity for this county. Tell us about the site and scope; our team will discuss access, timing and fit with you before any commitment."}
      </p>
      {zone?.status === "limited" || zone?.status === "request" || !zone ? (
        <p className="mt-4 rounded-xl border border-line bg-cream p-4 text-sm leading-relaxed text-ink/70">
          This is an enquiry, not a project start or an offer of service. ATRO will review the brief
          with you and confirm whether it can be resourced.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild size="sm" className="min-h-12 sm:min-h-9">
          <Link to="/start" search={{ zone: county.slug }}>
            Request a call about this county
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="min-h-12 sm:min-h-9">
          <Link to="/tools/material-prices">Compare material prices</Link>
        </Button>
        {zone ? (
          <Button asChild size="sm" variant="outline" className="min-h-12 sm:min-h-9">
            <Link to="/zones/$slug" params={{ slug: zone.slug }}>
              Area details
            </Link>
          </Button>
        ) : null}
      </div>
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
        className="mb-4 inline-flex min-h-12 items-center text-[11px] uppercase tracking-[0.14em] text-burgundy hover:text-maroon"
      >
        ← All zones
      </button>

      <div className="flex items-center gap-3 mb-4">
        <config.icon className={cn("size-5", config.color)} />
        <div>
          <h3 className="font-display text-[1.5rem] leading-none text-maroon">{zone.name}</h3>
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
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted mb-3">
            Common questions
          </p>
          {zone.faqs.map((faq, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <p className="font-medium text-sm text-maroon">{faq.q}</p>
              <p className="mt-1 text-sm text-ink/70">{faq.a}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild size="sm" className="min-h-12 sm:min-h-9">
          <Link to="/zones/$slug" params={{ slug: zone.slug }}>
            Full zone page
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="min-h-12 sm:min-h-9">
          <Link to="/start" search={{ zone: zone.slug }}>
            Request a call
          </Link>
        </Button>
      </div>
    </div>
  );
}
