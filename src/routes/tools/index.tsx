import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, MapPin, TrendingUp, FileText } from "lucide-react";
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
        content: "Interactive tools for construction planning — cost calculator, zone map, material prices and more.",
      },
    ],
  }),
});

const TOOLS = [
  {
    icon: <Calculator className="size-6" />,
    title: "Cost Calculator",
    desc: "Get an instant indicative range for your project. Select type, zone, area and finish level — see where your money goes.",
    link: "/tools/cost-calculator",
    badge: "Popular",
  },
  {
    icon: <MapPin className="size-6" />,
    title: "Zone Map",
    desc: "Interactive coverage map. See where ATRO builds, availability status, logistics and FAQs for each county.",
    link: "/tools/zone-map",
    badge: null,
  },
  {
    icon: <TrendingUp className="size-6" />,
    title: "Material Prices",
    desc: "Current cement, steel, timber and aggregate prices by county. Updated regularly from market data.",
    link: "/tools/material-prices",
    badge: "New",
  },
  {
    icon: <FileText className="size-6" />,
    title: "BOQ Generator",
    desc: "Generate a preliminary Bill of Quantities from your project parameters. Download as PDF.",
    link: "/tools/boq-generator",
    badge: "Coming soon",
  },
];

function ToolsIndex() {
  return (
    <main className="pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <Badge tone="maroon" className="mb-4">Tools</Badge>
          <h1 className="font-display text-4xl md:text-5xl text-maroon">
            Plan smarter. Build better.
          </h1>
          <p className="mt-5 text-ink/70 text-lg">
            Interactive tools to help you understand costs, coverage and timelines before you commit.
          </p>
        </div>

        {/* Tool cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.title}
              to={tool.link}
              className="group p-8 border border-line bg-cream rounded-sm hover:border-burgundy transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="size-12 rounded-sm bg-maroon/10 flex items-center justify-center text-maroon">
                  {tool.icon}
                </div>
                {tool.badge && (
                  <Badge tone={tool.badge === "Coming soon" ? "stone" : "gold"}>
                    {tool.badge}
                  </Badge>
                )}
              </div>
              <h2 className="mt-6 font-display text-2xl text-maroon group-hover:text-burgundy transition-colors">
                {tool.title}
              </h2>
              <p className="mt-3 text-sm text-ink/70">{tool.desc}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-burgundy group-hover:text-maroon">
                Open tool <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 md:p-12 bg-maroon text-paper rounded-sm">
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
