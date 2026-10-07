import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SIGNALS, SIGNAL_GROUPS, assess, type Signal } from "@/lib/diaspora/scams";
import { CtaBand } from "@/components/page-hero";
import { COMPANY } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scam-check")({
  component: ScamCheckPage,
  head: () => ({
    meta: [
      { title: "Red flag checker — ATRO" },
      {
        name: "description",
        content:
          "Select what you have actually been told or asked for, and get a risk assessment with the specific thing to do next. Covers the patterns behind construction fraud targeting Kenyans abroad.",
      },
    ],
  }),
});

function ScamCheckPage() {
  const [picked, setPicked] = useState<string[]>([]);

  const chosen = useMemo(
    () => SIGNALS.filter((s) => picked.includes(s.id)),
    [picked],
  );
  const result = useMemo(() => assess(chosen), [chosen]);

  function toggle(id: string) {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function reset() {
    setPicked([]);
  }

  const tone =
    result.level.tone === "good"
      ? { bar: "bg-emerald-600", ring: "border-emerald-300", bg: "bg-emerald-50", text: "text-emerald-950" }
      : result.level.tone === "warn"
        ? { bar: "bg-amber-500", ring: "border-amber-300", bg: "bg-amber-50", text: "text-amber-950" }
        : { bar: "bg-red-600", ring: "border-red-300", bg: "bg-red-50", text: "text-red-950" };

  const maxScore = SIGNALS.reduce((s, x) => s + x.weight, 0);
  const pct = Math.min(100, (result.score / maxScore) * 100 * 2.2);

  return (
    <>
      <section className="relative overflow-hidden bg-maroon pt-28 pb-16 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/60 via-maroon to-maroon" />
        <div className="pointer-events-none absolute -top-20 right-10 size-[440px] rounded-full bg-gold/10 blur-[150px]" />

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
            Red flag checker
          </p>
          <h1 className="reveal mt-4 max-w-4xl font-display text-5xl text-paper sm:text-6xl md:text-7xl">
            What have you actually been asked for?
          </h1>
          <p className="reveal reveal-delay-1 mt-6 max-w-2xl text-lg text-paper/75">
            Select everything that has been said, asked for or done. You will get a
            risk assessment and, for each item, the specific thing to do next — not
            just a warning.
          </p>
          <p className="reveal reveal-delay-2 mt-5 max-w-2xl text-[13px] leading-relaxed text-paper/50">
            Nothing you select here is sent anywhere. This runs entirely in your
            browser and nothing is stored or transmitted.
          </p>
        </div>
      </section>

      <section className="bg-paper py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr]">
            {/* Signals */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                  {picked.length === 0
                    ? "Select any that apply"
                    : `${picked.length} selected`}
                </p>
                {picked.length > 0 ? (
                  <button
                    type="button"
                    onClick={reset}
                    className="text-[11px] uppercase tracking-[0.14em] font-bold text-ink/45 transition-colors hover:text-maroon"
                  >
                    Clear all
                  </button>
                ) : null}
              </div>

              <div className="mt-7 space-y-8">
                {SIGNAL_GROUPS.map((group) => {
                  const items = SIGNALS.filter((s) => s.group === group);
                  return (
                    <div key={group}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">
                        {group}
                      </p>
                      <div className="mt-3 space-y-2">
                        {items.map((s) => (
                          <SignalRow
                            key={s.id}
                            signal={s}
                            on={picked.includes(s.id)}
                            onToggle={() => toggle(s.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Result panel */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-ink/10 bg-white p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  Assessment
                </p>

                {result.score === 0 ? (
                  <p className="mt-4 text-[14px] leading-relaxed text-ink/60">
                    Nothing selected yet. Tick anything you have been told, asked
                    for, or that has happened so far.
                  </p>
                ) : (
                  <>
                    <div className="mt-4 flex items-baseline gap-3">
                      <span
                        className={cn(
                          "font-display text-5xl",
                          result.level.tone === "good" && "text-emerald-700",
                          result.level.tone === "warn" && "text-amber-700",
                          result.level.tone === "bad" && "text-red-700",
                        )}
                      >
                        {result.score}
                      </span>
                      <span className="text-[13px] text-ink/45">
                        risk points from {result.count} item
                        {result.count === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className={cn("h-full rounded-full transition-all", tone.bar)}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>

                    <div
                      className={cn(
                        "mt-6 rounded-2xl border px-5 py-4",
                        tone.ring,
                        tone.bg,
                      )}
                    >
                      <p className={cn("text-[15px] font-bold", tone.text)}>
                        {result.level.label}
                      </p>
                      <p
                        className={cn(
                          "mt-2 text-[13px] leading-[1.7]",
                          tone.text,
                        )}
                      >
                        {result.level.body}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {result.score > 0 ? (
                <div className="mt-5 rounded-3xl border border-ink/10 bg-cream p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                    What to do next
                  </p>
                  <ol className="mt-5 space-y-5">
                    {chosen
                      .slice()
                      .sort((a: Signal, b: Signal) => b.weight - a.weight)
                      .map((s, i) => (
                        <li key={s.id} className="flex gap-4">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-maroon font-display text-sm text-paper">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium text-maroon">
                              {s.text}
                            </p>
                            <p className="mt-2 text-[13px] leading-[1.7] text-ink/70">
                              {s.action}
                            </p>
                          </div>
                        </li>
                      ))}
                  </ol>
                </div>
              ) : null}

              <div className="mt-5 rounded-3xl bg-maroon p-7 text-paper">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold">
                  If money has already moved
                </p>
                <p className="mt-4 text-[13px] leading-[1.7] text-paper/75">
                  Contact your bank immediately and ask them to recall the transfer —
                  this is most effective within 24 to 48 hours. Then report to the
                  Directorate of Criminal Investigations and, for construction
                  matters, to the National Construction Authority.
                </p>
                <Link
                  to="/scam-warning"
                  className="mt-5 block rounded-2xl bg-gradient-to-r from-gold to-gold-light px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-maroon transition-transform hover:scale-[1.02]"
                >
                  Full reporting guidance
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-stone/50 py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Why this exists
              </p>
              <h2 className="mt-3 font-display text-4xl text-maroon">
                The people who get defrauded are usually careful people
              </h2>
              <div className="mt-6 space-y-4 text-[15px] leading-[1.75] text-ink/75">
                <p>
                  Diaspora construction fraud does not target the careless. It targets
                  people who are diligent, who ask questions, who have savings and
                  want to do the right thing with them. Every reported case follows
                  the same shape: an attractive offer, a deadline, a payment request,
                  then silence.
                </p>
                <p>
                  The problem is not that people fail to be careful. It is that
                  verifying properly is unfamiliar, slow, and uncomfortable — which
                  is exactly what a scam depends on.
                </p>
                <p>
                  So we made the checks explicit. Each one is free, takes minutes, and
                  works on anyone, including us.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-maroon p-8 text-paper md:p-9">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gold">
                The three checks that catch almost everything
              </p>
              <ol className="mt-6 space-y-6">
                {[
                  [
                    "Search the NCA register yourself",
                    "Every contractor in Kenya must be registered. Search the number on nca.go.ke and confirm the categories cover your project. No number, or no match, ends it.",
                  ],
                  [
                    "Never pay a personal account",
                    "Corporate payment goes to a company account. Personal accounts, mobile money numbers, and crypto are the strongest fraud indicator there is.",
                  ],
                  [
                    "Nothing is agreed until it is written",
                    "A WhatsApp agreement has no scope, no price and no remedy. If there is no contract with drawings, a specification and a payment schedule, no money should move.",
                  ],
                ].map(([t, b], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="font-display text-2xl text-gold/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-[15px] font-medium text-paper">{t}</p>
                      <p className="mt-2 text-[13px] leading-[1.7] text-paper/65">
                        {b}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-7 border-t border-paper/15 pt-5 text-[13px] leading-relaxed text-paper/55">
                These apply to ATRO exactly as they apply to anyone else. Our contact
                details are on{" "}
                <Link to="/verify" className="text-gold underline underline-offset-2">
                  the verification page
                </Link>{" "}
                — or call {COMPANY.phoneDisplay} and check the number matches.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="Checked them and they came back clean?"
        body="Good. Now verify us the same way, and if everything reconciles, we can talk about your plot."
      />
    </>
  );
}

function SignalRow({
  signal,
  on,
  onToggle,
}: {
  signal: Signal;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={cn(
        "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all",
        on
          ? "border-maroon bg-maroon text-paper shadow-[0_6px_24px_rgb(60_5_8/0.2)]"
          : "border-ink/10 bg-white hover:border-maroon/40",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
          on ? "border-gold bg-gold text-maroon" : "border-ink/25 bg-white",
        )}
      >
        {on ? "✓" : ""}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[14px] leading-snug",
            on ? "text-paper" : "text-ink/80",
          )}
        >
          {signal.text}
        </span>
      </span>
    </button>
  );
}
