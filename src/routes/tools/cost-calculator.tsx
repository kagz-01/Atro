import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CostCalculator } from "@/components/cost-calculator";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/tools/cost-calculator")({
  component: CostCalculatorPage,
  head: () => ({
    meta: [
      { title: `Cost Calculator | ${COMPANY.name}` },
      {
        name: "description",
        content: "Get an instant indicative construction cost range for your project in Kenya. Select type, zone, area and finish level.",
      },
    ],
  }),
});

function CostCalculatorPage() {
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

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left: info */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <Badge tone="maroon" className="mb-4">Cost Calculator</Badge>
            <h1 className="font-display text-4xl md:text-5xl text-maroon">
              What will it cost?
            </h1>
            <p className="mt-5 text-ink/70">
              Six questions. An indicative band. Then a person. We show you the arithmetic instead of hiding behind "it depends."
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">📊</span>
                <div>
                  <p className="font-medium text-maroon">Instant breakdown</p>
                  <p className="text-sm text-ink/70">Structure, finishes, services, professional fees.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">⏱</span>
                <div>
                  <p className="font-medium text-maroon">Timeline estimate</p>
                  <p className="text-sm text-ink/70">How long your project will realistically take.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <p className="font-medium text-maroon">Zone-aware</p>
                  <p className="text-sm text-ink/70">Costs adjusted for your location in Kenya.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: calculator */}
          <div className="lg:col-span-8">
            <CostCalculator />
          </div>
        </div>
      </div>
    </main>
  );
}
