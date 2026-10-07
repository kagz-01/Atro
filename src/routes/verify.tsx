import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { REGISTERS, VERIFY_STEPS, FALSE_PROOF, type Register } from "@/lib/diaspora/verify";
import { CtaBand } from "@/components/page-hero";
import { COMPANY } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/verify")({
  component: VerifyPage,
  head: () => ({
    meta: [
      { title: "Verify anyone, including us — ATRO" },
      {
        name: "description",
        content:
          "The Kenyan registers that prove a builder or professional is real, how to search each one yourself, and what common claims do not actually prove anything.",
      },
    ],
  }),
});

function RegisterCard({ r, i }: { r: Register; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-5 p-6 text-left"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-maroon font-display text-lg text-paper">
          {i + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-xl text-maroon">{r.body}</span>
          <span className="mt-1.5 block text-[13px] leading-relaxed text-ink/60">
            Proves that {r.proves.toLowerCase()}
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 text-ink/30 transition-transform",
            open && "rotate-180",
          )}
        >
          ▾
        </span>
      </button>

      {open ? (
        <div className="border-t border-ink/8 px-6 pb-6 pt-5">
          <dl className="space-y-4 text-[14px] leading-relaxed">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                Full name
              </dt>
              <dd className="mt-1 text-ink/75">{r.fullName}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                What it covers
              </dt>
              <dd className="mt-1 text-ink/75">{r.covers}</dd>
            </div>
            <div className="rounded-2xl border-l-[3px] border-l-emerald-600 bg-emerald-50/70 px-5 py-4">
              <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
                What it proves
              </dt>
              <dd className="mt-1.5 text-emerald-950">{r.proves}</dd>
            </div>
            <div className="rounded-2xl border-l-[3px] border-l-red-600 bg-red-50/70 px-5 py-4">
              <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-800">
                What it does not prove
              </dt>
              <dd className="mt-1.5 text-red-950">{r.doesNotProve}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                How to search it
              </dt>
              <dd className="mt-1 text-ink/75">{r.searchNote}</dd>
            </div>
          </dl>

          {r.url ? (
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-maroon px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-burgundy"
            >
              Open {new URL(r.url).hostname.replace(/^www\./, "")} ↗
            </a>
          ) : (
            <p className="mt-5 text-[13px] text-ink/50">
              County offices are physical — visit or write to the planning department
              with your plot number.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function VerifyPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-maroon pt-28 pb-16 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/60 via-maroon to-maroon" />
        <div className="pointer-events-none absolute -top-20 right-10 size-[420px] rounded-full bg-gold/10 blur-[150px]" />

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
            Verification
          </p>
          <h1 className="reveal mt-4 max-w-4xl font-display text-5xl text-paper sm:text-6xl md:text-7xl">
            Check us the same way you would check anyone
          </h1>
          <p className="reveal reveal-delay-1 mt-6 max-w-2xl text-lg text-paper/75">
            Trust that depends on our word is not worth much. These are the Kenyan
            registers that prove a builder or professional is real, how to search
            each one yourself, and what several common claims genuinely do not prove.
          </p>

          <div className="reveal reveal-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              to="/scam-check"
              className="rounded-2xl bg-gradient-to-r from-gold to-gold-light px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-maroon shadow-glow-gold transition-transform hover:scale-[1.02]"
            >
              Check a builder you were approached by
            </Link>
            <Link
              to="/scam-warning"
              className="rounded-2xl border border-paper/25 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-paper transition-colors hover:border-gold hover:text-gold"
            >
              Read the scam warning
            </Link>
          </div>
        </div>
      </section>

      {/* ATRO's own details */}
      <section className="bg-paper py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Start with us
              </p>
              <h2 className="mt-3 font-display text-4xl text-maroon">
                {COMPANY.name}
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-ink/70">
                Everything below is contactable without us. If any of it does not
                resolve, or does not match what you were told, stop and ask us why
                before doing anything else.
              </p>

              <dl className="mt-8 space-y-4">
                {[
                  ["Location", COMPANY.address],
                  ["Phone", COMPANY.phoneDisplay],
                  ["Email", COMPANY.email],
                  ["Hours", COMPANY.hours],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3"
                  >
                    <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                      {k}
                    </dt>
                    <dd className="text-[14px] text-maroon">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 rounded-3xl border-l-[3px] border-l-gold bg-cream p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  Our position on this
                </p>
                <p className="mt-3 text-[14px] leading-[1.7] text-ink/80">
                  A studio that discourages verification is telling you something. We
                  publish our professionals, their registration numbers and the
                  registers that hold them. On a live project, yours sit in your
                  document vault with the link to check each one.
                </p>
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Eight checks, about two hours
              </p>
              <ol className="mt-6 space-y-3">
                {VERIFY_STEPS.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex gap-4 rounded-2xl border border-ink/10 bg-white p-5"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-maroon font-display text-sm text-paper">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-maroon">
                        {s.title}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink/65">
                        {s.body}
                      </p>
                      <p className="mt-2.5 text-[11px] uppercase tracking-[0.12em] text-ink/40">
                        {s.cost} · {s.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Registers */}
      <section className="bg-stone/50 py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
              The registers that matter
            </p>
            <h2 className="mt-3 font-display text-4xl text-maroon md:text-5xl">
              Eight bodies, and what each one proves
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink/70">
              Each register proves something specific and no more. Understanding what
              a registration does <em>not</em> establish is as important as checking
              it in the first place.
            </p>
          </div>

          <div className="mt-9 space-y-3">
            {REGISTERS.map((r, i) => (
              <RegisterCard key={r.id} r={r} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* False proof */}
      <section className="bg-paper py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
              Commonly mistaken for proof
            </p>
            <h2 className="mt-3 font-display text-4xl text-maroon md:text-5xl">
              Things that look like evidence and are not
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink/70">
              These are the arguments and documents most often accepted as
              reassurance. None of them establish anything, because none of them can
              be checked at source.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {FALSE_PROOF.map((f) => (
              <div
                key={f.claim}
                className="rounded-2xl border border-red-200 bg-red-50/40 p-6"
              >
                <p className="text-[15px] font-medium text-red-950">
                  <span className="mr-2 text-red-600" aria-hidden>
                    ✗
                  </span>
                  {f.claim}
                </p>
                <p className="mt-3 text-[14px] leading-[1.7] text-red-950/75">
                  {f.why}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-maroon p-8 text-paper md:p-10">
            <h3 className="font-display text-2xl text-gold">
              The one principle behind all of it
            </h3>
            <p className="mt-4 max-w-3xl text-[15px] leading-[1.75] text-paper/80">
              Verify at source, not at face value. Anything a person who wants your
              money can produce for you can be forged. Anything you can look up
              independently on an official register cannot be. If a claim cannot be
              checked at source, it is not a claim — it is a promise, and promises in
              this industry are not worth what they cost.
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        title="Verified, or not interested"
        body="If you have run these checks and they pass, we are glad to talk. If something did not resolve, tell us what it was — we would rather know."
        ctaLabel="Start a project"
      />
    </>
  );
}
