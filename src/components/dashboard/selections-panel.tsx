import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import {
  chooseSelectionOption,
  listMySelections,
} from "@/lib/selections-server";
import {
  allowanceVerdict,
  canChoose,
  daysUntil,
  kes,
  kesShort,
  summariseAllowances,
  verdictLine,
  type Selection,
} from "@/lib/selections";
import { listMyVariations } from "@/lib/variations-server";
import { signedKes, type Variation } from "@/lib/variations";
import { cn } from "@/lib/utils";

/**
 * The client's priced choices.
 *
 * Each selection carries an allowance — money already set aside in the contract
 * — and options with real totals. The client picks in their own time, sees
 * exactly how the choice lands against the allowance, and the answer is written
 * into the decision log with a date.
 *
 * A choice over the allowance is never applied silently. It says so, in those
 * words, and it becomes a variation the studio prices and the client approves.
 * That sentence is the reason the tab exists.
 */
export function SelectionsPanel({
  projectId,
  onChanged,
}: {
  projectId: string;
  onChanged?: () => void;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-selections", projectId],
    queryFn: () => listMySelections({ data: { projectId } }),
  });
  // Shared with the Changes panel: a variation sent from here shows in both
  // places without either side needing a second round trip.
  const { data: variations } = useQuery({
    queryKey: ["my-variations", projectId],
    queryFn: () => listMyVariations({ data: { projectId } }),
  });

  const choose = useMutation({
    mutationFn: chooseSelectionOption,
    onSuccess: () => {
      toast.success("Your choice has been recorded.");
      void queryClient.invalidateQueries({ queryKey: ["my-selections", projectId] });
      onChanged?.();
    },
  });

  if (isLoading) {
    return (
      <Panel title="Selections">
        <div className="h-40 animate-pulse rounded-xl bg-ink/6" />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Selections">
        <p className="text-[13px] text-red-700">
          {error instanceof Error ? error.message : "Could not load your selections."}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => void refetch()}
        >
          Try again
        </Button>
      </Panel>
    );
  }

  const selections = data ?? [];
  const summary = summariseAllowances(selections);

  if (selections.length === 0) {
    return (
      <Panel
        title="Selections"
        subtitle="Nothing is waiting on you at the moment"
      >
        <p className="max-w-2xl text-[13px] leading-relaxed text-ink/65">
          When the studio needs you to choose a finish, a material or a fitting, it
          appears here with the options, their prices and the allowance already set
          aside for it in your contract. You choose in your own time, and the answer
          is recorded with the date.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Waiting on you"
          value={String(summary.open)}
          sub={
            summary.open > 0
              ? summary.awaitingChoice.map((s) => s.title).join(", ")
              : "Nothing outstanding"
          }
          icon={SlidersHorizontal}
          tone={summary.open > 0 ? "warn" : "good"}
        />
        <StatCard
          label="Allowance set aside"
          value={kesShort(summary.allowance)}
          exact={kes(summary.allowance)}
          sub="Across every selection"
          icon={CheckCircle2}
        />
        <StatCard
          label="Committed"
          value={kesShort(summary.committed)}
          exact={kes(summary.committed)}
          sub={`${summary.chosen} of ${summary.count} chosen`}
          icon={Check}
        />
        <StatCard
          label={
            summary.variance > 0
              ? "Over chosen allowance"
              : summary.variance < 0
                ? "Under chosen allowance"
                : "Chosen items on allowance"
          }
          value={kesShort(Math.abs(summary.variance))}
          exact={kes(summary.variance)}
          sub={
            summary.variance > 0
            ? "On chosen items; to be priced as a variation, not added to the bill"
              : summary.variance < 0
              ? "Allowance remaining on chosen items only"
              : summary.chosen > 0
                ? "Chosen items match their allowances"
                : "No choices recorded yet"
          }
          icon={AlertTriangle}
          tone={summary.variance > 0 ? "warn" : "good"}
        />
      </div>

      {selections.map((s) => (
        <SelectionCard
          key={s.id}
          selection={s}
          variation={
            (variations ?? []).find(
              (v) => v.sourceKind === "selection" && v.sourceId === s.id,
            ) ?? null
          }
          busy={choose.isPending}
          error={
            choose.error instanceof Error ? choose.error.message : null
          }
          onChoose={(optionId) => choose.mutate({ data: { selectionId: s.id, optionId } })}
        />
      ))}
    </div>
  );
}

