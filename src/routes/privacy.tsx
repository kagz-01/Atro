import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy notice — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "How ATRO Design & Construction collects, uses, stores and protects your personal data under Kenya's Data Protection Act, 2019.",
      },
    ],
  }),
});

const UPDATED = "February 2026";

function PrivacyPage() {
  return (
    <LegalPage
      slug="/privacy"
      title="Privacy notice"
      lede="What we collect when you contact us, why we collect it, how long we keep it, and the rights you hold over it."
      updated={UPDATED}
      intro={
        <>
          This notice applies to this website and to projects we quote, design or
          build. We are a small studio, so we collect less than a large platform
          would — and we do not sell, rent or trade your details to anyone. If we
          ever need to change how we handle your data, we will tell you before we
          do.
        </>
      }
      sections={[
        {
          id: "who-we-are",
          heading: "Who we are",
          body: (
            <>
              <p>
                {COMPANY.name} is a design and construction studio based in{" "}
                {COMPANY.address}. For the purposes of the Data Protection Act,
                2019 we are the <strong>data controller</strong> — we decide why
                and how your personal data is processed.
              </p>
              <p>
                Questions about this notice, or a request to see or delete your
                data, go to{" "}
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                >
                  {COMPANY.email}
                </a>
                . We answer in writing, normally within seven working days.
              </p>
            </>
          ),
        },
        {
          id: "what-we-collect",
          heading: "What we collect",
          body: (
            <>
              <p>
                We only ask for what we genuinely need to do the work. In practice
                that means:
              </p>
              <ul className="ml-5 list-disc space-y-2 marker:text-gold">
                <li>
                  <strong>Enquiry details</strong> — your name, phone number, email
                  address, the kind of project, the location, approximate size and
                  budget band, and anything else you choose to tell us in the
                  enquiry form, an email or a WhatsApp message.
                </li>
                <li>
                  <strong>Project records</strong> — for clients, these include
                  signed agreements, drawings, surveys, bills of quantities,
                  certificates, payment records and site photographs.
                </li>
                <li>
                  <strong>Technical data</strong> — your browser type, device, and
                  pages you visit, collected only where you have agreed to
                  analytics. See the cookie notice for detail.
                </li>
              </ul>
              <p>
                We do not ask for, and you should not send us, national ID numbers,
                passport numbers, bank PINs, full card details or login credentials.
                No legitimate part of our work needs them.
              </p>
            </>
          ),
        },
        {
          id: "why-we-collect-it",
          heading: "Why we are allowed to collect it",
          body: (
            <>
              <p>
                Under the Data Protection Act, 2019 every use of personal data needs
                a lawful basis. Ours are:
              </p>
              <ul className="ml-5 list-disc space-y-2 marker:text-gold">
                <li>
                  <strong>Consent</strong> — where you tick a box or ask us to contact
                  you. You can withdraw this at any time without affecting work
                  already done.
                </li>
                <li>
                  <strong>Contract</strong> — records needed to design, build and
                  invoice a project you have engaged us for.
                </li>
                <li>
                  <strong>Legal obligation</strong> — records we must keep to satisfy
                  tax, county and statutory requirements, including NCA, NEMA and
                  professional body record-keeping.
                </li>
                <li>
                  <strong>Legitimate interests</strong> — responding to your enquiry,
                  protecting our site, and improving our published cost data. We
                  balance these against your interests and stop if they no longer
                  justify the processing.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "how-long-we-keep-it",
          heading: "How long we keep it",
          body: (
            <>
              <p>
                Unsuccessful enquiries are deleted or anonymised within{" "}
                <strong>24 months</strong>. If you become a client, project and
                financial records are kept for{" "}
                <strong>7 years</strong> after completion, which is the period
                Kenyan tax and construction law expects us to retain them. We then
                destroy or irreversibly anonymise them.
              </p>
              <p>
                Anything you send us by email or WhatsApp that is not part of a
                project record is deleted within 24 months of the last conversation.
              </p>
            </>
          ),
        },
        {
          id: "who-we-share-it-with",
          heading: "Who we share it with",
          body: (
            <>
              <p>
                We share your details only where a project cannot be delivered
                without it, and never in exchange for money:
              </p>
              <ul className="ml-5 list-disc space-y-2 marker:text-gold">
                <li>Our own architects, engineers, quantity surveyors and site staff.</li>
                <li>
                  Contractors and suppliers appointed to your project, given only
                  what they need to price and build their part.
                </li>
                <li>
                  Statutory bodies where the law requires it — the National
                  Construction Authority, county governments, NEMA, and the relevant
                  professional bodies.
                </li>
                <li>
                  Our professional indemnity insurer and auditors, under
                  confidentiality.
                </li>
              </ul>
              <p>
                We do not sell personal data, we do not rent mailing lists, and we
                do not share data with advertisers or data brokers.
              </p>
            </>
          ),
        },
        {
          id: "clients-abroad",
          heading: "Clients and contacts outside Kenya",
          body: (
            <>
              <p>
                Many of our clients live outside Kenya, and we are deliberate about
                this. If you contact us from abroad, your message reaches us by an
                ordinary email or WhatsApp connection, handled by our Nairobi studio
                under Kenyan law. We do not collect extra data about your location
                or immigration status, and we do not ask for a foreign address as a
                condition of quoting.
              </p>
              <p>
                Where a project requires a document to be signed by someone abroad,
                we ask only for the signature and the contact details needed to
                execute it. If a transfer of your data outside Kenya ever becomes
                necessary to deliver a specific instruction, we will tell you what
                is being sent, to whom, and on what safeguards — and you may ask us
                to proceed without it.
              </p>
            </>
          ),
        },
        {
          id: "your-rights",
          heading: "Your rights",
          body: (
            <>
              <p>
                The Data Protection Act, 2019 gives you real rights over your data.
                You may:
              </p>
              <ul className="ml-5 list-disc space-y-2 marker:text-gold">
                <li>Ask what personal data we hold about you, and get a copy.</li>
                <li>
                  Have inaccurate or incomplete data corrected — for example, an
                  old phone number still attached to an enquiry.
                </li>
                <li>
                  Ask us to stop using your data, or to delete it, where we have no
                  overriding legal reason to keep it.
                </li>
                <li>Withdraw consent you gave, at any time.</li>
                <li>
                  Object to processing done on the basis of legitimate interests.
                </li>
                <li>
                  Ask us to transfer your data to another provider in a portable
                  format.
                </li>
                <li>Complain to the Office of the Data Protection Commissioner.</li>
              </ul>
              <p>
                Write to{" "}
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                >
                  {COMPANY.email}
                </a>{" "}
                and we will action simple requests immediately. We may ask you to
                confirm your identity first, so that nobody else can ask us about
                your records.
              </p>
            </>
          ),
        },
        {
          id: "how-we-protect-it",
          heading: "How we protect it",
          body: (
            <>
              <p>
                Enquiry records are held in an access-controlled system with
                encryption in transit. Project files are stored on managed,
                access-logged drives, and copies are destroyed when no longer
                required. We use unique credentials, multi-factor authentication
                where available, and we review who has project access when staff or
                roles change.
              </p>
              <p>
                No system is perfectly secure. If a breach occurs that is likely to
                affect your rights, we will tell you and the Data Protection
                Commissioner without undue delay and explain what we did about it.
              </p>
            </>
          ),
        },
        {
          id: "children",
          heading: "Children",
          body: (
            <p>
              This site and our services are aimed at adults making property
              decisions. We do not knowingly collect data from anyone under 18. If
              you believe a child has sent us information, tell us and we will
              delete it.
            </p>
          ),
        },
        {
          id: "changes",
          heading: "Changes to this notice",
          body: (
            <p>
              When we change how we handle your data we update this page and change
              the date at the top. If a change materially affects how we use
              information we already hold, we will tell existing clients directly
              rather than relying on you to revisit this page.
            </p>
          ),
        },
      ]}
      callout={{
        heading: "Worried about who you are dealing with?",
        body: (
          <>
            <p>
              A genuine studio should be comfortable with scrutiny. Read our{" "}
              <a
                href="/scam-warning"
                className="font-medium text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-light"
              >
                scam warning and verification guide
              </a>{" "}
              — it explains how to confirm you are dealing with ATRO, and the
              approaches we will never take.
            </p>
            <p>
              We would rather you check and feel certain than take our word for it.
            </p>
          </>
        ),
      }}
    />
  );
}
