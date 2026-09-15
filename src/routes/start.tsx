import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, Mail, MapPin, Clock, Shield, FileText, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { EnquiryWizard } from "@/components/enquiry-wizard";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/site";
import { defaultWhatsappText, whatsappHref } from "@/lib/whatsapp";

export const Route = createFileRoute("/start")({
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
  return (
    <main className="pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16">
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
            <Badge tone="gold" className="mb-4">Start a project</Badge>
            <h1 className="font-display text-4xl md:text-5xl text-maroon">
              Four steps. Then a person.
            </h1>
            <p className="mt-5 text-ink/70 text-lg">
              Type, place, scale, and how to reach you. You will see an indicative range before you send anything. It is not a quotation.
            </p>

            {/* Steps preview */}
            <div className="mt-10 space-y-4">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-gradient-to-br from-maroon to-burgundy flex items-center justify-center text-white text-sm font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-maroon">Project type</p>
                  <p className="text-sm text-ink/70">Residential, commercial, or institutional.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-gradient-to-br from-maroon to-burgundy flex items-center justify-center text-white text-sm font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-maroon">Location</p>
                  <p className="text-sm text-ink/70">Zone-aware pricing for all 7 regions.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-gradient-to-br from-maroon to-burgundy flex items-center justify-center text-white text-sm font-bold shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-maroon">Scale & finish</p>
                  <p className="text-sm text-ink/70">Area in m² and finish level.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-gradient-to-br from-maroon to-burgundy flex items-center justify-center text-white text-sm font-bold shrink-0">
                  4
                </div>
                <div>
                  <p className="font-medium text-maroon">Contact details</p>
                  <p className="text-sm text-ink/70">Name, phone, email.</p>
                </div>
              </div>
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
                  <span>We schedule a site visit or video call</span>
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
            <EnquiryWizard />
          </div>
        </div>
      </div>
    </main>
  );
}
