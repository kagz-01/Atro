// ATRO — local delivery funnel.
//
// The zone registry says where we work and how active we are in each county. This
// turns that into the answer a Kenyan actually needs: can you build here, what does
// it cost, and what happens when I get in touch. The honest part is the availability
// — telling someone in Nakuru that a quote needs a conversation is better than
// taking their money and explaining it in month three.

import { estimateCost } from "@/lib/cost";
import { ZONES, type Zone, type ZoneStatus } from "@/lib/site";

export type Availability = {
  /** Short label used on cards and badges. */
  label: string;
  /** What actually happens when this person makes contact. */
  promise: string;
  /** The call to action that matches the promise. */
  cta: string;
  tone: "green" | "amber" | "slate";
};

const AVAILABILITY: Record<ZoneStatus, Availability> = {
  active: {
    label: "Building here now",
    promise:
      "We are running sites in this county this year. Send the brief and you will get an indicative range and a programme, not a brochure.",
    cta: "Start a project",
    tone: "green",
  },
  limited: {
    label: "Limited capacity",
    promise:
      "We build here, but we take on a limited number of projects so a site never gets half the attention. Your enquiry starts with a call about fit and timing — we will say so plainly if we are not right this year.",
    cta: "Ask about capacity",
    tone: "amber",
  },
  request: {
    label: "By request",
    promise:
      "We assess before we commit. First we look at the site, the access and the services, then we tell you whether we can resource it properly and what it would take. Some sites we say no to, and that is cheaper for both of us.",
    cta: "Request an assessment",
    tone: "slate",
  },
  diaspora: {
    label: "Managed from abroad",
    promise:
      "For clients overseas: the same site management, with the project portal, weekly written reports and milestone payments so you can see progress without being on site.",
    cta: "See the Abroad service",
    tone: "green",
  },
};

export type ZoneFunnel = {
  zone: Zone;
  availability: Availability;
  /** Indicative band for a standard 220 m² house, from the same engine as the calculator. */
  indicativeMin: number;
  indicativeMax: number;
  /** What is genuinely different about building here. */
  localNote: string;
};

const LOCAL_NOTES: Record<string, string> = {
  nairobi:
    "Access and neighbour conditions decide the sequence more than the design does. Urban infill is planned around a live street, which is why it is costed before anything is demolished.",
  kiambu:
    "Soil varies sharply across the county and drives foundation cost more than the building above it. A geotechnical report is worth more than any allowance.",
  machakos:
    "Long haul distances and quarry supply move the rate more than labour. Concrete and block pricing here is not a Nairobi number with a surcharge.",
  kajiado:
    "Water is the first question on most sites, then access. Both are answered in due diligence, not discovered during construction.",
  coast:
    "Salt air changes specification: marine-grade fixings, appropriate finishes, and faster corrosion on anything untreated. Building standard, not building standard-plus.",
  nakuru:
    "Altitude, cold and access to materials all shape the programme. We assess each site rather than assuming a Nakuru rate applies to the whole county.",
  kisumu:
    "We work here selectively. The honest first step is a site assessment so we both know whether the project is one we can resource properly.",
  diaspora:
    "Everything a local client gets, plus a live record: milestones with photographic evidence, a payment ledger with retention, and a private portal you open from anywhere.",
};

export function zoneFunnels(): ZoneFunnel[] {
  return ZONES.map((zone) => {
    const estimate = estimateCost({
      type: "Residential",
      zone: zone.slug,
      sqm: 220,
      finish: "standard",
    });
    return {
      zone,
      availability: AVAILABILITY[zone.status],
      indicativeMin: estimate.min,
      indicativeMax: estimate.max,
      localNote: LOCAL_NOTES[zone.slug] ?? zone.coverage,
    };
  });
}

export function zoneFunnel(slug: string): ZoneFunnel | undefined {
  return zoneFunnels().find((f) => f.zone.slug === slug);
}

export function availabilityFor(status: ZoneStatus): Availability {
  return AVAILABILITY[status];
}

export const AVAILABILITY_ORDER: ZoneStatus[] = ["active", "limited", "request", "diaspora"];

export function funnelsByStatus(status: ZoneStatus): ZoneFunnel[] {
  return zoneFunnels().filter((f) => f.zone.status === status);
}

const TONE_CLASS: Record<Availability["tone"], string> = {
  green: "bg-emerald-50 text-emerald-800 border-emerald-200",
  amber: "bg-amber-50 text-amber-900 border-amber-300",
  slate: "bg-stone-100 text-stone-700 border-stone-300",
};

export function toneClass(tone: Availability["tone"]): string {
  return TONE_CLASS[tone];
}

const KES = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

export function formatBand(min: number, max: number): string {
  return `KES ${KES.format(min)} – ${KES.format(max)}`;
}