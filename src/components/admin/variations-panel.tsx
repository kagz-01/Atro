import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import {
  STATUS_TONE_CLASS,
  amountLabel,
  awaitingClient,
  daysLabel,
  fmtDate,
  kes,
  signedKes,
  sourceLabel,
  statusLabel,
  type Variation,
} from "@/lib/variations";
import {
  raiseVariation,
  readVariationsForStaff,
  withdrawVariation,
} from "@/lib/variations-server";

/**
 * The studio's side of the same list: put a price to the client, or take one
 * back. Approval is never offered here — the money is the client's call — and
 * a withdrawal asks why, because a price that disappears without an answer is
 * how a client stops trusting the next one.
 */
export function VariationsPanel({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const key = ["variations-staff", projectId];
  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: () => readVariationsForStaff({ data: { projectId } }),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");
  const [formError, setFormError] = useState("");

  const raise = useMutation({
    mutationFn: () =>
      raiseVariation({
        data: {
          projectId,
          title,
          detail,
          reason,
          amount: Number(amount) || 0,
          days: Number(days) || 0,
        },
      }),
    onSuccess: () => {
      setTitle("");
      setReason("");
      setDetail("");
      setAmount("");
      setDays("");
      setFormError("");
      setAdding(false);
      void refresh();
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : "That did not send."),
  });

  if (isLoading) {
    return (
      <Panel title="Variations" subtitle="Priced changes to the contract">
        <div className="flex items-center gap-3 text-[13px] text-ink/50">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      </Panel>
    );
  }
  if (error || !data) {
    return (
      <Panel title="Variations" subtitle="Priced changes to the contract">
        <p className="text-[13px] text-red-700">Could not open this project’s record.</p>
      </Panel>
    );
  }

  const withClient = data.filter(awaitingClient).length;

  return (
    <div className="space-y-5">
      <Panel
        title="Variations"
        subtitle={
          withClient
            ? `${withClient} with the client · ${kes(data.filter((v) => v.status === "proposed").reduce((t, v) => t + v.amount, 0))} in flight`
            : "Nothing with the client right now"
        }
        bodyClassName="p-0"
      >
        <div className="flex justify-end border-b border-ink/8 px-5 py-3">
          <Button size="sm" variant={adding ? "ghost" : "outline"} onClick={() => setAdding(!adding)}>
            {adding ? "Cancel" : <Plus className="size-3.5" />}
            {adding ? null : "Raise a variation"}
          </Button>
        </div>

        {adding ? (
          <form
            className="space-y-4 border-b border-ink/8 bg-cream px-5 py-5"
            onSubmit={(e) => {
              e.preventDefault();
              setFormError("");
              if (title.trim().length >= 5 && !raise.isPending) raise.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="vr-title">What is changing</Label>
                <Input
                  id="vr-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bigger roof overhang to the east terrace"
                />
              </div>
              <div>
                <Label htmlFor="vr-reason">Why it is needed</Label>
                <Input
                  id="vr-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="The terrace bakes in the afternoon sun."
                />
              </div>
            </div>
            <div>
              <Label htmlFor="vr-detail">What it covers</Label>
              <Textarea
                id="vr-detail"
                className="min-h-16"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Extend the eave from 600 to 900 mm across the east face, fascia and gutter to suit."
              />
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <Label htmlFor="vr-amount">Price (KES, signed)</Label>
                <Input
                  id="vr-amount"
                  type="number"
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="275000"
                />
              </div>
              <div>
                <Label htmlFor="vr-days">Time impact (days)</Label>
                <Input
                  id="vr-days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="7"
                />
              </div>
              <Button type="submit" size="sm" disabled={title.trim().length < 5 || raise.isPending}>
                {raise.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Send to the client
              </Button>
            </div>
            <p className="text-[12px] text-ink/50">
              The contract does not move until the client approves. A negative price credits it.
            </p>
            {formError ? <p className="text-[12px] text-red-700">{formError}</p> : null}
          </form>
        ) : null}

        {data.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-ink/50">
            No variations on this project. A choice over its allowance gets priced here and reaches
            the contract only when the client approves it.
          </p>
        ) : (
          <ul className="divide-y divide-ink/8">
            {data.map((v) => (
              <VariationRow key={v.id} projectId={projectId} variation={v} onDone={() => void refresh()} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function VariationRow({
  projectId,
  variation: v,
  onDone,
}: {
  projectId: string;
  variation: Variation;
  onDone: () => void;
}) {
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");

  const withdraw = useMutation({
    mutationFn: () => withdrawVariation({ data: { projectId, variationId: v.id, reason } }),
    onSuccess: () => {
      setWithdrawing(null);
      setReason("");
      setErr("");
      onDone();
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "That did not save."),
  });

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] text-maroon">{v.title}</span>
            <Badge className={STATUS_TONE_CLASS[v.status]}>{statusLabel(v.status)}</Badge>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/40">
              {sourceLabel(v.sourceKind)}
            </span>
          </div>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-3 text-[12px] text-ink/55">
            <span className="font-semibold text-ink/75">{amountLabel(v.amount)}</span>
            {v.days !== 0 ? <span>{daysLabel(v.days)}</span> : null}
            <span>
              proposed {fmtDate(v.proposedOn)}
              {v.decidedOn ? ` · ${v.status === "withdrawn" ? "withdrawn" : "decided"} ${fmtDate(v.decidedOn)}` : ""}
            </span>
            {v.decidedBy ? <span>by {v.decidedBy}</span> : null}
          </p>
          {v.reason ? <p className="mt-2 text-[13px] text-ink/70">{v.reason}</p> : null}
          {v.detail ? <p className="mt-1 text-[13px] text-ink/60">{v.detail}</p> : null}
          {v.decisionNote ? (
            <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-[12px] text-ink/70">
              <span className="font-semibold text-maroon">
                {v.decidedBy === "client" ? "Client note:" : "Withdrawal reason:"}
              </span>{" "}
              {v.decisionNote}
            </p>
          ) : null}
          {awaitingClient(v) ? (
            <p className="mt-2 text-[11px] font-semibold text-amber-700">
              With the client since {fmtDate(v.proposedOn)} — {signedKes(v.amount)} in flight.
            </p>
          ) : null}
        </div>

        {awaitingClient(v) && !withdrawing ? (
          <Button size="sm" variant="outline" onClick={() => setWithdrawing(v.id)}>
            Withdraw…
          </Button>
        ) : null}
      </div>

      {withdrawing === v.id ? (
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!withdraw.isPending) withdraw.mutate();
          }}
        >
          <Label htmlFor={`wr-${v.id}`}>Why is it being withdrawn? (the client reads this)</Label>
          <Textarea
            id={`wr-${v.id}`}
            className="min-h-16"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Repriced after speaking to the supplier — sending again at the new figure."
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="outline" disabled={withdraw.isPending}>
              {withdraw.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Confirm withdrawal
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setWithdrawing(null)}>
              Cancel
            </Button>
          </div>
          {err ? <p className="text-[12px] text-red-700">{err}</p> : null}
        </form>
      ) : null}
    </li>
  );
}