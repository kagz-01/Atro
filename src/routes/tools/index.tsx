import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, TrendingUp, FileText, BarChart3, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMPANY, MYHARDWARE_URL } from "@/lib/site";

export const Route = createFileRoute("/tools/")({
  component: ToolsIndex,
  head: () => ({
    meta: [
      { title: `Tools | ${COMPANY.name}` },
      {
        name: "description",
        content: "Construction planning tools: PPRA material-price references for five surveyed towns, coverage search for all 47 Kenyan counties, and a preliminary BOQ worksheet.",
      },
    ],
  }),
});

const TOOLS = [
  {
    icon: TrendingUp,
    title: "Material Price Reference",
    desc: "Compare dated PPRA unit prices for common building materials across five surveyed towns.",
    longDesc: "Use this to check an individual material reference before requesting current supplier quotations.",
    link: "/tools/material-prices",
    badge: "Reference",
    badgeTone: "maroon" as const,
    stats: "11 items · 5 surveyed towns",
    useCase: "Check dated unit prices",
    output: "PPRA reference prices by town",
    limit: "No whole-project estimate",
  },
  {
    icon: MapPin,
    title: "Zone Map",
    desc: "Checks where ATRO is actively delivering, where availability is limited, and where a conversation is still required.",
    longDesc: "This is the location filter for the larger decision: can the project be supported in your county and what is the likely route to service?",
    link: "/tools/zone-map",
    badge: "Coverage",
    badgeTone: "maroon" as const,
    stats: "47 counties · Enquiry first",
    useCase: "Service fit",
    output: "County-by-county delivery status",
    limit: "Not a legal or boundary map",
  },
  {
    icon: FileText,
    title: "BOQ Worksheet",
    desc: "Creates a preliminary quantities worksheet for early planning, not a final tender or payment schedule.",
    longDesc: "Use it to organize scope sections and enter your own measured quantities and rates. A quantity surveyor should verify scope and pricing before you treat it as a project cost plan.",
    link: "/tools/boq-generator",
    badge: "Draft",
    badgeTone: "maroon" as const,
    stats: "11 work sections · Unpriced templates",
    useCase: "Quantity framing",
    output: "Editable scope and priced line subtotals",
    limit: "Not a complete project total or tender-ready BOQ",
  },
];

const TRUST = [
  { icon: BarChart3, label: "Early planning", desc: "Use dated item prices carefully" },
  { icon: Clock, label: "Check the date", desc: "Reference prices are dated" },
  { icon: Shield, label: "Human review", desc: "Call before any commitment" },
];

function ToolsIndex() {
  return (
    <main className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        {/* Hero */}
        <div className="mb-8 max-w-3xl md:mb-16">
          <Badge tone="maroon" className="mb-3 md:mb-4">Tools</Badge>
          <h1 className="font-display text-[2.5rem] md:text-[3.3rem] leading-[0.92] tracking-[-0.05em] text-maroon">
            Plan your build without invented totals.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-ink/70 sm:text-base md:mt-5 md:text-lg">
            Compare dated material references, check service coverage and frame measured quantities. No generic whole-project price is generated.
          </p>

          {/* Trust strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6 md:mt-8">
            {TRUST.map((t) => (
              <div key={t.label} className="flex min-w-0 items-center gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-maroon/10 text-maroon sm:size-9">
                  <t.icon className="size-3.5 sm:size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-maroon">{t.label}</p>
                  <p className="text-[10px] text-muted">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[#d7c7a8] bg-[#f8f1e5] p-4 sm:mb-10 sm:rounded-[1.8rem] sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy">Materials support</p>
              <h2 className="mt-2 font-display text-xl leading-tight text-maroon sm:text-2xl md:text-[2.5rem]">
                Need product comparison or sourcing help?
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-ink/70 sm:text-sm md:mt-3 md:text-base">
                MyHardware is a complementary materials platform for clients who want a simpler route to product comparison, suppliers and build-package checks alongside ATRO project planning.
              </p>
            </div>
            <a
              href={MYHARDWARE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-maroon px-3 py-2.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-[#5b1c26] sm:gap-2 sm:px-5 sm:text-[11px] sm:tracking-[0.14em]"
            >
              Open MyHardware
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>

        {/* Tool cards — 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {TOOLS.map((tool) => (
            <Link
              key={tool.title}
              to={tool.link}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line/60 bg-cream p-3 transition-all duration-300 hover:border-burgundy/35 hover:shadow-card-hover sm:rounded-[1.8rem] sm:p-5 lg:p-7"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-maroon/5 via-transparent to-gold/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex h-full flex-col">
                <div className="mb-3 flex items-start justify-between gap-2 sm:mb-5 sm:gap-4">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-maroon/10 text-maroon transition-colors group-hover:bg-maroon/15 sm:size-12 sm:rounded-2xl">
                    <tool.icon className="size-4 sm:size-5" />
                  </div>
                  <Badge tone={tool.badgeTone} className="px-2 py-1 text-[8px] sm:text-[10px]">{tool.badge}</Badge>
                </div>

                <div className="mb-2 flex items-center justify-between gap-2 sm:mb-4 sm:gap-4">
                  <h2 className="font-display text-sm leading-tight text-maroon sm:text-2xl sm:leading-none">{tool.title}</h2>
                </div>

                <p className="line-clamp-3 text-[10px] leading-snug text-ink/70 sm:text-sm sm:leading-relaxed">{tool.desc}</p>

                <div className="mt-3 rounded-xl border border-line/50 bg-paper/60 p-2 sm:mt-5 sm:rounded-2xl sm:p-3">
                  <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-muted sm:text-[9px] sm:tracking-[0.16em]">Best used for</p>
                  <p className="mt-1 text-[10px] font-medium leading-tight text-maroon sm:mt-2 sm:text-sm">{tool.useCase}</p>
                </div>

                <div className="mt-3 space-y-1 text-[9px] leading-snug text-ink/60 sm:mt-5 sm:space-y-2 sm:text-sm">
                  <p className="hidden sm:block">
                    <span className="font-medium text-ink">Output:</span> {tool.output}
                  </p>
                  <p className="line-clamp-2">
                    <span className="font-medium text-ink">Limit:</span> {tool.limit}
                  </p>
                </div>

                <div className="mt-auto pt-3 sm:pt-5">
                  <div className="flex items-center justify-between gap-2 border-t border-line/40 pt-3 sm:gap-4 sm:pt-4">
                    <span className="hidden text-[10px] uppercase leading-tight tracking-[0.16em] text-muted sm:block">{tool.stats}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[8px] uppercase tracking-[0.08em] text-burgundy sm:text-[11px] sm:tracking-[0.14em]">
                      Open tool
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl bg-maroon p-4 text-paper sm:mt-16 sm:p-8 md:p-12">
          <div className="max-w-xl">
            <h2 className="font-display text-xl text-paper sm:text-3xl">Ready to discuss a project?</h2>
            <p className="mt-2 text-sm text-paper/70 sm:mt-3">
              Send an enquiry and ATRO will contact you to discuss the site, capacity and next steps. A project does not start from a tool result.
            </p>
            <Button asChild variant="gold" className="mt-6">
              <Link to="/start">
                Request a call
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
