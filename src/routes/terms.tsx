import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Terms — ATRO" }] }),
});

function TermsPage() {
  return (
    <article className="pt-28 md:pt-36 pb-20 mx-auto max-w-3xl px-4 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Legal</p>
      <h1 className="mt-3 font-display text-5xl text-maroon">Terms of use</h1>
      <div className="mt-8 space-y-4 text-ink/80">
        <p>
          This website describes ATRO Design & Construction’s services. Nothing on it is a quotation, a contract, or professional sign-off. Indicative cost ranges are illustrative and exclude land, statutory fees and extraordinary ground conditions.
        </p>
        <p>
          Drawings, photographs and project descriptions are published with permission. Do not reproduce them without asking. Client information, addresses and values are withheld unless we have written consent.
        </p>
        <p>
          Statutory and regulated roles are carried by the licensed professionals appointed on a given project. This site does not imply a registration that has not been stated.
        </p>
        <p>
          WhatsApp and email enquiries are an invitation to talk, not an appointment until we confirm one.
        </p>
      </div>
    </article>
  );
}
