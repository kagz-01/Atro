import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPinned, Search, ShieldCheck } from "lucide-react";
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
        content:
          "Search all 47 Kenyan counties, review ATRO's published delivery areas and enquire about availability elsewhere.",
      },
    ],
  }),
});

function ZoneMapPage() {
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

        <div className="grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          <div className="min-w-0 lg:col-span-4 lg:sticky lg:top-24">
            <Badge tone="maroon" className="mb-4">
              Zone Map
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl text-maroon">
              Do we build where you are?
            </h1>
            <p className="mt-5 text-ink/70 text-lg">
              Search any county and see where ATRO is actively delivering, where work is
              programme-limited, and where a site conversation is still required.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-maroon/10 text-maroon">
                  <MapPinned className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-maroon">Coverage by county</p>
                  <p className="text-sm text-ink/70">
                    Every county is searchable, but only active areas are treated as routine
                    delivery.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-maroon/10 text-maroon">
                  <Search className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-maroon">Quick fit check</p>
                  <p className="text-sm text-ink/70">
                    Use it to decide whether the idea is still viable before investing in drawings
                    or a full brief.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-maroon/10 text-maroon">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-maroon">Honest service status</p>
                  <p className="text-sm text-ink/70">
                    This tool avoids false certainty. A county can still become a project after a
                    proper review.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-8">
            <ZoneMap />
          </div>
        </div>

        <div className="mt-16 p-8 md:p-12 bg-maroon text-paper rounded-[1.75rem]">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-paper">
              Every project starts with a conversation
            </h2>
            <p className="mt-3 text-paper/70">
              Tell us the county and a little about the site. ATRO will discuss availability,
              logistics and next steps before any commitment.
            </p>
            <Link
              to="/start"
              className="mt-6 inline-flex h-12 px-6 items-center bg-gold text-maroon text-[12px] uppercase tracking-[0.16em] font-medium rounded-full hover:bg-gold-light"
            >
              Request a call
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
