import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Building2, CheckCircle2, ChevronDown, MapPin, Truck } from "lucide-react";
import { KenyaMap } from "@/components/kenya-map";
import { PageHero } from "@/components/page-hero";
import { ZoneTable } from "@/components/zone-table";
import { Button } from "@/components/ui/button";
import { useSiteStore } from "@/lib/store";
import {
  AVAILABILITY_ORDER,
  availabilityFor,
  funnelsByStatus,
  type Availability,
  type ZoneFunnel,
} from "@/lib/zones";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/zones/")({
  component: ZonesPage,
  head: () => ({
    meta: [
      { title: "Where we build — Zone coverage | ATRO" },
      {
        name: "description",
        content:
          "ATRO coverage across Nairobi, Kiambu, Machakos, Kajiado, the Coast, Nakuru and Kisumu — with an honest answer on whether we build in your county and what happens when you enquire.",
      },
    ],
  }),
});

const STATUS_HEADING: Record<string, string> = {
  active: "Building here now",
  limited: "Limited capacity",
  request: "By request only",
  diaspora: "Managed from abroad",
};

const STATUS_INTRO: Record<string, string> = {
  active:
    "Counties where we are running sites this year. Send a brief and we will review scope, site conditions and timing before discussing a project-specific proposal.",
  limited:
    "Counties we build in, with a cap on how many projects we take on at once so no site gets half the attention.",
  request:
    "Counties we assess before we commit. We will tell you plainly whether your particular site is one we can resource.",
  diaspora:
    "Anywhere in Kenya, for clients who are not on the continent. The same site management, plus a live record you can open from anywhere.",
};

const LOCAL_EDGE = [
  {
    icon: Truck,
    title: "Local supply and logistics",
    body: "Cement, block and reinforcement availability depends on suppliers, haulage distance and quarry supply. We confirm current rates against the actual site instead of applying a county multiplier.",
  },
  {
    icon: Building2,
    title: "Site visits are part of it",
    body: "You can come to the site. Inspections, material checks and contractor meetings happen in person — the thing a diaspora client cannot do is exactly what a local client should be using.",
  },
  {
    icon: CheckCircle2,
    title: "Retention, enforced in person",
    body: "An agreed retention amount can be held against defects and released once they are closed. The contract should set the amount and release conditions. Locally, that is leverage we can actually use.",
  },
];

function AvailabilityBadge({ availability }: { availability: Availability }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full border px-2 text-[8px] font-bold uppercase tracking-[0.08em] sm:h-7 sm:px-3 sm:text-[10px] sm:tracking-[0.14em]",
        availability.tone === "green" && "bg-emerald-50 text-emerald-800 border-emerald-200",
        availability.tone === "amber" && "bg-amber-50 text-amber-900 border-amber-300",
        availability.tone === "slate" && "bg-stone-100 text-stone-700 border-stone-300",
      )}
    >
      {availability.label}
    </span>
  );
}

function ZoneCard({ funnel }: { funnel: ZoneFunnel }) {
  const { zone, availability } = funnel;
  return (
    <li className="min-w-0 rounded-2xl border border-ink/10 bg-white transition-colors hover:border-burgundy/40 sm:rounded-3xl">
      <details className="group">
        <summary className="list-none cursor-pointer p-3 marker:hidden sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-base leading-tight text-maroon sm:text-2xl">{zone.name}</h3>
              <p className="mt-1 text-[9px] leading-tight text-muted sm:text-[12px]">{zone.region}</p>
            </div>
            <AvailabilityBadge availability={availability} />
          </div>
          <p className="mt-2 line-clamp-2 text-[10px] leading-snug text-ink/65 group-open:line-clamp-none sm:mt-4 sm:text-[14px] sm:leading-relaxed">
            {funnel.localNote}
          </p>
          <span className="mt-2 flex items-center justify-between text-[8px] font-semibold uppercase tracking-[0.1em] text-burgundy sm:text-[10px] sm:tracking-[0.14em]">
            More about {zone.name}
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
          </span>
        </summary>

        <div className="border-t border-ink/8 px-3 pb-3 pt-2.5 sm:px-5 sm:pb-5 sm:pt-4">
          <dl className="space-y-2 text-[10px] sm:text-[12px]">
            <div>
              <dt className="text-muted">Typical work</dt>
              <dd className="text-ink/70">{zone.typical}</dd>
            </div>
          </dl>
          <p className="mt-3 rounded-xl bg-cream p-2.5 text-[10px] leading-snug text-ink/60 sm:mt-4 sm:p-3.5 sm:text-[12px] sm:leading-relaxed">
            {availability.promise}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-5 sm:gap-2.5">
            <Button asChild size="sm">
              <Link to="/start" search={{ zone: zone.slug }}>
                {availability.cta}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/zones/$slug" params={{ slug: zone.slug }}>
                Coverage detail
              </Link>
            </Button>
          </div>
        </div>
      </details>
    </li>
  );
}

