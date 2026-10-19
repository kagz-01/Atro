import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileDiff, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import {
  STATUS_TONE_CLASS,
  amountLabel,
  awaitingClient,
  daysLabel,
  fmtDate,
  kes,
  originalContract,
  signedKes,
  sourceLabel,
  statusLabel,
  summariseVariations,
} from "@/lib/variations";
import { decideVariation, listMyVariations } from "@/lib/variations-server";
import type { PortalPayload } from "@/lib/diaspora/server";

/**
 * The changes screen — the only place the contract moves.
 *
 * Selections promise that a choice over the allowance arrives "as a variation
 * to approve before it is committed". This is where it arrives: the price, the
 * time it costs, and why the studio says it is needed — with the contract sum
 * shown both ways so approval can be checked rather than trusted.
 *
 * Declining is as easy as approving, and a note is offered but never required:
 * a client saying "no" does not owe anybody an essay, but the option means a
 * thoughtful reason can land on the studio's desk instead of in an argument.
 */
export function VariationsPanel({
  project,
  onChanged,
}: {
  project: Pick<PortalPayload["project"], "id" | "contractValue">;
  onChanged?: () => void;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-variations", project.id],
    queryFn: () => listMyVariations({ data: { projectId: project.id } }),
  });

  const [declining, setDeclining] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const decide = useMutation({
    mutationFn: (input: { variationId: string; accept: boolean }) =>
      decideVariation({
        data: {
          projectId: project.id,
          variationId: input.variationId,
          accept: input.accept,
          note: input.accept ? "" : note.trim(),
        },
      }),
    onSuccess: () => {
      setDeclining(null);
      setNote("");
      void queryClient.invalidateQueries({ queryKey: ["my-variations", project.id] });
      onChanged?.();
    },
  });

  if (isLoading) {
    return (
      <Panel title="Changes" subtitle="Priced variations to your contract">
        <div className="flex items-center gap-3 text-[13px] text-ink/50">
          <Loader2 className="size-4 animate-spin" />
          Loading the record…
        </div>
      </Panel>
    );
  }

  if (error || !data) {
    return (
      <Panel title="Changes" subtitle="Priced variations to your contract">
        <p className="text-[13px] text-red-700">
          We could not open this. Refresh the page and try again.
        </p>
      </Panel>
    );
  }

  const summary = summariseVariations(data);
  const original = originalContract(project.contractValue, data);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Waiting for your call"
          value={String(summary.awaiting)}
          sub={summary.awaiting ? signedKes(summary.inFlight) : "Nothing to decide"}
          tone={summary.awaiting ? "warn" : "default"}
        />
        <StatCard
          label="Approved changes"
          value={amountLabel(summary.approvedDelta)}
          sub={summary.approvedDays ? `${daysLabel(summary.approvedDays)} on the programme` : "No time impact"}
        />
        <StatCard
          label="Contract"
          value={kes(project.contractValue)}
          sub={summary.approvedDelta ? `signed at ${kes(original)}` : "As signed"}
        />
      </div>

      <Panel title="Where the contract stands" subtitle="The sum, and what moved it">
        <p className="text-[14px] leading-relaxed text-ink/75">{summary.headline}</p>
        <p className="mt-3 text-[13px] text-ink/60">
          {summary.approvedDelta !== 0
            ? `Signed at ${kes(original)}. Approved changes total ${signedKes(summary.approvedDelta)}, so the contract now stands at ${kes(project.contractValue)} — every figure traceable to a change you approved.`
            : `No change has been approved, so the contract stands exactly as signed: ${kes(project.contractValue)}.`}
        </p>
      </Panel>

      <Panel
        title="Changes"
        subtitle={summary.total ? `${summary.total} on record` : "Nothing proposed yet"}
        bodyClassName="p-0"
      >
        {summary.total === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-ink/50">
            No variations on this project. If a choice goes over its allowance, the studio prices it
            here and it only reaches your contract once you approve it.
          </p>
        ) : (
          <ul className="divide-y divide-ink/8">
            {data.map((v) => (
              <li key={v.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] text-maroon">{v.title}</span>
                      <Badge className={STATUS_TONE_CLASS[v.status]}>{statusLabel(v.status)}</Badge>
                      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink/45">
                        {sourceLabel(v.sourceKind)}
                      </span>
                    </div>

                    <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span
                        className={
                          v.amount > 0
                            ? "font-display text-lg text-maroon"
                            : v.amount < 0
                              ? "font-display text-lg text-emerald-800"
                              : "font-display text-lg text-ink/60"
                        }
                      >
                        {amountLabel(v.amount)}
                      </span>
                      {v.days !== 0 ? (
                        <span className="text-[12px] text-ink/55">{daysLabel(v.days)} programme</span>
                      ) : null}
                      <span className="text-[11px] text-ink/40">proposed {fmtDate(v.proposedOn)}</span>
                    </p>

                    {v.reason ? (
                      <p className="mt-2 text-[13px] text-ink/70">
                        <span className="font-semibold text-ink/80">Why: </span>
                        {v.reason}
                      </p>
                    ) : null}
                    {v.detail ? <p className="mt-1 text-[13px] text-ink/60">{v.detail}</p> : null}

                    {v.status !== "proposed" ? (
                      <p className="mt-2 text-[12px] text-ink/55">
                        {v.decidedBy === "client" && v.status === "approved"
                          ? `You approved this on ${fmtDate(v.decidedOn)}.`
                          : v.decidedBy === "client" && v.status === "declined"
                            ? `You declined this on ${fmtDate(v.decidedOn)}.`
                            : v.status === "withdrawn"
                              ? `Withdrawn by the studio on ${fmtDate(v.decidedOn)}.`
                              : ""}
                        {v.decisionNote ? (
                          <>
                            {" "}
                            <span className="font-semibold text-ink/70">
                              {v.decidedBy === "client" ? "Your note:" : "Their reason:"}
                            </span>{" "}
                            {v.decisionNote}
                          </>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                </div>

                {awaitingClient(v) ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={decide.isPending}
                        onClick={() => {
                          setDeclining(null);
                          setNote("");
                          decide.mutate({ variationId: v.id, accept: true });
                        }}
                      >
                        <CheckCircle2 className="size-3.5" />
                        Approve the change
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={decide.isPending}
                        onClick={() => {
                          setDeclining(declining === v.id ? null : v.id);
                          setNote("");
                        }}
                      >
                        <XCircle className="size-3.5" />
                        Decline
                      </Button>
                    </div>

                    {declining === v.id ? (
                      <form
                        className="space-y-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!decide.isPending) decide.mutate({ variationId: v.id, accept: false });
                        }}
                      >
                        <Label htmlFor={`note-${v.id}`}>
                          Anything you want the studio to know (optional)
                        </Label>
                        <Textarea
                          id={`note-${v.id}`}
                          className="min-h-16"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Not now — revisit after we move in."
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" variant="outline" disabled={decide.isPending}>
                            {decide.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                            Confirm decline
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeclining(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : null}

                    {decide.error instanceof Error ? (
                      <p className="text-[12px] text-red-700">{decide.error.message}</p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="How a change becomes a cost" subtitle="The rule, in plain words">
        <div className="flex items-start gap-3 text-[13px] leading-relaxed text-ink/65">
          <FileDiff className="mt-0.5 size-4 shrink-0 text-maroon" aria-hidden />
          <p>
            Nothing on this screen changes your contract on its own. The studio prices a change, it
            appears here with a price and a time impact, and your approval is what adds it to the
            sum. Declining or withdrawing leaves the contract exactly where it was.
          </p>
        </div>
      </Panel>
    </div>
  );
}