import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ZoneMap } from "@/components/zone-map";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/tools/zone-map")({
  component: ZoneMapPage,
  head: () => ({
    meta: [
      { title: `Zone Map | ${COMPANY.name}` },
      {
        name: "description",
        content: "Interactive map of ATRO's construction coverage across Kenya. See availability, logistics and FAQs for each county.",
      },
    ],
  }),
});

function ZoneMapPage() {
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
          <Badge tone="maroon" className="mb-4">Zone Map</Badge>
          <h1 className="font-display text-4xl md:text-5xl text-maroon">
            Do we build where you are?
          </h1>
          <p className="mt-5 text-ink/70 text-lg">
            ATRO publishes coverage honestly. Tap a county to see availability, logistics and answers to the questions that matter.
          </p>
        </div>

        <ZoneMap />

        {/* CTA */}
        <div className="mt-16 p-8 md:p-12 bg-maroon text-paper rounded-sm">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-paper">Not sure about your zone?</h2>
            <p className="mt-3 text-paper/70">
              Tell us where your plot is. We will tell you whether we can serve it — before you write a long brief.
            </p>
            <Link
              to="/start"
              className="mt-6 inline-flex h-12 px-6 items-center bg-gold text-maroon text-[12px] uppercase tracking-[0.16em] font-medium rounded-xs hover:bg-gold-light"
            >
              Enquire now
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
