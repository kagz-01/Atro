import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BoqGenerator } from "@/components/boq-generator";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/tools/boq-generator")({
  component: BoqGeneratorPage,
  head: () => ({
    meta: [
      { title: `BOQ Generator | ${COMPANY.name}` },
      {
        name: "description",
        content: "Generate a preliminary Bill of Quantities for your construction project. SMM2-compliant, Kenya rates, export to file.",
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
          <Badge tone="maroon" className="mb-4">BOQ Generator</Badge>
          <h1 className="font-display text-4xl md:text-5xl text-maroon">
            Build your Bill of Quantities
          </h1>
          <p className="mt-5 text-ink/70 text-lg">
            Start from a template or build from scratch. 11 SMM2 categories, auto-totals, KES rates, export to file.
          </p>
        </div>

        <BoqGenerator />

        {/* CTA */}
        <div className="mt-16 p-8 md:p-12 bg-maroon text-paper rounded-sm">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-paper">This is a starting point</h2>
            <p className="mt-3 text-paper/70">
              A preliminary BOQ helps you plan. For a tender-ready document, a registered quantity surveyor should verify quantities, rates and specifications on site.
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
