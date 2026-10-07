import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
  head: () => ({
    meta: [
      { title: "Cookie notice — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Which cookies and local storage this website uses, what they do, and how to control them.",
      },
    ],
  }),
});

const UPDATED = "February 2026";

function CookiesPage() {
  return (
    <LegalPage
      slug="/cookies"
      title="Cookie notice"
      lede="The small amount of data this site stores on your device, what it is for, and how to turn it off."
      updated={UPDATED}
      intro={
        <>
          We keep this deliberately minimal. The site works without optional
          tracking, and we do not build advertising profiles of our visitors. Most
          of what we store is not a cookie at all — it is your own enquiry sitting
          in your browser so you can review it before sending.
        </>
      }
      sections={[
        {
          id: "what-cookies-are",
          heading: "What cookies are",
          body: (
            <p>
              A cookie is a small text file a website asks your browser to store,
              then returns on later visits. Local storage works the same way and is
              held under your browser&apos;s control. Neither can read files on your
              computer, and neither gives anyone access to your email or bank.
            </p>
          ),
        },
        {
          id: "what-we-use",
          heading: "What this site uses",
          body: (
            <ul className="ml-5 list-disc space-y-3 marker:text-gold">
              <li>
                <strong>Essential storage.</strong> Your in-progress enquiry is held
                in your own browser so the form is not lost if you navigate away or
                close the tab. It stays on your device and is sent only when you
                choose to submit.
              </li>
              <li>
                <strong>Session storage.</strong> Used to remember that you have
                opened this notice, and other small interface states, so pages do
                not nag you on every visit.
              </li>
              <li>
                <strong>Analytics.</strong> Where enabled and subject to your
                consent, we measure which pages are useful and where people get
                stuck — for example, whether visitors reach the enquiry form. We
                use aggregate counts, not individual profiles, and no cross-site
                advertising trackers or social pixels are embedded.
              </li>
              <li>
                <strong>Embedded content.</strong> Our map uses OpenStreetMap tiles
                and our assistant talks to a third-party AI service. Both are
                contacted only when you load that part of the page, and the
                assistant only sends what you type to it. See the{" "}
                <a
                  href="/privacy"
                  className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                >
                  privacy notice
                </a>{" "}
                for the basis on which we do that.
              </li>
            </ul>
          ),
        },
        {
          id: "third-parties",
          heading: "Third parties",
          body: (
            <p>
              We do not sell or share cookie data. Our hosting provider processes
              request logs strictly to deliver the site. Where you use the
              assistant, your question is sent to the AI provider that powers it,
              under our instruction and for that purpose only. We do not embed
              advertising or social tracking cookies from third parties.
            </p>
          ),
        },
        {
          id: "controlling",
          heading: "How to control cookies",
          body: (
            <>
              <p>
                Your browser can block or delete cookies and local storage at any
                time, and you can change your mind later. In most browsers:
              </p>
              <ul className="ml-5 list-disc space-y-2 marker:text-gold">
                <li>
                  <strong>Chrome / Edge:</strong> Settings → Privacy and security →
                  Third-party cookies.
                </li>
                <li>
                  <strong>Safari:</strong> Settings → Privacy &amp; Security →
                  Manage Website Data.
                </li>
                <li>
                  <strong>Firefox:</strong> Settings → Privacy &amp; Security →
                  Cookies and Site Data.
                </li>
              </ul>
              <p>
                Blocking storage does not stop you using this site. One consequence
                is that an in-progress enquiry may not survive a page reload, so
                please send it before navigating away.
              </p>
            </>
          ),
        },
        {
          id: "questions",
          heading: "Questions",
          body: (
            <p>
              If anything here is unclear, write to{" "}
              <a
                href={`mailto:${COMPANY.email}`}
                className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
              >
                {COMPANY.email}
              </a>
              . We would rather explain it than have you guess.
            </p>
          ),
        },
      ]}
      callout={{
        heading: "The short version",
        body: (
          <p>
            We store what is needed to run the site and reply to you. We do not
            profile you, we do not show you ads, and we do not share your data with
            advertisers. If that ever changes, this page will say so first.
          </p>
        ),
      }}
    />
  );
}
