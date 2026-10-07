import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, MapPin, TrendingUp, FileText, BarChart3, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/tools/")({
  component: ToolsIndex,
  head: () => ({
    meta: [
      { title: `Tools | ${COMPANY.name}` },
      {
        name: "description",
        content: "Interactive tools for construction planning — cost calculator, zone map, material prices and BOQ generator.",
      },
    ],
  }),
});

const TOOLS = [
  {
    icon: Calculator,
    title: "Cost Calculator",
    desc: "Get an instant indicative range for your project. Select type, zone, area and finish level — see where your money goes.",
    link: "/tools/cost-calculator",
    badge: "Popular",
    badgeTone: "gold" as const,
    stats: "5 steps · Instant result",
  },
  {
    icon: MapPin,
    title: "Zone Map",
    desc: "Interactive coverage map. See where ATRO builds, availability, logistics and FAQs for each county.",
    link: "/tools/zone-map",
    badge: "Updated",
    badgeTone: "maroon" as const,
    stats: "8 zones · Real map",
  },
  {
    icon: TrendingUp,
    title: "Material Prices",
    desc: "Current cement, steel, aggregates, timber, tiles and paint prices. Verified from KNBS data — Q1 2026.",
    link: "/tools/material-prices",
    badge: "New",
    badgeTone: "maroon" as const,
    stats: "35 materials · 10 categories",
  },
  {
    icon: FileText,
    title: "BOQ Generator",
    desc: "Generate a preliminary Bill of Quantities from templates or scratch. SMM2-compliant, auto-totals, export.",
    link: "/tools/boq-generator",
    badge: "New",
    badgeTone: "maroon" as const,
    stats: "11 categories · 3 templates",
  },
];

const TRUST = [
  { icon: BarChart3, label: "Verified rates", desc: "KNBS CIPI Q4 2025" },
  { icon: Clock, label: "Q1 2026 data", desc: "Last verified Jan 2026" },
  { icon: Shield, label: "Indicative only", desc: "Not a quotation" },
];

function ToolsIndex() {
  return (
    <main className="pt-32 pb-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        {/* Hero */}
        <div className="max-w-3xl mb-16">
          <Badge tone="maroon" className="mb-4">Tools</Badge>
          <h1 className="font-display text-4xl md:text-5xl text-maroon">
            Plan smarter. Build better.
          </h1>
          <p className="mt-5 text-ink/70 text-lg max-w-xl">
            Interactive tools to help you understand costs, coverage and timelines before you commit.
            All rates verified against Kenya market data.
          </p>

          {/* Trust strip */}
          <div className="mt-8 flex flex-wrap gap-6">
            {TRUST.map((t) => (
              <div key={t.label} className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon">
                  <t.icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-maroon">{t.label}</p>
                  <p className="text-[10px] text-muted">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tool cards — 2x2 grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {TOOLS.map((tool) => (
            <Link
              key={tool.title}
              to={tool.link}
              className="group relative p-7 border border-line/50 bg-cream rounded-2xl hover:border-burgundy/30 hover:shadow-card-hover card-lift transition-all duration-300 overflow-hidden"
            >
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-maroon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className="size-12 rounded-2xl bg-maroon/10 flex items-center justify-center text-maroon group-hover:bg-maroon/15 transition-colors">
                    <tool.icon className="size-5" />
                  </div>
                  <Badge tone={tool.badgeTone}>{tool.badge}</Badge>
                </div>

                <h2 className="font-display text-xl text-maroon group-hover:text-burgundy transition-colors">
                  {tool.title}
                </h2>
                <p className="mt-2 text-sm text-ink/60 leading-relaxed">{tool.desc}</p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[10px] text-muted">{tool.stats}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-burgundy group-hover:text-maroon transition-colors">
                    Open tool
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 md:p-12 bg-maroon text-paper rounded-2xl">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-paper">Need a real quote?</h2>
            <p className="mt-3 text-paper/70">
              These tools give indicative ranges. For a proper BOQ and a number you can build to, talk to a person.
            </p>
            <Button asChild variant="gold" className="mt-6">
              <Link to="/start">
                Start a project
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
