import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { EnquiryWizard } from "@/components/enquiry-wizard";
import { Badge } from "@/components/ui/badge";
import { useSiteStore } from "@/lib/store";
import { COMPANY, ZONES } from "@/lib/site";
import { defaultWhatsappText, whatsappHref } from "@/lib/whatsapp";

export const Route = createFileRoute("/start")({
  // Read the query through the router, never `window.location`: the server
  // renders this route too and has no window, so /diaspora's links hydrated
  // "Five steps" over a server-rendered "Four steps" — a text mismatch React
  // refuses — and no server-rendered reader ever saw the diaspora variant.
  validateSearch: (search: Record<string, unknown>): { from?: string; zone?: string } => ({
    // `undefined` rather than "": an empty string would ride into the canonical
    // URL (`/start?zone=`) and bounce every visitor through a redirect.
    from: typeof search.from === "string" && search.from ? search.from : undefined,
    zone: typeof search.zone === "string" && search.zone ? search.zone : undefined,
  }),
  component: StartPage,
  head: () => ({
    meta: [
      { title: "Start a project — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Guided enquiry for ATRO: project type, zone, scale and an indicative cost range — then a person.",
      },
    ],
  }),
});

function StartPage() {
  const { from, zone: zoneParam } = Route.useSearch();
  const isDiaspora = from === "diaspora";
  const setSelectedZone = useSiteStore((s) => s.setSelectedZone);

  // A link from a county page carries the county, so the enquiry opens with the
  // right place already chosen rather than making them pick it again.
  useEffect(() => {
    if (zoneParam && ZONES.some((z) => z.slug === zoneParam)) setSelectedZone(zoneParam);
  }, [zoneParam, setSelectedZone]);

  return (
    <main className="pt-32 pb-24">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        {/* Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-burgundy hover:text-maroon mb-8"
        >
          <ArrowLeft className="size-3.5" />
          Home
        </Link>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left: info sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <Badge tone={isDiaspora ? "gold" : "maroon"} className="mb-4">
              {isDiaspora ? "Diaspora enquiry" : "Start a project"}
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl text-maroon">
              {isDiaspora ? "Five steps. Then a person." : "Four steps. Then a person."}
            </h1>
            <p className="mt-5 text-ink/70 text-lg">
              {isDiaspora
                ? "Type, place, scale, contact details, and your situation abroad. We will schedule around your time zone."
                : "Type, place, scale, and how to reach you. You will see an indicative range before you send anything. It is not a quotation."}
            </p>

            {/* Steps preview */}
            <div className="mt-10 space-y-4">
              {[
                { num: "1", title: "Project type", desc: "Residential, commercial, or institutional." },
                { num: "2", title: "Location", desc: "Zone-aware pricing for all 7 regions." },
                { num: "3", title: "Scale & finish", desc: "Area in m² and finish level." },
                { num: "4", title: "Contact details", desc: "Name, phone, email." },
                ...(isDiaspora ? [{ num: "5", title: "Building from abroad", desc: "Country, time zone, Kenya contact, visit plans." }] : []),
              ].map((s) => (
                <div key={s.num} className="flex items-start gap-4">
                  <div className="size-10 rounded-full bg-gradient-to-br from-maroon to-burgundy flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {s.num}
                  </div>
                  <div>
                    <p className="font-medium text-maroon">{s.title}</p>
                    <p className="text-sm text-ink/70">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* What happens next */}
            <div className="mt-10 p-6 bg-cream border border-line/50 rounded-2xl">
              <h3 className="font-display text-lg text-maroon mb-3">What happens next?</h3>
              <ul className="space-y-3 text-sm text-ink/70">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-gold mt-0.5 shrink-0" />
                  <span>You see an indicative cost range instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-gold mt-0.5 shrink-0" />
                  <span>A person at ATRO follows up within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-gold mt-0.5 shrink-0" />
                  <span>{isDiaspora ? "We schedule a video call at a time that works for you" : "We schedule a site visit or video call"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-gold mt-0.5 shrink-0" />
                  <span>No commitment until you approve the quote</span>
                </li>
              </ul>
            </div>

            {/* Contact details */}
            <div className="mt-8 space-y-4">
              <a
                href={whatsappHref(defaultWhatsappText())}
                className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl hover:bg-green-100 transition-colors duration-300"
              >
                <div className="size-10 rounded-full bg-whatsapp/10 flex items-center justify-center">
                  <MessageCircle className="size-5 text-whatsapp" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-green-700">WhatsApp</p>
                  <p className="font-medium text-green-800">{COMPANY.phoneDisplay}</p>
                </div>
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-3 p-4 bg-burgundy/5 border border-burgundy/10 rounded-2xl hover:bg-burgundy/10 transition-colors duration-300"
              >
                <div className="size-10 rounded-full bg-burgundy/10 flex items-center justify-center">
                  <Mail className="size-5 text-burgundy" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-burgundy/70">Email</p>
                  <p className="font-medium text-burgundy">{COMPANY.email}</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-4 bg-stone/50 border border-line/50 rounded-2xl">
                <div className="size-10 rounded-full bg-maroon/10 flex items-center justify-center">
                  <MapPin className="size-5 text-maroon" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Studio</p>
                  <p className="font-medium text-maroon">{COMPANY.address}</p>
                  <p className="text-sm text-ink/70">{COMPANY.hours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: enquiry wizard */}
          <div className="lg:col-span-8">
            <EnquiryWizard forcedDiaspora={isDiaspora} />
          </div>
        </div>
      </div>
    </main>
  );
}
