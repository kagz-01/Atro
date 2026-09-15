import { createFileRoute } from "@tanstack/react-router";
import { EnquiryWizard } from "@/components/enquiry-wizard";
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
    <section className="pt-28 md:pt-36 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Start a project</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Four steps. Then a person.</h1>
          <p className="mt-4 text-ink/75">
            Type, place, scale, and how to reach you. You will see an indicative range before you send anything. It is not a quotation.
          </p>
          <div className="mt-8 space-y-3 text-sm">
            <p>
              <span className="text-muted uppercase tracking-[0.14em] text-[11px] block">WhatsApp</span>
              <a className="text-burgundy" href={whatsappHref(defaultWhatsappText())}>
                {COMPANY.phoneDisplay}
              </a>
            </p>
            <p>
              <span className="text-muted uppercase tracking-[0.14em] text-[11px] block">Email</span>
              <a className="text-burgundy" href={`mailto:${COMPANY.email}`}>
                {COMPANY.email}
              </a>
            </p>
            <p>
              <span className="text-muted uppercase tracking-[0.14em] text-[11px] block">Studio</span>
              {COMPANY.address} · {COMPANY.hours}
            </p>
          </div>
        </div>
        <div className="lg:col-span-8">
          <EnquiryWizard />
        </div>
      </div>
    </section>
  );
}
