import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MaterialPrices } from "@/components/material-prices";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/tools/material-prices")({
  component: MaterialPricesPage,
  head: () => ({
    meta: [
      { title: `Material Prices | ${COMPANY.name}` },
      {
        name: "description",
        content: "Current construction material prices in Kenya — cement, steel, aggregates, timber, tiles, paint and more. Verified Q1 2026.",
      },
    ],
  }),
});

function MaterialPricesPage() {
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
          <Badge tone="maroon" className="mb-4">Material Prices</Badge>
          <h1 className="font-display text-4xl md:text-5xl text-maroon">
            What do materials cost?
          </h1>
          <p className="mt-5 text-ink/70 text-lg">
            Current market prices for construction materials across Kenya. Verified from KNBS data and market surveys — Q1 2026.
          </p>
        </div>

        <MaterialPrices />

        {/* CTA */}
        <div className="mt-16 p-8 md:p-12 bg-maroon text-paper rounded-sm">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-paper">Need a proper cost plan?</h2>
            <p className="mt-3 text-paper/70">
              These prices are indicative. A real BOQ locks in quantities, rates and procurement timing — before you spend on site.
            </p>
            <Link
              to="/start"
              className="mt-6 inline-flex h-12 px-6 items-center bg-gold text-maroon text-[12px] uppercase tracking-[0.16em] font-medium rounded-xs hover:bg-gold-light"
            >
              Start a project
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
