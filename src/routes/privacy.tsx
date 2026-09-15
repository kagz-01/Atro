import { createFileRoute } from "@tanstack/react-router";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: "Privacy — ATRO" }] }),
});

function PrivacyPage() {
  return (
    <article className="pt-28 md:pt-36 pb-20 mx-auto max-w-3xl px-4 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Legal</p>
      <h1 className="mt-3 font-display text-5xl text-maroon">Privacy notice</h1>
      <div className="mt-8 space-y-4 text-ink/80">
        <p>
          ATRO Design & Construction collects enquiry data you submit: name, phone, email, project details and any notes. We use it to respond to you. We do not sell it.
        </p>
        <p>
          Enquiries in this preview are stored on your device (local storage) so you can see the flow. In a production deployment they would be stored on ATRO’s systems and emailed to {COMPANY.email}.
        </p>
        <p>
          We process personal data in line with Kenya’s Data Protection Act, 2019. You may ask to access or erase your enquiry by writing to {COMPANY.email}.
        </p>
        <p>
          This site may use essential cookies for the preview and, in production, analytics with conversion events on forms, CTAs and WhatsApp taps.
        </p>
      </div>
    </article>
  );
}
