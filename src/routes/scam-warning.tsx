import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/scam-warning")({
  component: ScamWarningPage,
  head: () => ({
    meta: [
      { title: "Scam warning & how to verify ATRO — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "How to confirm you are dealing with ATRO Design & Construction, the fraud methods used against Kenyans building from abroad, and the approaches we will never take.",
      },
    ],
  }),
});

const UPDATED = "February 2026";

function ScamWarningPage() {
  return (
    <LegalPage
      slug="/scam-warning"
      title="Scam warning"
      lede="If you are building in Kenya from another country, you need this page. Fraud against diaspora homeowners is common, and it is usually preceded by a request for money. Here is how to check us — and how to check anyone."
      updated={UPDATED}
      intro={
        <>
          We publish this because the people who most often lose money in
          construction fraud are people doing exactly the right thing: they are
          careful, they ask questions, and they genuinely want their build to
          succeed. Scammers rely on the fact that verifying properly is harder than
          trusting. It is not — it just takes one phone call.
        </>
      }
      sections={[
        {
          id: "verify-us",
          heading: "How to confirm you are dealing with ATRO",
          body: (
            <>
              <p>
                Before you send money, documents or your logbook, verify. Every
                detail below is public and can be checked independently of us.
              </p>
              <ul className="ml-5 list-disc space-y-3 marker:text-gold">
                <li>
                  <strong>Call the number on this website.</strong>{" "}
                  <a
                    href={`tel:${COMPANY.phoneTel}`}
                    className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                  >
                    {COMPANY.phoneDisplay}
                  </a>
                  . Ask who you are speaking to and where the office is. If someone
                  claiming to represent us gives you a different number, that is the
                  answer to your question.
                </li>
                <li>
                  <strong>Email us from an address you typed yourself.</strong> Do
                  not reply to a number or address supplied by the person who
                  contacted you. Type{" "}
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                  >
                    {COMPANY.email}
                  </a>{" "}
                  into your mail app and ask to be put through to your site manager.
                  A genuine studio answers from an address on a domain they control.
                </li>
                <li>
                  <strong>Ask for a physical address and a physical visit.</strong>{" "}
                  {COMPANY.address} is a real location. You are welcome, and
                  encouraged, to visit before committing to anything.
                </li>
                <li>
                  <strong>Ask who is professionally appointed to your project, and
                  check them independently.</strong> Ask for registration numbers,
                  then verify those numbers with the registering body — the
                  Architectural Association of Kenya, the Engineers Board of Kenya,
                  or BORAQS. This is the single most effective check available to
                  you, and no legitimate studio will resist it.
                </li>
                <li>
                  <strong>Check the company at the BRS/eCitizen portal.</strong> A
                  real Kenyan business is registered and you can confirm its
                  registration on the official portal.
                </li>
                <li>
                  <strong>Check the contractor&apos;s NCA registration.</strong> Every
                  construction contractor in Kenya must be registered with the
                  National Construction Authority, by category. Ask for the
                  certificate number.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "how-it-starts",
          heading: "How these scams usually begin",
          body: (
            <>
              <p>
                Recognising the pattern is the best defence. Almost every attempt
                follows the same sequence:
              </p>
              <ol className="ml-5 list-decimal space-y-3 marker:text-gold/70">
                <li>
                  An unsolicited message — WhatsApp, Facebook, Instagram, a cold
                  call — congratulating you on a plot, a house purchase, or a
                  tender.
                </li>
                <li>
                  A remarkably generous offer: materials already bought, a
                  construction package at a price well below market, or a discount
                  for paying "directly".
                </li>
                <li>
                  Pressure to act before a deadline that is artificial, or a
                  request to pay a deposit to "secure the site team" before any
                  drawings, contract or site visit.
                </li>
                <li>
                  Once money moves, requests escalate — "unexpected NEMA fee",
                  "customs clearance", "release the architect's payment", "your
                  son is on site and needs transport money".
                </li>
              </ol>
              <p>
                The lesson is simple: <strong>payment follows signed documentation,
                never precedes it.</strong> Anyone who reverses that order is telling
                you who they are.
              </p>
            </>
          ),
        },
        {
          id: "red-flags",
          heading: "Warning signs to walk away from",
          body: (
            <ul className="ml-5 list-disc space-y-3 marker:text-gold">
              <li>
                They will not give you a physical address, or they give you one
                that does not match the number they call from.
              </li>
              <li>
                They ask for payment to a personal account, a new paybill in
                someone else&apos;s name, mobile money, or crypto.
              </li>
              <li>
                They cannot name the professionals appointed to your project, or
                offer to &quot;handle&quot; registration and approvals themselves
                without producing certificates.
              </li>
              <li>
                The quote is a flat total with no drawings, no bill of quantities
                and no specification behind it.
              </li>
              <li>
                They pressure you to pay a deposit before a site visit, a
                contract, or meeting the person who will actually run your build.
              </li>
              <li>
                Their drawings, registration certificates or client references
                will not survive being asked for, or come back doctored.
              </li>
              <li>
                They are extremely cheap. A price far below the market is not a
                bargain, it is a signal that they intend to disappear.
              </li>
              <li>
                They contact you about a plot or project you have never publicly
                advertised. If they know it, ask how — and be suspicious of the
                answer.
              </li>
              <li>
                They communicate only through one channel that you cannot verify,
                and resist any other means of contact.
              </li>
              <li>
                They ask you to keep a payment quiet, or not to involve a family
                member or your lawyer.
              </li>
            </ul>
          ),
        },
        {
          id: "never-do",
          heading: "What we will never do",
          body: (
            <>
              <p>
                We would rather state our limits plainly than rely on your
                judgement of them. ATRO will never:
              </p>
              <ul className="ml-5 list-disc space-y-3 marker:text-gold">
                <li>
                  Ask for a deposit, or any money, before you have seen drawings, a
                  bill of quantities and a written agreement.
                </li>
                <li>
                  Ask you to pay a personal account, mobile money number, or crypto
                  wallet. Every payment is against a company invoice and a company
                  account.
                </li>
                <li>
                  Quote a final price over WhatsApp or a phone call. A number given
                  verbally is not a quotation.
                </li>
                <li>
                  Use a family member, an agent, or an intermediary as the only
                  point of contact, or discourage you from speaking to the
                  professionals doing the work.
                </li>
                <li>
                  Ask for your logbook, title deed, ID, or bank credentials in a
                  message.
                </li>
                <li>
                  Apply urgency to a payment decision. A genuine studio can wait
                  while you read a contract.
                </li>
                <li>
                  Take a project on the promise of profit for a third party, or
                  offer to "release" funds on your behalf.
                </li>
                <li>
                  Charge for a second opinion, or for you to see the work we have
                  done.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "protecting-yourself",
          heading: "How to protect yourself",
          body: (
            <>
              <p>
                These steps cost you nothing and close off almost every avenue of
                attack:
              </p>
              <ol className="ml-5 list-decimal space-y-3 marker:text-gold/70">
                <li>
                  <strong>Use one verified contact channel</strong> — an email
                  address and phone number you found yourself, not ones you were
                  given.
                </li>
                <li>
                  <strong>Appoint your own representative</strong> on the ground if
                  you are not there — someone you chose, not someone introduced by
                  your contractor, with written authority to inspect and to see
                  photographs and measurements.
                </li>
                <li>
                  <strong>Insist on staged payments</strong> released against
                  measured work, with independent certification. Never pay
                  materially in advance of work performed.
                </li>
                <li>
                  <strong>Get a fixed, written contract</strong> with drawings,
                  specification, bill of quantities, programme, payment schedule
                  and a defects clause.
                </li>
                <li>
                  <strong>Keep records</strong> — messages, invoices,
                  certificates, photographs. They are what makes a dispute
                  winnable.
                </li>
                <li>
                  <strong>Tell someone</strong> — a family member, a lawyer, an
                  adviser. Fraud works by isolation.
                </li>
                <li>
                  <strong>Never act on urgency you cannot verify.</strong> A
                  deadline invented to stop you checking is the fraud, not the
                  deadline.
                </li>
              </ol>
            </>
          ),
        },
        {
          id: "report-it",
          heading: "If you think you have been targeted or defrauded",
          body: (
            <>
              <p>
                Act quickly — recovery is far more likely in the first days.
              </p>
              <ul className="ml-5 list-disc space-y-3 marker:text-gold">
                <li>
                  Contact your bank immediately and ask them to recall or freeze the
                  transfer. This is most effective within 24–48 hours.
                </li>
                <li>
                  Report to the{" "}
                  <strong>Director of Criminal Intelligence</strong> at the
                  Directorate of Criminal Investigations, and to the{" "}
                  <strong>National Fraud Reporting Centre</strong>.
                </li>
                <li>
                  For construction-specific fraud, including unregistered
                  contractors, report to the{" "}
                  <strong>National Construction Authority</strong> (nca.go.ke).
                </li>
                <li>
                  Report online crime through the national cybercrime portal.
                </li>
              </ul>
              <p>
                Tell us too, at{" "}
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                >
                  {COMPANY.email}
                </a>
                . Even if you are not our client, we would rather warn others than
                keep quiet — and if someone is impersonating us, we need to know.
              </p>
            </>
          ),
        },
      ]}
      callout={{
        heading: "Verify before you transfer",
        body: (
          <>
            <p>
              Call{" "}
              <a
                href={`tel:${COMPANY.phoneTel}`}
                className="font-medium text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-light"
              >
                {COMPANY.phoneDisplay}
              </a>{" "}
              using the number printed on this website. One call resolves more
              uncertainty than any document a stranger sends you.
            </p>
            <p>
              Read next:{" "}
              <a
                href="/fees"
                className="font-medium text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-light"
              >
                how our fees and stage payments work
              </a>{" "}
              — so you know what a legitimate payment request looks like before one
              arrives.
            </p>
          </>
        ),
      }}
    />
  );
}
