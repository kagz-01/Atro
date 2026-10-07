import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of use — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "The terms governing use of the ATRO Design & Construction website, including content, intellectual property, liability and Kenyan law.",
      },
    ],
  }),
});

const UPDATED = "February 2026";

function TermsPage() {
  return (
    <LegalPage
      slug="/terms"
      title="Terms of use"
      lede="The rules for using this website. They are short, and they apply whether you are browsing from Nairobi or from another country."
      updated={UPDATED}
      intro={
        <>
          By using this site you accept these terms. If you do not accept them,
          please stop using the site. These terms cover the website itself only —
          the terms on which we actually design and build are the written
          agreement we sign with each client, which always takes precedence over
          anything here.
        </>
      }
      sections={[
        {
          id: "information-not-advice",
          heading: "Information is not professional advice",
          body: (
            <>
              <p>
                Everything on this site is general information. It is not a
                quotation, a contract, a valuation, a structural or engineering
                opinion, or a statutory sign-off, and it must not be relied on as
                any of those things.
              </p>
              <p>
                The cost calculator, material price tables and zone multipliers are{" "}
                <strong>indicative</strong>. They are built from published Kenyan
                sources and our own project data, but they exclude land, statutory
                fees, financing costs and extraordinary ground conditions. A real
                figure comes only from drawings, a site visit and a measured bill of
                quantities.
              </p>
              <p>
                Bill of quantities produced by our generator are a teaching and
                early-stage budgeting tool prepared to Kenya&apos;s Standard Method
                of Measurement. They are not a contract document and must be
                re-measured and verified by a registered quantity surveyor before
                they are relied on.
              </p>
            </>
          ),
        },
        {
          id: "no-obligation",
          heading: "Enquiries create no obligation",
          body: (
            <>
              <p>
                Sending an enquiry, starting a WhatsApp conversation, downloading a
                document, or using any tool on this site is an invitation to talk.
                It is not an appointment, an instruction to proceed, or an
                engagement. A contract exists only when we issue a written
                proposal and you accept it in writing.
              </p>
              <p>
                We may decline an enquiry, or decline to proceed with a project,
                for reasons including capacity, scope, or where we cannot meet your
                requirements credibly. We will tell you when that happens.
              </p>
            </>
          ),
        },
        {
          id: "intellectual-property",
          heading: "Intellectual property",
          body: (
            <>
              <p>
                The ATRO name, logo, site design, text, graphics, tool code and
                underlying data on this site belong to {COMPANY.name} or its
                licensors. You may read, print and share pages for your own or your
                client&apos;s reference. You may not republish, scrape at scale, or
                resell them without written permission.
              </p>
              <p>
                <strong>Our drawings stay ours.</strong> Unless a signed agreement
                says otherwise, all designs, drawings, sketches, models and
                documents we produce remain our intellectual property. The client
                pays for the right to use them for their project — not ownership of
                them. We are happy to license or assign them where a contract says
                so.
              </p>
              <p>
                Photography of completed work and client testimonials are published
                only with written permission. Client names, addresses and project
                values are withheld unless the client has agreed otherwise in
                writing.
              </p>
            </>
          ),
        },
        {
          id: "acceptable-use",
          heading: "Acceptable use",
          body: (
            <>
              <p>
                Please do not attempt to disrupt the site, probe it for
                vulnerabilities without telling us first, scrape it in bulk, upload
                malicious code, or use the enquiry tools to send unsolicited bulk
                messages. We will block access where these terms are not respected.
              </p>
            </>
          ),
        },
        {
          id: "liability",
          heading: "Limitation of liability",
          body: (
            <>
              <p>
                The site is provided as-is. We take care with it, but to the extent
                the law allows we exclude liability for loss arising from its use,
                including decisions made in reliance on indicative figures.
              </p>
              <p>
                Nothing here limits liability that cannot lawfully be limited,
                including for fraud or fraudulent misrepresentation, or for death or
                personal injury caused by negligence. Our professional liability on a
                live project sits with the registered professional appointed to that
                project and their insurer — not with the owners of this website.
              </p>
              <p>
                This distinction matters: it is one of the reasons we insist you
                check who is actually appointed to your building. See our{" "}
                <a
                  href="/scam-warning"
                  className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                >
                  verification guide
                </a>
                .
              </p>
            </>
          ),
        },
        {
          id: "external-links",
          heading: "External links",
          body: (
            <p>
              Where we link to another site — for example to the National
              Construction Authority or NEMA — we do so for convenience. We do not
              control those sites and are not responsible for their content or their
              privacy practices.
            </p>
          ),
        },
        {
          id: "regulatory",
          heading: "Professional and statutory roles",
          body: (
            <p>
              Statutory and regulated roles on any project — architect, engineer,
              quantity surveyor, environmental impact assessor, energy auditor —
              are carried by the licensed professionals appointed to that specific
              project. References on this site to professional bodies describe the
              standards we hold ourselves to; they do not imply a registration that
              we have not stated. Ask us for the registration number of any
              professional you are being asked to rely on.
            </p>
          ),
        },
        {
          id: "governing-law",
          heading: "Governing law and disputes",
          body: (
            <>
              <p>
                These terms are governed by the laws of the Republic of Kenya, and
                the courts of Kenya have jurisdiction. This applies regardless of
                where you access the site from.
              </p>
              <p>
                We would rather resolve a disagreement directly than formally. Write
                to{" "}
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                >
                  {COMPANY.email}
                </a>{" "}
                first, and we will put a person on it. If we cannot settle it
                between us, mediation through a mutually agreed mediator is
                usually faster and cheaper than court.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          heading: "Changes to these terms",
          body: (
            <p>
              We may revise these terms as the site or our practice changes. The
              date at the top shows the current version, and revised terms apply
              from the moment they are published. Engagements already signed are
              unaffected.
            </p>
          ),
        },
      ]}
      callout={{
        heading: "Paying for work from outside Kenya",
        body: (
          <>
            <p>
              How our fees are structured, how stage payments work, and how we
              handle money from clients abroad is set out in full in{" "}
              <a
                href="/fees"
                className="font-medium text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-light"
              >
                fees and payment terms
              </a>
              . Read that before you transfer anything to anyone claiming to be us.
            </p>
          </>
        ),
      }}
    />
  );
}
