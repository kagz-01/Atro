import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MaterialPrices } from "@/components/material-prices";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/tools/cost-calculator")({
  component: MaterialPriceReferencePage,
  head: () => ({
    meta: [
      { title: `Material Price Reference | ${COMPANY.name}` },
      {
        name: "description",
        content:
          "Compare dated PPRA construction material-price references for Nairobi, Mombasa, Kisumu, Nakuru and Eldoret. No whole-project totals.",
      },
    ],
  }),
});

function MaterialPriceReferencePage() {
  return (
    <main className="pt-24 pb-24 sm:pt-32">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 md:px-12 lg:px-16">
        <Link
          to="/tools"
          className="mb-8 inline-flex min-h-12 items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-burgundy hover:text-maroon"
        >
          <ArrowLeft className="size-3.5" />
          All tools
        </Link>

        <div className="mb-10 max-w-3xl">
          <Badge tone="maroon" className="mb-4">
            Material Price Reference
          </Badge>
          <h1 className="font-display text-4xl text-maroon md:text-5xl">
            What do common materials cost?
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink/70">
            Compare published unit prices for surveyed towns. These are historical market
            references, not supplier quotes or a construction budget.
          </p>
        </div>

        <MaterialPrices />
      </div>
    </main>
  );
}
