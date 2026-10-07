import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  PORTAL_PROJECT,
  MILESTONES,
  PAYMENTS,
  VAULT,
  DECISIONS,
  PROFESSIONALS,
  CONTRACTOR,
  WEEKLY_REPORT,
} from "@/lib/diaspora/portal";
import { cn } from "@/lib/utils";
import { CtaBand } from "@/components/page-hero";

export const Route = createFileRoute("/portal")({
  component: PortalPage,
  head: () => ({
    meta: [
      { title: "Client project portal — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "See what a diaspora client's project dashboard actually contains: milestones with photographic evidence, a payment ledger with retention, a document vault, a decision log and verified professionals.",
      },
    ],
  }),
});

const KES = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

function kes(n: number) {
  return `KES ${KES.format(n)}`;
}

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  complete: { label: "Complete", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  active: { label: "In progress", cls: "bg-amber-50 text-amber-900 border-amber-300" },
  pending: { label: "Not started", cls: "bg-stone-100 text-stone-600 border-stone-200" },
  blocked: { label: "Blocked", cls: "bg-red-50 text-red-800 border-red-200" },
};

const PAYMENT_STYLES: Record<string, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  certified: { label: "Certified — awaiting release", cls: "bg-amber-50 text-amber-900 border-amber-300" },
  due: { label: "Due on certification", cls: "bg-sky-50 text-sky-900 border-sky-300" },
  scheduled: { label: "Scheduled", cls: "bg-stone-100 text-stone-600 border-stone-200" },
  retained: { label: "Held in retention", cls: "bg-burgundy/10 text-burgundy border-burgundy/25" },
};

function Pill({ children, cls }: { children: React.ReactNode; cls: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
        cls,
      )}
    >
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-2xl leading-tight",
          tone === "good" && "text-emerald-800",
          tone === "warn" && "text-amber-800",
          tone === "default" && "text-maroon",
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-1.5 text-[12px] leading-snug text-ink/55">{sub}</p> : null}
    </div>
  );
}

