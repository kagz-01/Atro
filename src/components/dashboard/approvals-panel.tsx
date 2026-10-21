import { AlertTriangle, Clock, FileCheck2, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { listMyApprovals } from "@/lib/approvals-server";
import {
  approvalsHeadline,
  isSettled,
  isStalled,
  kes,
  kesShort,
  STATUS_TONE_CLASS,
  summariseApprovals,
  type Approval,
} from "@/lib/approvals";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

/**
 * The client's view of the paperwork.
 *
 * This is the part of the build a client cannot do and cannot see, so it is
 * shown rather than summarised away: which authority has it, where it is, what
 * it cost, and what is holding the build up. It is also the honest answer to
 * "why has nothing happened for six weeks" — the answer is usually a county,
 * and now the client can see that it is with the county.
 */
export function ApprovalsPanel({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-approvals", projectId],
    queryFn: () => listMyApprovals({ data: { projectId } }),
  });

  if (isLoading) {
    return (
      <Panel title="Approvals">
        <div className="h-40 animate-pulse rounded-xl bg-ink/6" />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Approvals">
        <p className="text-[13px] text-red-700">
          {error instanceof Error ? error.message : "Could not load your approvals."}
        </p>
      </Panel>
    );
  }

  const approvals = data ?? [];
  const summary = summariseApprovals(approvals, new Date());

  if (approvals.length === 0) {
    return (
      <Panel title="Approvals" subtitle="Nothing is with an authority at the moment">
        <p className="max-w-2xl text-[13px] leading-relaxed text-ink/65">
          Planning consent, environmental approval, the county permit and the utility
          connections all appear here as they are applied for, with the authority that
          holds each one and the fee that was paid. You will always know what the build
          is waiting on.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Approvals"
          value={`${summary.settled}/${summary.count}`}
          sub="Settled and in hand"
          icon={FileCheck2}
        />
        <StatCard
          label="Holding the build"
          value={String(summary.blocking)}
          sub={summary.blocking > 0 ? summary.holding[0] : "Nothing is blocked"}
          icon={AlertTriangle}
          tone={summary.blocking > 0 ? "warn" : "good"}
        />
        <StatCard
          label="Fees paid"
          value={kesShort(summary.feesPaid)}
          exact={kes(summary.feesPaid)}
          sub={
            summary.feesOutstanding > 0
              ? `${kes(summary.feesOutstanding)} still to pay`
              : "Nothing outstanding"
          }
          icon={Receipt}
        />
        <StatCard
          label="With authorities"
          value={String(summary.inFlight)}
          sub={
            summary.stalled > 0
              ? `${summary.stalled} waiting over three weeks`
              : "All moving"
          }
          icon={Clock}
          tone={summary.stalled > 0 ? "warn" : "default"}
        />
      </div>

      <Panel title="Where each approval stands" subtitle={approvalsHeadline(summary)}>
        <ul className="space-y-3">
          {approvals.map((a) => (
            <ApprovalRow key={a.id} approval={a} />
          ))}
        </ul>
      </Panel>

      <p className="text-[12px] leading-relaxed text-ink/50">
        ATRO files and follows every one of these on your behalf — submitting,
        following up with the authority, and paying the fees against the agreed
        schedule. The build cannot start until the ones marked as holding the
        build are in hand.
      </p>
    </div>
  );
}

function ApprovalRow({ approval }: { approval: Approval }) {
  const settled = isSettled(approval.status);
  const stalled = isStalled(approval, new Date());
  const outstanding = Math.max(0, approval.feeAmount - approval.feePaid);

  return (
    <li
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 rounded-xl border p-4",
        approval.blocking && !settled
          ? "border-amber-300 bg-amber-50/40"
          : "border-ink/10 bg-white",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] text-maroon">{approval.title}</span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]",
              STATUS_TONE_CLASS[approval.status],
            )}
          >
            {approval.status === "not_started"
              ? "Not started"
              : approval.status === "under_review"
                ? "Under review"
                : approval.status === "not_required"
                  ? "Not required"
                  : approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
          </span>
          {approval.blocking && !settled ? (
            <span className="rounded-full border border-amber-300 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-900">
              Holding the build
            </span>
          ) : null}
          {stalled ? (
            <span className="rounded-full border border-red-200 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-red-800">
              Waiting a long time
            </span>
          ) : null}
        </span>

        <span className="mt-1.5 block text-[12px] text-ink/55">
          {approval.authority ? `${approval.authority} · ` : ""}
          {approval.reference ? `ref ${approval.reference}` : "reference not issued yet"}
          {approval.submittedOn ? ` · submitted ${approval.submittedOn}` : ""}
          {approval.decidedOn ? ` · decided ${approval.decidedOn}` : ""}
        </span>

        {approval.note ? (
          <span className="mt-1.5 block text-[12px] leading-snug text-ink/60">
            {approval.note}
          </span>
        ) : null}

        {approval.chasedOn ? (
          <span className="mt-1.5 block text-[12px] leading-snug text-ink/60">
            ATRO chased {approval.authority || "the authority"} on {approval.chasedOn}
            {approval.chaseNote ? ` — ${approval.chaseNote}` : "."}
          </span>
        ) : null}
      </span>

      <span className="shrink-0 text-right">
        {approval.feeAmount > 0 ? (
          <>
            <span className="block text-[13px] text-maroon">{kes(approval.feeAmount)}</span>
            <span className="mt-0.5 block text-[11px] text-muted">
              {outstanding > 0 ? `${kes(outstanding)} to pay` : "paid in full"}
            </span>
          </>
        ) : (
          <Badge tone="gold">No fee</Badge>
        )}
      </span>
    </li>
  );
}