function ZonesPage() {
  const selected = useSiteStore((s) => s.selectedZone);
  const setZone = useSiteStore((s) => s.setSelectedZone);
  const [local, setLocal] = useState(selected);

  return (
    <>
      <PageHero
        kicker="Zone coverage"
        title="Where we take on projects across Kenya."
        lede="Location affects access, materials, approvals and delivery requirements. Check our published coverage and the practical considerations for your area."
        image="/catalog/images/school.webp"
      />

      {/* Map first: pick where you are */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 pt-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
              Current delivery areas
            </p>
            <h2 className="mt-2 font-display text-3xl text-maroon md:text-4xl">
              Explore our published coverage
            </h2>
          </div>
          {local ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setLocal(null);
                setZone("nairobi");
              }}
            >
              Clear selection
            </Button>
          ) : null}
        </div>

        <div className="mt-8">
          <KenyaMap
            selected={local}
            onSelect={(slug) => {
              setLocal(slug);
              setZone(slug);
            }}
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-cream p-5">
          <p className="max-w-2xl text-sm leading-relaxed text-ink/70">
            The map shows ATRO's published delivery areas, not county boundaries. Search any of Kenya's 47 counties in the coverage tool; new enquiries are reviewed before availability is confirmed.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link to="/tools/zone-map">
              Search all 47 counties
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {local ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-gold/5 p-6">
            <div>
              <p className="flex items-center gap-2 font-display text-lg text-maroon">
                <MapPin className="size-4" />
                {funnelsByStatus("active")
                  .concat(funnelsByStatus("limited"), funnelsByStatus("request"), funnelsByStatus("diaspora"))
                  .find((f) => f.zone.slug === local)?.zone.name}
              </p>
              <p className="mt-1.5 text-[13px] text-ink/65">
                {availabilityFor(
                  funnelsByStatus("active")
                    .concat(funnelsByStatus("limited"), funnelsByStatus("request"), funnelsByStatus("diaspora"))
                    .find((f) => f.zone.slug === local)?.zone.status ?? "active",
                ).promise}
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/start" search={{ zone: local }}>
                Start here
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : null}
      </section>

      {/* Coverage by availability, honestly grouped */}
      <section className="mx-auto max-w-[1400px] px-6 py-10 sm:px-8 md:px-12 md:py-16 lg:px-16">
        {AVAILABILITY_ORDER.map((status) => {
          const rows = funnelsByStatus(status);
          if (rows.length === 0) return null;
          return (
            <div key={status} className="mb-9 last:mb-0 md:mb-14">
              <div className="max-w-3xl">
                <h2 className="font-display text-3xl text-maroon md:text-4xl">
                  {STATUS_HEADING[status]}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/65">
                  {STATUS_INTRO[status]}
                </p>
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 xl:grid-cols-3">
                {rows.map((funnel) => (
                  <ZoneCard key={funnel.zone.slug} funnel={funnel} />
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* What being local actually buys you */}
      <section className="bg-stone/50 py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
              If you are building here
            </p>
            <h2 className="mt-3 font-display text-3xl text-maroon md:text-4xl">
              Three things you can do that we cannot do for someone overseas
            </h2>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-3">
            {LOCAL_EDGE.map((edge) => (
              <li key={edge.title} className="rounded-2xl border border-ink/10 bg-white p-3 sm:rounded-3xl sm:p-6">
                <span className="flex size-8 items-center justify-center rounded-xl bg-maroon/10 text-maroon sm:size-11 sm:rounded-2xl">
                  <edge.icon className="size-4 sm:size-5" />
                </span>
                <h3 className="mt-3 font-display text-xs leading-tight text-maroon sm:mt-5 sm:text-lg">{edge.title}</h3>
                <p className="mt-2 line-clamp-4 text-[10px] leading-snug text-ink/65 sm:text-[14px] sm:leading-relaxed">{edge.body}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/start">Start a project</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/diaspora">Building from abroad instead</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* The detail table stays: it is what procurement people want */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16">
        <h2 className="font-display text-3xl text-maroon md:text-4xl">Coverage matrix</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/65">
          Logistics, lead times and the practical detail behind each county.
        </p>
        <div className="mt-8">
          <ZoneTable />
        </div>
      </section>
    </>
  );
}