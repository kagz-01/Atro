import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand, PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { PROCESS_STEPS } from "@/lib/site";

export const Route = createFileRoute("/process")({
  component: ProcessPage,
  head: () => ({
    meta: [
      { title: "Our process — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Eight steps from consultation to handover: assessment, design, cost planning, approvals, construction and communication.",
      },
    ],
  }),
});

function ProcessPage() {
  return (
    <>
      <PageHero
        kicker="Process"
        title="A journey you can point to, not a fog of site visits."
        lede="Eight steps. If a project skips cost planning or pretends approvals are optional, it is not an ATRO project."
        image="/images/site.webp"
      />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <ol className="relative border-l border-gold/50 ml-3 space-y-12">
          {PROCESS_STEPS.map((s) => (
            <li key={s.n} className="pl-10 relative">
              <span className="absolute -left-3.5 top-1 size-7 rounded-xs bg-burgundy text-paper text-[11px] inline-flex items-center justify-center">
                {s.n}
              </span>
              <h2 className="font-display text-3xl text-maroon">{s.title}</h2>
              <p className="mt-2 text-ink/75">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14">
          <Button asChild>
            <Link to="/start">Start at step one</Link>
          </Button>
        </div>
      </section>
      <CtaBand title="Start your project" />
    </>
  );
}
