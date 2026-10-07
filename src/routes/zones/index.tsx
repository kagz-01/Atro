import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KenyaMap } from "@/components/kenya-map";
import { CtaBand, PageHero } from "@/components/page-hero";
import { ZoneTable } from "@/components/zone-table";
import { useSiteStore } from "@/lib/store";

export const Route = createFileRoute("/zones/")({
  component: ZonesPage,
  head: () => ({
    meta: [
      { title: "Where we build — Zone Intelligence | ATRO" },
      {
        name: "description",
        content:
          "ATRO coverage across Nairobi, Kiambu, Machakos, Kajiado, the Coast, Nakuru and diaspora-managed Kenyan projects.",
      },
    ],
  }),
});

function ZonesPage() {
  const selected = useSiteStore((s) => s.selectedZone);
  const setZone = useSiteStore((s) => s.setSelectedZone);
  const [local, setLocal] = useState(selected);

  return (
    <>
      <PageHero
        kicker="Zone intelligence"
        title="We publish where we build. Then we route the enquiry."
        lede="Kenya is not one market. Soil, haulage, county desks and salt air all change the building. Pick a zone — or tell us you are abroad."
        image="/images/school.webp"
      />
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16">
        <KenyaMap
          selected={local}
          onSelect={(slug) => {
            setLocal(slug);
            setZone(slug);
          }}
        />
        <h2 className="mt-16 font-display text-3xl text-maroon mb-6">Coverage matrix</h2>
        <ZoneTable />
      </section>
      <CtaBand title="Check your site with us" />
    </>
  );
}
