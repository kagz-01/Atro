import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { COMPANY } from "@/lib/site";

export const Route = createFileRoute("/accessibility")({
  component: AccessibilityPage,
  head: () => ({
    meta: [
      { title: "Accessibility statement — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "ATRO Design & Construction's commitment to making this website usable by everyone, including people with disabilities.",
      },
    ],
  }),
});

const UPDATED = "February 2026";

function AccessibilityPage() {
  return (
    <LegalPage
      slug="/accessibility"
      title="Accessibility statement"
      lede="Our commitment to making this website usable by everyone, including people with disabilities, and how to tell us when we get it wrong."
      updated={UPDATED}
      intro={
        <>
          A website that only works for some people is a website that excludes
          people — and a construction studio that talks about building properly
          has no business shipping something inaccessible. We hold this site to
          WCAG 2.2 Level AA as the target, and we treat accessibility as ongoing
          work rather than a box to tick.
        </>
      }
      sections={[
        {
          id: "our-commitment",
          heading: "Our commitment",
          body: (
            <p>
              {COMPANY.name} is committed to making this website usable by as many
              people as possible, regardless of technology or ability. We aim to
              meet the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA.
            </p>
          ),
        },
        {
          id: "what-we-have-done",
          heading: "What we have done",
          body: (
            <ul className="ml-5 list-disc space-y-2 marker:text-gold">
              <li>
                Semantic structure and proper heading order, so assistive technology
                can navigate by landmark and heading.
              </li>
              <li>
                Keyboard operability throughout — every link, button, form field and
                interactive tool, with focus visible and in a sensible order.
              </li>
              <li>
                Visible skip-to-content link, so keyboard users can bypass
                navigation.
              </li>
              <li>
                Text contrast that meets AA against the backgrounds used, in both
                light and dark sections.
              </li>
              <li>
                Form labels tied to their fields, clear error messaging, and
                confirmation that does not rely on colour alone.
              </li>
              <li>
                Images carrying meaningful alternatives, and decorative images
                marked as such so they are not announced.
              </li>
              <li>
                Layout that reflows to small screens without horizontal scrolling,
                and remains usable at 200% zoom.
              </li>
              <li>
                Animation and motion kept restrained, and no information conveyed by
                colour on its own.
              </li>
            </ul>
          ),
        },
        {
          id: "known-limitations",
          heading: "Known limitations",
          body: (
            <>
              <p>
                We are honest about what is not yet right. As of {UPDATED}, the
                following are known issues:
              </p>
              <ul className="ml-5 list-disc space-y-3 marker:text-gold">
                <li>
                  <strong>The interactive cost calculator, material price list, zone
                  map and bill of quantities tools are pointer- and keyboard-driven
                  but have not yet been fully tested with a screen reader.</strong>{" "}
                  The same information is available as written tables and text on
                  request, and we will supply it on any of our contact channels.
                </li>
                <li>
                  <strong>Some third-party embeds</strong> — notably the map — may
                  not fully conform. Where that is the case we provide a text
                  alternative listing the same locations and details.
                </li>
                <li>
                  <strong>Long numeric tables</strong> in the material prices and
                  bill of quantities views can be tedious to navigate screen-reader
                  users. These are being restructured as accessible descriptions
                  rather than wide tables.
                </li>
              </ul>
              <p>
                If you hit a barrier not listed here, please tell us — that is
                valuable information and we will treat it as a defect.
              </p>
            </>
          ),
        },
        {
          id: "alternatives",
          heading: "If this site does not work for you",
          body: (
            <>
              <p>
                Nothing on this site is the only way to work with us. Every
                calculator, price list, map and bill of quantities can be given to
                you another way:
              </p>
              <ul className="ml-5 list-disc space-y-2 marker:text-gold">
                <li>As a plain document, emailed or WhatsApped to you.</li>
                <li>Walked through by phone or video call, at your pace.</li>
                <li>Discussed in a site or office meeting, in person.</li>
              </ul>
              <p>
                If you find it easier to talk to a person than to use a screen,
                that is a perfectly good way to work with us and it will not slow
                your project down.
              </p>
            </>
          ),
        },
        {
          id: "report-a-barrier",
          heading: "Tell us about a barrier",
          body: (
            <>
              <p>
                If something here does not work for you, we want to hear about it.
                Write to{" "}
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                >
                  {COMPANY.email}
                </a>{" "}
                or call{" "}
                <a
                  href={`tel:${COMPANY.phoneTel}`}
                  className="font-medium text-maroon underline decoration-gold decoration-2 underline-offset-4 hover:text-burgundy"
                >
                  {COMPANY.phoneDisplay}
                </a>
                , or ask on WhatsApp. Please tell us:
              </p>
              <ul className="ml-5 list-disc space-y-2 marker:text-gold">
                <li>Which page you were on and what you were trying to do.</li>
                <li>
                  The barrier — and whether it is speed, contrast, keyboard, screen
                  reader, or something else.
                </li>
                <li>
                  Any technology you were using, so we can reproduce it.
                </li>
              </ul>
              <p>
                We aim to acknowledge within three working days and to tell you what
                we intend to do and roughly when.
              </p>
            </>
          ),
        },
        {
          id: "standard",
          heading: "About the standard",
          body: (
            <p>
              WCAG 2.2 was published by the World Wide Web Consortium (W3C) as the
              current international standard for web accessibility. Level AA is the
              level we hold ourselves to — the level most commonly required of
              public and commercial bodies in Kenya and internationally.
            </p>
          ),
        },
      ]}
      callout={{
        heading: "Accessibility is not an afterthought",
        body: (
          <p>
            We design buildings to be usable by everyone for decades. A website
            that excludes people is the same failure in a different medium. If you
            find something here that locks you out, tell us and we will fix it.
          </p>
        ),
      }}
    />
  );
}
