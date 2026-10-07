import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { JOURNEY, JOURNEY_PHASES, type JourneyStage } from "@/lib/diaspora/journey";
import { CtaBand } from "@/components/page-hero";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/guides/journey")({
  component: JourneyPage,
  head: () => ({
    meta: [
      { title: "The build journey, stage by stage — ATRO" },
      {
        name: "description",
        content:
          "All nine stages of building in Kenya as a diaspora client: what happens, how long it takes, what you must approve, what to verify, and how each stage most often goes wrong.",
      },
    ],
  }),
});

const PANELS: {
  key: "happens" | "youApprove" | "youReceive" | "verify" | "failure";
  label: string;
}[] = [
  { key: "happens", label: "What happens" },
  { key: "youApprove", label: "What you approve" },
  { key: "youReceive", label: "What you receive" },
  { key: "verify", label: "What to verify" },
  { key: "failure", label: "How it goes wrong" },
];

function StagePanel({ stage }: { stage: JourneyStage }) {
  const [tab, setTab] = useState<(typeof PANELS)[number]["key"]>("happens");
  const panel = PANELS.find((p) => p.key === tab)!;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {PANELS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setTab(p.key)}
            className={cn(
              "rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-bold transition-colors",
              tab === p.key
                ? "bg-maroon text-paper"
                : "border border-ink/12 text-ink/55 hover:border-maroon/40 hover:text-maroon",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {stage[panel.key].map((item) => (
          <li key={item} className="flex gap-3">
            <span
              className={cn(
                "mt-2 size-1.5 shrink-0 rounded-full",
                panel.key === "failure" ? "bg-red-500" : "bg-gold",
              )}
            />
            <span
              className={cn(
                "text-[15px] leading-[1.7]",
                panel.key === "failure" ? "text-red-950" : "text-ink/80",
              )}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "mt-7 rounded-2xl px-5 py-4",
          panel.key === "failure"
            ? "border-l-[3px] border-l-red-600 bg-red-50/70"
            : "border-l-[3px] border-l-gold bg-cream",
        )}
      >
        <p className="text-[10px] uppercase tracking-[0.16em] text-gold">
          {panel.key === "failure" ? "The risk here" : "Doing it from abroad"}
        </p>
        <p
          className={cn(
            "mt-2 text-[14px] leading-[1.7]",
            panel.key === "failure" ? "text-red-950" : "text-ink/80",
          )}
        >
          {panel.key === "failure"
            ? "Most of these are preventable by verifying at the right moment. The checks above exist because each of them has gone wrong on projects that did not have them."
            : stage.fromAbroad}
        </p>
      </div>
    </div>
  );
}

function JourneyPage() {
  const [active, setActive] = useState(JOURNEY[0].id);
  const stage = JOURNEY.find((s) => s.id === active)!;

  return (
    <>
      <section className="relative overflow-hidden bg-maroon pt-28 pb-16 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/60 via-maroon to-maroon" />
        <div className="pointer-events-none absolute -top-20 right-10 size-[440px] rounded-full bg-gold/10 blur-[150px]" />

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
            The build journey
          </p>
          <h1 className="reveal mt-4 max-w-4xl font-display text-5xl text-paper sm:text-6xl md:text-7xl">
            Ten stages, from empty plot to keys
          </h1>
          <p className="reveal reveal-delay-1 mt-6 max-w-2xl text-lg text-paper/75">
            What actually happens at each stage, how long it takes, what you need to
            approve, what you should be receiving as evidence, and how each one most
            often goes wrong when nobody is watching.
          </p>

          <div className="reveal reveal-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              to="/scam-check"
              className="rounded-2xl bg-gradient-to-r from-gold to-gold-light px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-maroon shadow-glow-gold transition-transform hover:scale-[1.02]"
            >
              Check a builder now
            </Link>
            <Link
              to="/guides/$slug"
              params={{ slug: "buying-land-safely" }}
              className="rounded-2xl border border-paper/25 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-paper transition-colors hover:border-gold hover:text-gold"
            >
              Start with land
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-paper py-14 md:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          {/* Stage rail */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {JOURNEY.map((s) => {
              const on = s.id === active;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "group rounded-2xl border p-4 text-left transition-all",
                    on
                      ? "border-gold bg-maroon text-paper shadow-[0_8px_30px_rgb(201_146_79/0.25)]"
                      : "border-ink/10 bg-white hover:border-gold/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full font-display text-sm",
                      on ? "bg-gold text-maroon" : "bg-maroon/10 text-maroon",
                    )}
                  >
                    {s.order}
                  </span>
                  <span
                    className={cn(
                      "mt-3 block text-[12px] leading-snug font-medium",
                      on ? "text-paper" : "text-ink/70",
                    )}
                  >
                    {s.name}
                  </span>
                  <span
                    className={cn(
                      "mt-1.5 block text-[10px]",
                      on ? "text-paper/50" : "text-ink/40",
                    )}
                  >
                    {s.duration}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active stage detail */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Stage {stage.order} of {JOURNEY.length} · {stage.phase}
              </p>
              <h2 className="mt-4 font-display text-4xl text-maroon md:text-5xl">
                {stage.name}
              </h2>
              <p className="mt-5 text-[15px] leading-[1.75] text-ink/75">
                {stage.summary}
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-ink/10 bg-white p-5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                    Typical duration
                  </dt>
                  <dd className="mt-2 font-display text-xl text-maroon">
                    {stage.duration}
                  </dd>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-white p-5">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                    Share of build cost
                  </dt>
                  <dd className="mt-2 font-display text-xl text-maroon">
                    {stage.costShare}
                  </dd>
                </div>
              </dl>

              <p className="mt-6 text-[12px] leading-relaxed text-ink/50">
                Durations assume prompt approvals, funded payments and no
                extraordinary ground conditions. The most common cause of overrun in
                Kenya is not the build — it is the approvals stage running long.
              </p>
            </div>

            <div className="rounded-3xl border border-ink/10 bg-white p-6 md:p-8">
              <StagePanel key={stage.id} stage={stage} />
            </div>
          </div>

          {/* Phase notes */}
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {JOURNEY_PHASES.map((ph) => (
              <div
                key={ph.id}
                className="rounded-3xl border border-maroon/15 bg-cream p-7"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                  Phase
                </p>
                <h3 className="mt-2 font-display text-2xl text-maroon">{ph.id}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ink/70">
                  {ph.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Know the sequence before you commit"
        body="If you are at the stage of deciding, the guides below go deeper on each part. And when you are ready, we will tell you honestly what we can and cannot take on."
      />
    </>
  );
}
