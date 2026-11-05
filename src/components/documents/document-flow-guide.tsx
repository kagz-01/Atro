import type { DocumentKind } from "@/lib/invoices";

type DocumentFlowGuideProps = {
  audience: "studio" | "client";
  kind?: DocumentKind;
  status?: string;
};

const flow = [
  {
    title: "Quotation",
    detail:
      "Sets out the proposed scope, priced items, assumptions, exclusions and validity date. It is an offer, not a tax invoice or signed engagement.",
  },
  {
    title: "Written engagement",
    detail:
      "The client accepts the offer and both parties sign the engagement terms. The agreed quotation total is used to set up the project budget and payment stages.",
  },
  {
    title: "Stage confirmation",
    detail:
      "Construction/renovation: inspected and measured work is certified. Design and other services: the agreed deliverable or fee stage is confirmed under the signed engagement.",
  },
  {
    title: "Payment request",
    detail:
      "Requests the confirmed amount through the client portal. Until ATRO issues through eTIMS, this is explicitly not a tax invoice.",
  },
  {
    title: "Receipt",
    detail:
      "Confirms money received after the payment provider confirms settlement. It does not replace an eTIMS tax invoice.",
  },
  {
    title: "Statement of account",
    detail:
      "Summarises paid amounts, confirmed stages awaiting payment and any contract retention. It is a project position, not a new charge.",
  },
];

const documentPurpose: Record<DocumentKind, string> = {
  quotation:
    "This is the priced offer. Review its scope, assumptions, exclusions, validity and tax treatment before agreeing in writing.",
  certificate:
    "For construction/renovation, this records work certified for payment under the project agreement. Check the stage and amount before paying.",
  payment_request:
    "This asks for payment under a confirmed project stage. It is not an eTIMS tax invoice.",
  invoice:
    "A tax invoice requires its eTIMS control reference. ATRO cannot issue one from this system without that reference.",
  receipt:
    "This confirms a payment the provider has reported as settled. Keep it with the signed agreement and any eTIMS tax invoice.",
  statement:
    "This is a running project position. It distinguishes payments, certified amounts awaiting payment and retention; it is not itself a demand.",
};

export function DocumentFlowGuide({ audience, kind, status }: DocumentFlowGuideProps) {
  const purpose =
    kind === "quotation" && status === "accepted"
      ? "ATRO has linked this quotation to a signed engagement. The signed agreement governs the work; this quotation records the priced scope."
      : kind === "quotation" && status === "expired"
        ? "This quotation has expired and is no longer a current offer. Ask ATRO for an updated quotation before proceeding."
        : kind === "quotation" && status === "declined"
          ? "This quotation was declined. It does not authorize work or payment."
          : kind
            ? documentPurpose[kind]
            : "";

  return (
    <aside className="rounded-2xl border border-ink/10 bg-cream p-4 sm:p-5">
      <h3 className="font-display text-lg text-maroon">
        {audience === "studio" ? "How quotations and payments flow" : "How project paperwork works"}
      </h3>
      {kind ? (
        <p className="mt-2 rounded-xl border border-gold/30 bg-white px-3 py-2 text-xs leading-relaxed text-ink/70">
          <strong className="text-maroon">
            This {kind.replace("_", " ")}
            {status ? ` (${status})` : ""}:
          </strong>{" "}
          {purpose}
        </p>
      ) : null}

      {audience === "studio" ? (
        <div className="mt-3 space-y-2 rounded-xl border border-gold/30 bg-white p-3 text-xs leading-relaxed text-ink/70">
          <p>
            <strong className="text-maroon">Before issuing a quotation:</strong> base the scope on
            confirmed client requirements, current drawings or measured information. Price each
            item from a verified BOQ, current supplier/subcontractor price or agreed professional
            fee. State the source date, assumptions and exclusions; never turn an area estimate or
            old example into a live price.
          </p>
          <p>
            <strong className="text-maroon">Record acceptance:</strong> the form issues the offer;
            it does not capture an e-signature. Confirm the client accepted it and the engagement
            was signed before opening a project or generating payment stages.
          </p>
        </div>
      ) : null}

      <ol className="mt-4 grid gap-3 sm:grid-cols-2">
        {flow.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-maroon text-[10px] font-semibold text-white">
              {index + 1}
            </span>
            <span className="text-xs leading-relaxed text-ink/65">
              <strong className="text-maroon">{step.title}.</strong> {step.detail}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-4 border-t border-ink/10 pt-3 text-[11px] leading-relaxed text-ink/55">
        The document body is frozen when issued. If a correction is needed, ATRO voids the old
        document with a reason and issues a new numbered copy.
      </p>
    </aside>
  );
}
