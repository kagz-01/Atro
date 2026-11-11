import { AlertTriangle, Clock, FileCheck2, Receipt, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { listMyApprovals } from "@/lib/approvals-server";
import {
  approvalsHeadline,
  approvalStatusLabel,
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
  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["my-approvals", projectId],
    queryFn: () => listMyApprovals({ data: { projectId } }),
    refetchInterval: 60_000,
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
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-[13px] text-red-700">
          {error instanceof Error ? error.message : "Could not load your approvals."}
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const approvals = data ?? [];
  const summary = summariseApprovals(approvals, new Date());

  if (approvals.length === 0) {
    return (
      <Panel
        title="Permits & approvals"
        subtitle="No approvals have been recorded for this project yet"
        actions={
          <Button size="sm" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className="size-4" aria-hidden />
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        }
      >
        <p className="max-w-2xl text-[13px] leading-relaxed text-ink/65">
          Planning consent, environmental approval, the county permit and the utility
          connections can be tracked here. The studio will add the relevant items for
          your project and update them as applications progress.
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
          label="Fees recorded paid"
          value={kesShort(summary.feesPaid)}
          exact={kes(summary.feesPaid)}
          sub={
            summary.feesOutstanding > 0
              ? `${kes(summary.feesOutstanding)} recorded outstanding`
              : "No recorded balance outstanding"
          }
          icon={Receipt}
        />
        <StatCard
          label="Not yet settled"
          value={String(summary.inFlight)}
          sub={
            [
              summary.withAuthorities > 0
                ? `${summary.withAuthorities} with authorities`
                : "",
              summary.awaitingSubmission > 0
                ? `${summary.awaitingSubmission} not submitted`
                : "",
              summary.refused > 0 ? `${summary.refused} refused` : "",
              summary.stalled > 0 ? `${summary.stalled} stalled` : "",
            ]
              .filter(Boolean)
              .join(" · ") || "All recorded items are settled"
          }
          icon={Clock}
          tone={summary.stalled > 0 ? "warn" : "default"}
        />
      </div>

      <Panel
        title="Where each permit and approval stands"
        subtitle={approvalsHeadline(summary)}
        actions={
          <Button size="sm" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className="size-4" aria-hidden />
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        }
      >
        <ul className="space-y-3">
          {approvals.map((a) => (
            <ApprovalRow key={a.id} approval={a} />
          ))}
        </ul>
      </Panel>

      <p className="text-[12px] leading-relaxed text-ink/50">
        Statuses reflect updates recorded by the studio; approvals and permits are
        issued by the relevant authorities. Any fees shown are project records, not
        a substitute for an authority receipt. Documents shared with you appear in
        Documents. Items marked as holding the build may affect the next stage.
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
            {approvalStatusLabel(approval.status)}
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
          {approval.submittedOn ? ` · submitted ${approvalDateLabel(approval.submittedOn)}` : ""}
          {approval.decidedOn ? ` · decided ${approvalDateLabel(approval.decidedOn)}` : ""}
        </span>

        {approval.note ? (
          <span className="mt-1.5 block text-[12px] leading-snug text-ink/60">
            {approval.note}
          </span>
        ) : null}

        {approval.chasedOn ? (
          <span className="mt-1.5 block text-[12px] leading-snug text-ink/60">
            ATRO followed up with {approval.authority || "the authority"} on{" "}
            {approvalDateLabel(approval.chasedOn)}
            {approval.chaseNote ? ` — ${approval.chaseNote}` : "."}
          </span>
        ) : null}
      </span>

      <span className="shrink-0 text-right">
        {approval.feeAmount > 0 ? (
          <>
            <span className="block text-[13px] text-maroon">{kes(approval.feeAmount)}</span>
            <span className="mt-0.5 block text-[11px] text-muted">
              {approval.feePaid > 0 ? `${kes(approval.feePaid)} recorded paid · ` : ""}
              {outstanding > 0
                ? `${kes(outstanding)} recorded outstanding`
                : "no recorded balance outstanding"}
            </span>
          </>
        ) : (
          <Badge tone="gold">No fee</Badge>
        )}
      </span>
    </li>
  );
}

function approvalDateLabel(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
