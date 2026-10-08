import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { COMPANY, VALUES } from "@/lib/site";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About ATRO — Design & Construction" },
      {
        name: "description",
        content:
          "ATRO is a modern Kenyan design-and-construction company focused on well-designed, technically sound, efficiently delivered structures.",
      },
    ],
  }),
});

function AboutPage() {
  return (
    <>
      <PageHero
        kicker="Studio"
        title="A design-and-build company, not a van with a logo."
        lede="ATRO is a modern design-and-construction company focused on creating well-designed, technically sound and efficiently delivered structures."
        image="/images/interior.webp"
      />
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-6 text-lg text-ink/80">
          <p className="text-xl text-maroon">{COMPANY.description}</p>
          <p>
            We started from a simple frustration: too many Kenyan projects split design, cost and construction into three conversations that do not speak. The drawing is beautiful. The number is fiction. The site invents a third building.
          </p>
          <p>
            ATRO holds those conversations in one studio. We design with quantities in the room. We build from a locked scope. We tell you, in writing, when something changes.
          </p>
          <p>
            We are based in Nairobi and we publish where we actually deliver — including work managed for Kenyans who live abroad. We do not claim registrations, awards or years we have not earned a public record for.
          </p>
        </div>
        <aside className="lg:col-span-5 space-y-6">
          <Quote title="Vision" body="Structures that are designed, costed and built as one act — in Kenya, to a standard that does not need an excuse." />
          <Quote title="Mission" body="Take a brief from concept to handover with drawings, quantities, a present site and a client who is never guessing." />
        </aside>
      </section>
      <section className="bg-stone/60 py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <h2 className="font-display text-3xl text-maroon">Values</h2>
          <div className="mt-8 grid sm:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <article key={v.title} className="bg-paper border border-line p-6 rounded-sm">
                <h3 className="font-display text-2xl text-maroon">{v.title}</h3>
                <p className="mt-2 text-ink/75">{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 grid md:grid-cols-2 gap-10 items-center">
        <img src="/images/detail.webp" alt="Concrete and stone junction" className="w-full aspect-[4/3] object-cover" />
        <div>
          <h2 className="font-display text-3xl text-maroon">Philosophy</h2>
          <p className="mt-4 text-ink/80">
            A building is a set of joints, levels, waterproofing details and decisions. Taste matters. So does the damp proof course. We will not photograph a house we would not hand to our own family.
          </p>
          <p className="mt-4 text-ink/80">
            Team profiles and verified credentials will be published here when they are ready to stand in public. Until then, the work is the proof.
          </p>
          <p className="mt-6 text-sm text-muted">
            {COMPANY.address} · {COMPANY.email} · {COMPANY.phoneDisplay}
          </p>
          <Button asChild className="mt-6">
            <Link to="/start">Work with us</Link>
          </Button>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

function Quote({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-2 border-gold pl-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{title}</p>
      <p className="mt-2 text-ink/80">{body}</p>
    </div>
  );
}
