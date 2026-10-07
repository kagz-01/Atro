import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/fees")({
  component: FeesPage,
  head: () => ({
    meta: [
      { title: "Fees & payment terms — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "How ATRO Design & Construction structures fees, how stage payments and retention work, and how clients based outside Kenya pay for a project.",
      },
    ],
  }),
});

const UPDATED = "February 2026";

function FeesPage() {
  return (
    <LegalPage
      slug="/fees"
      title="Fees & payment terms"
      lede="How we charge, when you pay, and how money reaches a project in Kenya from abroad. Published upfront so there are no surprises mid-build."
      updated={UPDATED}
      intro={
        <>
          Construction in Kenya usually fails on cash flow, not on ideas. So the
          single most useful thing we can do is tell you in advance exactly how
          payment will work — including what it costs to send money from overseas.
          This page explains the structure. Your specific schedule goes into your
          contract, and only that contract binds either of us.
        </>
      }
      sections={[
        {
          id: "how-fees-are-set",
          heading: "How fees are set",
          body: (
            <>
              <p>
                Every project is priced individually. We do not publish a price
                list, because a correct figure depends on your plot, your design, the
                zone, the finish level and the ground — not on square metres alone.
              </p>
              <p>
                Our fees fall into three categories, and a proposal always tells
                you which applies:
              </p>
              <ul className="ml-5 list-disc space-y-3 marker:text-gold">
                <li>
                  <strong>Fixed fee</strong> — for defined scopes, typically
                  consultancy, feasibility, measured drawings or a construction
                  contract of settled scope. You know the total before we start.
                </li>
                <li>
                  <strong>Stage fee</strong> — where scope is still developing.
                  Charged by stage so you fund real deliverables rather than time.
                </li>
                <li>
                  <strong>Time charge</strong> — for open-ended advisory or
                  troubleshooting work, billed hourly against an agreed cap.
                </li>
              </ul>
              <p>
                Provisional sums, where used, are marked as such and billed at cost
                with receipts. They are not a fixed price and we will not hide a
                variation inside one.
              </p>
            </>
          ),
        },
        {
          id: "what-quotes-exclude",
          heading: "What every quote excludes",
          body: (
            <>
              <p>
                Exclusions are where two quotes that look identical differ by
                hundreds of thousands. Ours are always listed in writing, and these
                are the usual ones:
              </p>
              <ul className="ml-5 list-disc space-y-2 marker:text-gold">
                <li>Land purchase cost, and any legal fees on the title.</li>
                <li>
                  Statutory and statutory-adjacent charges — county building permit
                  and development permission, NEMA licence, utility connections, and
                  county market or building levies.
                </li>
                <li>
                  Statutory professional fees where these are appointed separately,
                  including quantity surveying, structural engineering, and EIA.
                </li>
                <li>
                  Financing costs, and any lender&apos;s inspection or supervision
                  fee.
                </li>
                <li>
                  Furniture, fixtures and equipment, landscaping, swimming pools,
                  generators and solar systems unless expressly included.
                </li>
                <li>
                  Extraordinary ground conditions — rock, a high water table, or
                  contaminated soil — until the site has been investigated and
                  re-costed.
                </li>
                <li>
                  Local authority or agency delays outside our control. We pursue
                  them, but the programme moves.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "stage-payments",
          heading: "Stage payments and how work is certified",
          body: (
            <>
              <p>
                On construction contracts we do not use arbitrary instalments. Work
                is measured against the contract bill of quantities, and payment
                falls due only once the work is done and certified:
              </p>
              <ol className="ml-5 list-decimal space-y-3 marker:text-gold/70">
                <li>
                  <strong>Advance.</strong> A mobilisation payment against the
                  signed agreement and, where needed, a performance guarantee. This
                  is the only meaningful prepayment in the whole project.
                </li>
                <li>
                  <strong>Interim certificates.</strong> Periodically — usually
                  monthly — the supervising quantity surveyor measures work actually
                  completed and issues a certificate. You pay against the
                  certificate, not against a schedule.
                </li>
                <li>
                  <strong>Retention.</strong> A customary{" "}
                  <strong>5–10%</strong> of each interim payment is held back. It is
                  not a penalty and it is not our money — it protects you against
                  defects being left unresolved at the end.
                </li>
                <li>
                  <strong>Practical completion and defects period.</strong> On
                  handover you pay the final amount less retention. Defects are
                  notified during the agreed defects period, and retention is
                  released once they are closed out.
                </li>
              </ol>
              <p>
                You receive every certificate, and we will explain any line on it.
                If you want an independent check on our measurements, we welcome
                it — your own quantity surveyor should be able to read the same
                bill of quantities we do.
              </p>
            </>
          ),
        },
        {
          id: "paying-from-abroad",
          heading: "Paying for a project from outside Kenya",
          body: (
            <>
              <p>
                Many clients never return to Kenya during a build. This works, but
                it needs a deliberate setup — and it needs to be agreed at the
                start, not improvised.
              </p>
              <p>
                <strong>Bank transfer (SWIFT).</strong> The standard route, and the
                one we recommend for anything sizeable. Clear, traceable, and it
                creates a record both sides can rely on. Expect correspondent bank
                fees and exchange rate margins.
              </p>
              <p>
                <strong>Payment service providers.</strong> Services built for
                diaspora remittances are usually cheaper and faster than a
                traditional wire. They work well for the stage payments that are
                moderate in size.
              </p>
              <p>
                <strong>Currency.</strong> Most Kenyan suppliers and contractors
                price and settle in Kenyan shillings. We will quote in KES, and
                where you pay in another currency you carry the exchange risk unless
                the contract says otherwise. We will tell you plainly if the
                exchange rate makes a stage payment materially different for you.
              </p>
              <p>
                <strong>Documents you will need.</strong> Expect to supply a
                certificate of residence or proof of address, a source-of-funds
                letter for larger transfers, and identification, because the bank
                will ask — not us.
              </p>
            </>
          ),
        },
        {
          id: "accounts",
          heading: "How you should pay us",
          body: (
            <>
              <p>
                Every payment request from us will state the amount, the stage it
                relates to, the invoice number, and our{" "}
                <strong>company account details</strong>. Paying against an invoice
                is the safest arrangement for you, because the bank transaction is
                your proof that you did.
              </p>
              <p>
                <strong>We never ask for:</strong>
              </p>
              <ul className="ml-5 list-disc space-y-2 marker:text-gold">
                <li>Payment to a personal or third-party account.</li>
                <li>Payment by mobile money number, crypto wallet, or gift card.</li>
                <li>
                  A deposit or &quot;reservation fee&quot; before drawings, a bill of
                  quantities and a signed agreement exist.
                </li>
                <li>
                  Cash, for any project payment, in any circumstances.
                </li>
              </ul>
              <p>
                If you receive a payment request on any of these terms that
                purports to come from us, it is not from us. Call{" "}
                <a
                  href={`tel:${COMPANY.phoneTel}`}
                  className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                >
                  {COMPANY.phoneDisplay}
                </a>{" "}
                before you act — see our{" "}
                <a
                  href="/scam-warning"
                  className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                >
                  scam warning
                </a>
                .
              </p>
            </>
          ),
        },
        {
          id: "changes-costs",
          heading: "Variations and cost changes",
          body: (
            <>
              <p>
                A construction project changes. Someone opens a wall and finds
                something, a client adds a feature, a price moves. We handle this
                one way only:
              </p>
              <ul className="ml-5 list-disc space-y-2 marker:text-gold">
                <li>
                  Variations are <strong>priced in writing before work starts</strong>,
                  with the effect on programme and cost.
                </li>
                <li>
                  Work already instructed is not varied retrospectively, and we do
                  not vary for our own error.
                </li>
                <li>
                  You receive interim statements showing progress, expenditure to
                  date, and what remains.
                </li>
                <li>
                  Material price movements are dealt with in the contract — either
                  fixed, or with a stated adjustment mechanism and a defined
                  threshold. Unagreed escalation does not happen.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "vat",
          heading: "VAT and taxes",
          body: (
            <p>
              Figures on this site and in our indicative tools are shown excluding
              VAT unless we say otherwise. VAT is applied where legally required.
              Statutory fees payable to county governments and statutory agencies are
              passed through at cost with receipts, not marked up.
            </p>
          ),
        },
        {
          id: "no-appointment",
          heading: "Prices quoted before a survey",
          body: (
            <p>
              A price given before we have seen the site, the drawings and the
              ground is an estimate, and we will always label it as one. Our cost
              calculator and bill of quantity tools are built to give you a
              realistic order of magnitude and a sensible shortlist — not a figure
              you should build a contract around.
            </p>
          ),
        },
      ]}
      callout={{
        heading: "Ask us these before you pay anyone",
        body: (
          <>
            <p>
              Is this a fixed fee or time charge? What exactly is excluded? What are
              the stage payments and against what certificate are they released?
              What retention applies and when is it released? What is my remedy if
              work is late or defective? Whose account do I pay, and is it the
              company&apos;s?
            </p>
            <p>
              A studio that answers all six without hesitation is one that has done
              this before.
            </p>
          </>
        ),
      }}
    />
  );
}