function SelectionCard({
  selection,
  variation,
  busy,
  error,
  onChoose,
}: {
  selection: Selection;
  /** The variation raised from this choice, once the studio has priced it. */
  variation: Variation | null;
  busy: boolean;
  error: string | null;
  onChoose: (optionId: string) => void;
}) {
  const verdict = allowanceVerdict(selection);
  const gate = canChoose(selection, new Date());
  const days = daysUntil(selection.deadline, new Date());
  const [picked, setPicked] = useState<string | null>(null);

  const urgent = days !== null && days <= 3 && selection.status === "open";

  return (
    <Panel
      title={selection.title}
      subtitle={[selection.category, selection.stage].filter(Boolean).join(" · ")}
      actions={
        selection.status === "chosen" ? (
          <Badge tone="gold">Chosen</Badge>
        ) : selection.status === "closed" ? (
          <Badge tone="gold">Closed</Badge>
        ) : days !== null ? (
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]",
              days < 0
                ? "border-stone-300 bg-stone/100 text-stone-600"
                : urgent
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-amber-300 bg-amber-50 text-amber-900",
            )}
          >
            <Clock className="mr-1 inline size-3" />
            {days < 0
              ? "Deadline passed"
              : days === 0
                ? "Choose today"
                : `${days} day${days === 1 ? "" : "s"} left`}
          </span>
        ) : null
      }
    >
      {selection.note ? (
        <p className="mb-4 text-[13px] leading-relaxed text-ink/65">{selection.note}</p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
        {/* the options */}
        <div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {selection.options.map((o) => {
              const isChosen = selection.chosenOptionId === o.id;
              const over = o.price - selection.allowance;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    disabled={!gate.ok || busy}
                    aria-pressed={isChosen || picked === o.id}
                    onClick={() => setPicked(o.id)}
                    className={cn(
                      "flex h-full w-full flex-col rounded-2xl border p-4 text-left transition-colors",
                      isChosen
                        ? "border-emerald-500 bg-emerald-50"
                        : picked === o.id
                          ? "border-gold bg-gold/10"
                          : "border-ink/12 hover:border-burgundy",
                      !gate.ok && "cursor-default opacity-80",
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-[14px] font-medium text-maroon">{o.label}</span>
                      {o.recommended ? (
                        <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-gold">
                          Studio&rsquo;s pick
                        </span>
                      ) : null}
                    </span>

                    {o.description ? (
                      <span className="mt-1.5 block text-[12px] leading-snug text-ink/60">
                        {o.description}
                      </span>
                    ) : null}

                    <span className="mt-3 block text-[15px] text-maroon">{kes(o.price)}</span>

                    <span className="mt-1 block text-[11px]">
                      {selection.allowance > 0 ? (
                        over > 0 ? (
                          <span className="text-amber-800">
                            {kes(over)} over the allowance
                          </span>
                        ) : (
                          <span className="text-emerald-800">
                            {kes(-over)} under the allowance
                          </span>
                        )
                      ) : (
                        <span className="text-muted">No allowance fixed yet</span>
                      )}
                    </span>

                    <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
                      {o.supplier ? <span>{o.supplier}</span> : null}
                      {o.leadTime ? <span>Lead time {o.leadTime}</span> : null}
                    </span>

                    {isChosen ? (
                      <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-800">
                        <Check className="size-3.5" />
                        Your choice
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          {selection.status === "open" ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                disabled={!picked || busy || !gate.ok}
                onClick={() => picked && onChoose(picked)}
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Record this choice
              </Button>
              {picked ? (
                <p className="text-[12px] text-ink/55">
                  {(() => {
                    const option = selection.options.find((o) => o.id === picked);
                    if (!option) return "";
                    const delta = option.price - selection.allowance;
                    return delta > 0
                      ? `${kes(delta)} over the allowance — the studio will send it as a variation to approve.`
                      : `Within the allowance by ${kes(Math.abs(delta))}.`;
                  })()}
                </p>
              ) : (
                <p className="text-[12px] text-muted">
                  Choose before the deadline. Once recorded, contact the studio if
                  you need to request a change.
                </p>
              )}
            </div>
          ) : null}

          {!gate.ok ? (
            <p className="mt-3 text-[12px] text-muted">{gate.reason}</p>
          ) : null}

          {error ? (
            <p role="alert" className="mt-3 text-[12px] text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        {/* the allowance */}
        <aside className="rounded-2xl border border-ink/10 bg-cream p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
            Allowance
          </p>
          <p className="mt-2 font-display text-2xl text-maroon">
            {selection.allowance > 0 ? kes(selection.allowance) : "Not fixed"}
          </p>
          <p className="mt-1.5 text-[12px] leading-snug text-ink/55">
            Already set aside in your contract for {selection.title.toLowerCase()}.
          </p>

          {selection.chosenOptionId && verdict.chosen ? (
            <>
              {selection.allowance > 0 ? (
                <div className="mt-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                    <p className="text-[11px] font-medium text-ink/65">
                      Price vs allowance
                    </p>
                    <p className="text-[11px] font-semibold text-maroon">
                      {Math.round((verdict.price / verdict.allowance) * 100)}% of allowance
                    </p>
                  </div>
                  <div
                    role="img"
                    aria-label={`Chosen price ${kes(verdict.price)}. Allowance ${kes(verdict.allowance)}.`}
                    className="relative mt-2 h-3 rounded-full bg-ink/10"
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gold"
                      style={{
                        width: `${(verdict.price / Math.max(verdict.price, verdict.allowance)) * 100}%`,
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute -bottom-1 -top-1 w-0.5 bg-maroon"
                      style={{
                        left: `${(verdict.allowance / Math.max(verdict.price, verdict.allowance)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="mt-3 space-y-2 text-[11px]">
                    <div>
                      <p className="flex items-center gap-1.5 text-ink/60">
                        <span className="size-2 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                        Chosen price
                      </p>
                      <p className="mt-0.5 pl-3.5 font-medium text-ink/75">
                        {kes(verdict.price)}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-ink/60">
                        <span className="h-3 w-0.5 shrink-0 bg-maroon" aria-hidden="true" />
                        Allowance
                      </p>
                      <p className="mt-0.5 pl-3.5 font-medium text-ink/75">
                        {kes(verdict.allowance)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-[12px] text-ink/55">
                  No allowance was set for comparison. Chosen price: {kes(verdict.price)}.
                </p>
              )}
              <p
                className={cn(
                  "mt-3 text-[12px] leading-relaxed",
                  variation
                    ? variation.status === "proposed"
                      ? "text-amber-900"
                      : variation.status === "approved"
                        ? "text-emerald-900"
                        : "text-ink/60"
                    : verdict.needsVariation
                      ? "text-amber-900"
                      : "text-emerald-900",
                )}
              >
                {variation
                  ? variation.status === "proposed"
                    ? `Priced as a variation of ${signedKes(variation.amount)} — waiting for your approval in Changes.`
                    : variation.status === "approved"
                      ? `Approved: ${signedKes(variation.amount)} is part of your contract now.`
                      : variation.status === "declined"
                        ? "You declined this variation — the contract is unchanged."
                        : `The studio withdrew the ${signedKes(variation.amount)} variation. They will send a new price if it is still needed.`
                  : verdictLine(verdict)}
              </p>
            </>
          ) : null}

          {selection.chosenAt ? (
            <p className="mt-3 border-t border-ink/10 pt-3 text-[11px] text-muted">
              Chosen {new Date(selection.chosenAt).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          ) : null}
        </aside>
      </div>
    </Panel>
  );
}