function PortalPage() {
  const p = PORTAL_PROJECT;
  const paid = PAYMENTS.filter((x) => x.status === "paid");
  const awaiting = PAYMENTS.filter((x) => x.status === "certified");
  const scheduled = PAYMENTS.filter((x) => x.status === "scheduled");
  const openDecisions = DECISIONS.filter((d) => d.state !== "decided");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-maroon pt-28 pb-16 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/60 via-maroon to-maroon" />
        <div className="pointer-events-none absolute -top-24 right-0 size-[460px] rounded-full bg-gold/10 blur-[150px]" />

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2">
                <span className="size-1.5 rounded-full bg-gold" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
                  Live client portal — demonstration project
                </p>
              </div>
              <h1 className="reveal mt-6 font-display text-5xl text-paper sm:text-6xl">
                Your build, from anywhere
              </h1>
              <p className="reveal reveal-delay-1 mt-6 text-lg text-paper/75">
                This is what a diaspora client sees. Not promises about reporting
                and verification — the actual record: milestones with photographic
                evidence, a payment ledger with retention, every approval and
                certificate, every decision, and the registration numbers of the
                people responsible.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-paper/15 bg-paper/5 p-5 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold">
                Project reference
              </p>
              <p className="mt-2 font-display text-2xl text-paper">{p.reference}</p>
              <p className="mt-3 text-[13px] text-paper/60">{p.title}</p>
              <p className="mt-1 text-[12px] text-paper/45">{p.client}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Project header strip */}
      <section className="border-b border-ink/10 bg-cream">
        <div className="mx-auto max-w-[1400px] px-6 py-6 sm:px-8 md:px-12 lg:px-16">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              ["Client", p.client],
              ["Plot", p.plot],
              ["Area", p.area],
              ["Contract", p.contractType],
              ["Started", p.started],
              ["Target handover", p.targetHandover],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  {k}
                </dt>
                <dd className="mt-1.5 text-[13px] leading-snug text-ink/75">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Progress + budget */}
      <section className="bg-paper py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
            {/* Overall progress */}
            <div className="rounded-3xl border border-ink/10 bg-white p-7 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                    Current stage
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-maroon">{p.stage}</h2>
                </div>
                <Pill cls={STATUS_STYLES.active.cls}>{STATUS_STYLES.active.label}</Pill>
              </div>

              <div className="mt-8">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] text-ink/60">Overall completion</span>
                  <span className="font-display text-2xl text-maroon">
                    {p.overallProgress}%
                  </span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                    style={{ width: `${p.overallProgress}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-[12px] text-ink/50">
                  <span>Day {p.schedule.daysElapsed} of {p.schedule.daysTotal}</span>
                  <span>{p.schedule.daysRemaining} days remaining</span>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-emerald-50 p-5">
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-emerald-800">
                  Programme status
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-emerald-900">
                  On track. {p.schedule.note} No slippage has been absorbed by
                  shortening curing or deferring quality checks.
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-ink/10 bg-cream p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                      Next call
                    </p>
                    <p className="mt-1.5 text-[15px] text-maroon">{p.nextCall.when}</p>
                    <p className="text-[12px] text-ink/50">
                      {p.nextCall.localTimeForYou} for you — scheduled, not negotiated
                      weekly
                    </p>
                  </div>
                  <span className="hidden shrink-0 rounded-full bg-maroon px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-paper sm:inline-block">
                    Booked
                  </span>
                </div>
                <ul className="mt-4 space-y-2 border-t border-ink/10 pt-4">
                  {p.nextCall.agenda.map((a) => (
                    <li key={a} className="flex gap-2.5 text-[13px] text-ink/70">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Budget */}
            <div className="rounded-3xl border border-ink/10 bg-white p-7 md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                Open book cost tracking
              </p>
              <h2 className="mt-2 font-display text-3xl text-maroon">Budget</h2>

              <dl className="mt-7 space-y-4">
                {[
                  ["Contract value (BOQ priced)", kes(p.contractValue), false],
                  ["Certified to date", kes(p.budget.certifiedToDate), false],
                  ["Paid to date", kes(p.budget.paidToDate), false],
                  [
                    "Currently certified, awaiting release",
                    kes(p.budget.currentlyCertified),
                    true,
                  ],
                  [
                    `Retention held (${p.budget.retentionPct}%)`,
                    kes(p.budget.retentionHeld),
                    true,
                  ],
                ].map(([k, v, highlight]) => (
                  <div
                    key={k as string}
                    className="flex items-baseline justify-between gap-4 border-b border-ink/8 pb-3"
                  >
                    <dt className="text-[13px] text-ink/60">{k}</dt>
                    <dd
                      className={cn(
                        "text-[15px]",
                        highlight ? "text-burgundy" : "text-maroon",
                      )}
                    >
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 rounded-2xl bg-maroon p-5 text-paper">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  Projection at completion
                </p>
                <p className="mt-2 font-display text-2xl">
                  {kes(p.budget.projectedAtCompletion)}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-paper/70">
                  A projected{" "}
                  {(
                    ((p.budget.projectedAtCompletion - p.boqValue) / p.boqValue) *
                    100
                  ).toFixed(1)}
                  % above contract, arising from one approved variation (utility
                  connection relocation, KES 285,000) and a client-selected kitchen
                  upgrade. Both are itemised in the decision log. There are no
                  unapproved variations on this project.
                </p>
              </div>

              <p className="mt-5 text-[12px] leading-relaxed text-ink/50">
                You can see every material price, labour rate and subcontractor
                quote behind these figures. Open-book costing means the numbers are
                available to you, not hidden behind a margin you cannot examine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones + evidence */}
      <section className="bg-stone/50 py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Milestones and evidence
              </p>
              <h2 className="mt-3 font-display text-4xl text-maroon md:text-5xl">
                Every stage, with proof
              </h2>
            </div>
            <p className="max-w-md text-[14px] text-ink/60">
              Photographs are captured at the moment before work becomes invisible.
              Once concrete is poured, nothing can be verified by any means — so the
              record has to exist first.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {MILESTONES.map((m) => {
              const style = STATUS_STYLES[m.status];
              const evidence = m.evidence ?? [];
              return (
                <details
                  key={m.id}
                  className={cn(
                    "group overflow-hidden rounded-3xl border bg-white transition-colors",
                    m.status === "active"
                      ? "border-amber-300 shadow-[0_8px_40px_rgb(201_146_79/0.18)]"
                      : "border-ink/10",
                  )}
                  open={m.status === "active"}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-4 p-5 md:gap-6 md:p-6 [&::-webkit-details-marker]:hidden">
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-full font-display text-lg",
                        m.status === "complete" && "bg-emerald-600 text-white",
                        m.status === "active" && "bg-gold text-maroon",
                        m.status === "pending" && "bg-ink/8 text-ink/40",
                      )}
                    >
                      {m.status === "complete" ? "✓" : m.order}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="font-display text-xl text-maroon md:text-2xl">
                          {m.name}
                        </span>
                        <Pill cls={style.cls}>{style.label}</Pill>
                      </span>
                      <span className="mt-1.5 block text-[12px] text-ink/45">
                        {m.stage} · {m.plannedStart} – {m.plannedEnd}
                        {m.actualEnd ? ` · completed ${m.actualEnd}` : ""}
                      </span>
                    </span>

                    <span className="hidden w-40 shrink-0 sm:block">
                      <span className="block text-right text-[12px] text-ink/50">
                        {m.progress}%
                      </span>
                      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-ink/10">
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            m.status === "complete"
                              ? "bg-emerald-600"
                              : "bg-gradient-to-r from-gold to-gold-light",
                          )}
                          style={{ width: `${m.progress}%` }}
                        />
                      </span>
                    </span>

                    <span className="shrink-0 text-ink/30 transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>

                  <div className="border-t border-ink/8 px-5 pb-6 pt-5 md:px-6">
                    <p className="max-w-3xl text-[14px] leading-relaxed text-ink/75">
                      {m.summary}
                    </p>

                    {m.verifiedBy ? (
                      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[12px] font-medium text-emerald-900">
                        <span aria-hidden>✓</span>
                        Verified: {m.verifiedBy}
                      </p>
                    ) : null}

                    {evidence.length > 0 ? (
                      <div className="mt-7">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                          Photographic record — {evidence.length} items
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {evidence.map((e) => (
                            <div
                              key={`${m.id}-${e.date}-${e.caption}`}
                              className="rounded-2xl border border-ink/10 bg-cream p-4"
                            >
                              {/* Placeholder frame standing in for the site photograph */}
                              <div className="mb-3 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-burgundy/25 via-maroon/15 to-gold/15">
                                <span className="rounded-lg border border-paper/40 bg-maroon/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-paper">
                                  Site photo
                                </span>
                              </div>
                              <p className="text-[11px] uppercase tracking-[0.14em] text-gold">
                                {e.date}
                              </p>
                              <p className="mt-1.5 text-[14px] font-medium text-maroon">
                                {e.caption}
                              </p>
                              <p className="mt-2 text-[13px] leading-relaxed text-ink/60">
                                {e.detail}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      {/* Payment ledger */}
      <section className="bg-paper py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
              Payment ledger
            </p>
            <h2 className="mt-3 font-display text-4xl text-maroon md:text-5xl">
              Pay for work, not promises
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink/70">
              Every payment is tied to a stage, released against a certificate from
              a registered quantity surveyor, and referenced to that certificate in
              the bank transfer. {kes(p.budget.retentionHeld)} of retention is held
              against defects and is not payable until they close.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-3xl">
            <Stat label="Paid" value={kes(p.budget.paidToDate)} sub={`${paid.length} certificates settled`} tone="good" />
            <Stat label="Certified" value={kes(p.budget.currentlyCertified)} sub={`${awaiting.length} awaiting your release`} tone="warn" />
            <Stat label="Scheduled" value={kes(scheduled.reduce((s, x) => s + x.amount, 0))} sub="Later stages, not yet due" />
            <Stat label="Retention" value={kes(p.budget.retentionHeld)} sub={`${p.budget.retentionPct}% held for defects`} />
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-ink/10 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="border-b border-ink/10 bg-cream">
                  <tr className="text-[10px] uppercase tracking-[0.14em] text-ink/50">
                    <th className="px-6 py-4 font-bold">Stage</th>
                    <th className="px-6 py-4 font-bold">Amount</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Certificate</th>
                    <th className="px-6 py-4 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYMENTS.map((pay) => {
                    const style = PAYMENT_STYLES[pay.status];
                    return (
                      <tr
                        key={pay.id}
                        className="border-b border-ink/6 last:border-0 align-top"
                      >
                        <td className="px-6 py-4">
                          <p className="text-[14px] font-medium text-maroon">
                            {pay.label}
                          </p>
                          {pay.note ? (
                            <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-ink/50">
                              {pay.note}
                            </p>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[14px] text-maroon">
                          {kes(pay.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <Pill cls={style.cls}>{style.label}</Pill>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[13px] text-ink/60">
                          {pay.certificate ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[13px] text-ink/60">
                          {pay.paidDate ?? pay.dueDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Vault + decisions */}
      <section className="bg-stone/50 py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Document vault */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Document vault
              </p>
              <h2 className="mt-3 font-display text-3xl text-maroon md:text-4xl">
                Everything, in one place
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-ink/65">
                The contract, the approved plans, every certificate, every receipt and
                every weekly report. You own this record. If the relationship ends,
                it does not leave with us.
              </p>

              <ul className="mt-7 space-y-2.5">
                {VAULT.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-start gap-4 rounded-2xl border border-ink/10 bg-white p-4"
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-maroon text-[9px] font-bold uppercase tracking-wider text-paper">
                      {d.category.slice(0, 3)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-medium text-maroon">
                          {d.name}
                        </span>
                        {d.state === "verified" ? (
                          <Pill cls="bg-emerald-50 text-emerald-800 border-emerald-200">
                            Verified
                          </Pill>
                        ) : d.state === "signed" ? (
                          <Pill cls="bg-sky-50 text-sky-900 border-sky-300">
                            Signed
                          </Pill>
                        ) : (
                          <Pill cls="bg-amber-50 text-amber-900 border-amber-300">
                            Pending
                          </Pill>
                        )}
                      </span>
                      <span className="mt-1 block text-[12px] text-ink/50">
                        {d.category} · {d.reference} · {d.issued} · {d.size}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decision log */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Decision log
              </p>
              <h2 className="mt-3 font-display text-3xl text-maroon md:text-4xl">
                Nothing agreed by memory
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-ink/65">
                Every decision with its date, the options considered, what was chosen
                and what it cost. {openDecisions.length} are currently open. This is
                the document that means month nine never becomes an argument about
                month three.
              </p>

              <ul className="mt-7 space-y-3">
                {DECISIONS.map((d) => (
                  <li
                    key={d.id}
                    className={cn(
                      "rounded-2xl border p-5",
                      d.state === "awaiting-client"
                        ? "border-amber-300 bg-amber-50/50"
                        : "border-ink/10 bg-white",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-gold">
                        {d.date}
                      </p>
                      {d.state === "awaiting-client" ? (
                        <Pill cls="bg-amber-100 text-amber-900 border-amber-300">
                          Your decision needed
                        </Pill>
                      ) : d.state === "open" ? (
                        <Pill cls="bg-stone-100 text-stone-600 border-stone-300">
                          Open
                        </Pill>
                      ) : (
                        <Pill cls="bg-emerald-50 text-emerald-800 border-emerald-200">
                          Decided
                        </Pill>
                      )}
                    </div>
                    <p className="mt-2 text-[15px] font-medium text-maroon">{d.title}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink/65">
                      {d.detail}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {d.options.map((o) => (
                        <span
                          key={o}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px]",
                            o === d.chosen
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                              : "border-ink/12 text-ink/55",
                          )}
                        >
                          {o}
                          {o === d.chosen ? " ✓" : ""}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 border-t border-ink/8 pt-3 text-[12px] text-ink/50">
                      Cost impact:{" "}
                      <span className="font-medium text-burgundy">
                        {d.costImpact === 0
                          ? "No change"
                          : `${d.costImpact > 0 ? "+" : "−"}${kes(Math.abs(d.costImpact))}`}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Professionals */}
      <section className="bg-paper py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Who is responsible
              </p>
              <h2 className="mt-3 font-display text-4xl text-maroon">
                Named, and checkable
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-ink/70">
                Every professional on your project, named, with the registration
                number that governs their work and the body that holds it. You do not
                need to take our word for any of it — search each number yourself.
              </p>

              <div className="mt-8 rounded-3xl border border-maroon/20 bg-maroon p-6 text-paper">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold">
                  Main contractor
                </p>
                <p className="mt-2 font-display text-2xl">{CONTRACTOR.name}</p>
                <dl className="mt-4 space-y-2 text-[13px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-paper/55">NCA registration</dt>
                    <dd className="text-gold">{CONTRACTOR.ncaNo}</dd>
                  </div>
                </dl>
                <p className="mt-4 border-t border-paper/15 pt-4 text-[12px] leading-relaxed text-paper/65">
                  {CONTRACTOR.ncaCategories.join(" · ")}
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-paper/55">
                  {CONTRACTOR.note}
                </p>
              </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {PROFESSIONALS.map((pro) => (
                <li
                  key={pro.regNo}
                  className="rounded-2xl border border-ink/10 bg-white p-5"
                >
                  <p className="font-display text-xl text-maroon">{pro.name}</p>
                  <p className="mt-1 text-[13px] text-burgundy">{pro.role}</p>
                  <p className="mt-3 text-[12px] leading-relaxed text-ink/55">
                    {pro.body}
                  </p>
                  <p className="mt-3 rounded-lg bg-cream px-3 py-2 font-mono text-[12px] text-maroon">
                    {pro.regNo}
                  </p>
                  <a
                    href={pro.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-gold transition-colors hover:text-maroon"
                  >
                    Verify at {new URL(pro.verifyUrl).hostname.replace(/^www\./, "")} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 rounded-3xl border border-ink/10 bg-cream p-7 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  Weekly report — {WEEKLY_REPORT.week}, {WEEKLY_REPORT.period}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
                  {WEEKLY_REPORT.summary}
                </p>
                <p className="mt-3 text-[12px] text-ink/50">
                  Prepared by {WEEKLY_REPORT.preparedBy} · {WEEKLY_REPORT.photos}{" "}
                  photographs attached
                </p>
              </div>
              <Link
                to="/guides/$slug"
                params={{ slug: "managing-a-build-remotely" }}
                className="shrink-0 rounded-2xl border border-maroon/20 bg-white px-6 py-3.5 text-center text-[11px] uppercase tracking-[0.16em] font-bold text-maroon transition-colors hover:bg-maroon hover:text-paper"
              >
                How we report
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBand
        title="See this with your own project on it"
        body="The demonstration above uses a sample project. Yours would carry your reference, your milestones, your certificates and your documents — with the same structure and the same cadence."
      />
    </>
  );
}
