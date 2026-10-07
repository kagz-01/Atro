import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Building2, CheckCircle2, MapPin, Truck } from "lucide-react";
import { KenyaMap } from "@/components/kenya-map";
import { PageHero } from "@/components/page-hero";
import { ZoneTable } from "@/components/zone-table";
import { Button } from "@/components/ui/button";
import { useSiteStore } from "@/lib/store";
import {
  AVAILABILITY_ORDER,
  availabilityFor,
  formatBand,
  funnelsByStatus,
  type Availability,
  type ZoneFunnel,
} from "@/lib/zones";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/zones/")({
  component: ZonesPage,
  head: () => ({
    meta: [
      { title: "Where we build — Zone coverage and cost | ATRO" },
      {
        name: "description",
        content:
          "ATRO coverage across Nairobi, Kiambu, Machakos, Kajiado, the Coast, Nakuru and Kisumu — with an honest answer on whether we build in your county, what it costs there, and what happens when you enquire.",
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
    "Counties we are running sites in this year. Send a brief and you get an indicative range and a programme.",
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
    title: "Material pricing, county by county",
    body: "Cement, block and reinforcement are not a Nairobi number with a surcharge. Haulage distance and quarry supply move the rate, and we quote from what your site actually costs to supply.",
  },
  {
    icon: Building2,
    title: "Site visits are part of it",
    body: "You can come to the site. Inspections, material checks and contractor meetings happen in person — the thing a diaspora client cannot do is exactly what a local client should be using.",
  },
  {
    icon: CheckCircle2,
    title: "Retention, enforced in person",
    body: "5–10% is held against defects and is not payable until they close. Locally, that is leverage we can actually use.",
  },
];

function AvailabilityBadge({ availability }: { availability: Availability }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-3 text-[10px] font-bold uppercase tracking-[0.14em]",
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
    <li className="flex flex-col rounded-3xl border border-ink/10 bg-white p-6 transition-colors hover:border-burgundy/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl text-maroon">{zone.name}</h3>
          <p className="mt-1 text-[12px] text-muted">{zone.region}</p>
        </div>
        <AvailabilityBadge availability={availability} />
      </div>

      <p className="mt-4 flex-1 text-[14px] leading-relaxed text-ink/65">
        {funnel.localNote}
      </p>

      <dl className="mt-5 space-y-2 border-t border-ink/8 pt-4 text-[12px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Indicative, 220 m² house</dt>
          <dd className="text-right text-maroon">{formatBand(funnel.indicativeMin, funnel.indicativeMax)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Typical work</dt>
          <dd className="text-right text-ink/70">{zone.typical}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-xl bg-cream p-3.5 text-[12px] leading-relaxed text-ink/60">
        {availability.promise}
      </p>

      <div className="mt-5 flex flex-wrap gap-2.5">
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
        title="Where we build, and what that means for your money"
        lede="Kenya is not one market. Soil, haulage, county desks and salt air all change the building — and whether we can take your project at all. This page says both, plainly."
        image="/images/school.webp"
      />

      {/* Map first: pick where you are */}
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 pt-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
              Pick your county
            </p>
            <h2 className="mt-2 font-display text-3xl text-maroon md:text-4xl">
              Start where the site is
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
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16">
        {AVAILABILITY_ORDER.map((status) => {
          const rows = funnelsByStatus(status);
          if (rows.length === 0) return null;
          return (
            <div key={status} className="mb-14 last:mb-0">
              <div className="max-w-3xl">
                <h2 className="font-display text-3xl text-maroon md:text-4xl">
                  {STATUS_HEADING[status]}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/65">
                  {STATUS_INTRO[status]}
                </p>
              </div>
              <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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

          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {LOCAL_EDGE.map((edge) => (
              <li key={edge.title} className="rounded-3xl border border-ink/10 bg-white p-6">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-maroon/10 text-maroon">
                  <edge.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg text-maroon">{edge.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink/65">{edge.body}</p>
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