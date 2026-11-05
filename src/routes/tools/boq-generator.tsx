import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BoqGenerator } from "@/components/boq-generator";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/tools/boq-generator")({
  component: BoqGeneratorPage,
  head: () => ({
    meta: [
      { title: `BOQ Worksheet | ${COMPANY.name}` },
      {
        name: "description",
        content: "Draft an unpriced construction quantities worksheet. Templates contain no assumed quantities or rates; add measured quantities and current project-specific quotations.",
      },
    ],
  }),
});

function BoqGeneratorPage() {
  return (
    <main className="pt-32 pb-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        {/* Breadcrumb */}
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-burgundy hover:text-maroon mb-8"
        >
          <ArrowLeft className="size-3.5" />
          All tools
        </Link>

        <div className="max-w-2xl mb-12">
          <Badge tone="maroon" className="mb-4">BOQ Worksheet</Badge>
          <h1 className="font-display text-4xl md:text-5xl text-maroon">
            Draft a quantities worksheet
          </h1>
          <p className="mt-5 text-ink/70 text-lg">
            Templates provide scope prompts only: they contain no assumed quantities or prices. Enter measured quantities and current project-specific rates; any displayed subtotal covers only the lines you have priced.
          </p>
        </div>

        <BoqGenerator />

        {/* CTA */}
        <div className="mt-16 p-8 md:p-12 bg-maroon text-paper rounded-sm">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-paper">Need a measured cost plan?</h2>
            <p className="mt-3 text-paper/70">
              This worksheet is only a starting point. For a tender-ready BOQ or project cost plan, a quantity surveyor should verify scope, quantities, specifications and current rates.
            </p>
            <Link
              to="/start"
              className="mt-6 inline-flex h-12 px-6 items-center bg-gold text-maroon text-[12px] uppercase tracking-[0.16em] font-medium rounded-xs hover:bg-gold-light"
            >
              Talk to a QS
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
