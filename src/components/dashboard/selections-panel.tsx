import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Gauge } from "@/components/dashboard/charts";
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
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-selections", projectId],
    queryFn: () => listMySelections({ data: { projectId } }),
  });

  const choose = useMutation({
    mutationFn: chooseSelectionOption,
    onSuccess: () => {
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
          When the studio needs you to choose a finish, a material or an fitting, it
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
          label={summary.variance > 0 ? "Over allowance" : "Under allowance"}
          value={kesShort(Math.abs(summary.variance))}
          exact={kes(summary.variance)}
          sub={
            summary.variance > 0
              ? "To be priced as a variation, not added to the bill"
              : summary.variance < 0
                ? "Not being spent on these selections"
                : "Exactly on the allowance"
          }
          icon={AlertTriangle}
          tone={summary.variance > 0 ? "warn" : "good"}
        />
      </div>

      {selections.map((s) => (
        <SelectionCard
          key={s.id}
          selection={s}
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
  busy,
  error,
  onChoose,
}: {
  selection: Selection;
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
                  Pick an option above, then record it. You can change it until the
                  deadline.
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
              <Gauge
                value={
                  verdict.price > 0
                    ? Math.min(100, (verdict.price / Math.max(1, verdict.allowance)) * 100)
                    : 0
                }
                height={110}
                caption={
                  selection.allowance > 0
                    ? `${kes(verdict.price)} of ${kes(selection.allowance)}`
                    : undefined
                }
              />
              <p
                className={cn(
                  "mt-3 text-[12px] leading-relaxed",
                  verdict.needsVariation ? "text-amber-900" : "text-emerald-900",
                )}
              >
                {verdictLine(verdict)}
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
