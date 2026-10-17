import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import {
  chaseApproval,
  createApproval,
  readApprovalsForStaff,
  updateApproval,
} from "@/lib/approvals-server";
import {
  APPROVAL_KINDS,
  APPROVAL_STATUS,
  isSettled,
  isStalled,
  kes,
  needsChase,
  STATUS_TONE_CLASS,
  summariseApprovals,
  type Approval,
  type ApprovalKind,
  type ApprovalStatus,
} from "@/lib/approvals";
import { cn } from "@/lib/utils";

/**
 * The studio's side of approvals.
 *
 * Three jobs: put an approval on the record, move it as the authority moves, and
 * keep the fees straight. The fees are the commercial point — a county permit,
 * an NCA levy and an EIA are money the client is paying for, and tracking them
 * here is what turns "approvals handled" from a phrase into a line item.
 */
export function ApprovalsPanel({
  projectId,
  onChanged,
}: {
  projectId: string;
  onChanged?: () => void;
}) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["staff-approvals", projectId],
    queryFn: () => readApprovalsForStaff({ data: { projectId } }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["staff-approvals", projectId] });
    onChanged?.();
  };

  const chase = useMutation({
    mutationFn: chaseApproval,
    onSuccess: () => {
      toast.success("Chase recorded.");
      invalidate();
    },
  });

  const update = useMutation({
    mutationFn: updateApproval,
    onSuccess: invalidate,
  });

  const approvals = data ?? [];
  const summary = summariseApprovals(approvals, new Date());

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-ink/10 bg-cream p-5">
        <div className="h-24 animate-pulse rounded-xl bg-ink/6" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-cream p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-maroon">Approvals</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
            The paperwork that holds a build up. The client sees every line of this,
            so a fee that has not been paid is a conversation rather than a
            discovery.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAdding((v) => !v)}>
          {adding ? <X className="size-4" /> : <Plus className="size-4" />}
          {adding ? "Cancel" : "Add approval"}
        </Button>
      </div>

      {approvals.length > 0 ? (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-4">
          {[
            ["Settled", `${summary.settled}/${summary.count}`],
            ["Holding the build", String(summary.blocking)],
            ["Fees paid", kes(summary.feesPaid)],
            ["Fees outstanding", kes(summary.feesOutstanding)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-ink/10 bg-white p-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                {k}
              </dt>
              <dd className="mt-1 text-[14px] text-maroon">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {adding ? (
        <NewApprovalForm
          projectId={projectId}
          onDone={() => {
            setAdding(false);
            invalidate();
          }}
        />
      ) : null}

      {approvals.length === 0 && !adding ? (
        <p className="mt-4 text-[13px] text-ink/55">
          None recorded. Planning consent, the county permit, environmental approval
          and the utility connections are the four that hold a Kenyan build up.
        </p>
      ) : null}

      <ul className="mt-4 space-y-3">
        {approvals.map((a) => (
          <ApprovalRow
            key={a.id}
            approval={a}
            busy={update.isPending || chase.isPending}
            onStatus={(status) => update.mutate({ data: { approvalId: a.id, status } })}
            onFeePaid={(feePaid) => update.mutate({ data: { approvalId: a.id, feePaid } })}
            onChase={() => chase.mutate({ data: { approvalId: a.id } })}
          />
        ))}
      </ul>
    </section>
  );
}

function ApprovalRow({
  approval,
  busy,
  onStatus,
  onFeePaid,
  onChase,
}: {
  approval: Approval;
  busy: boolean;
  onStatus: (status: ApprovalStatus) => void;
  onFeePaid: (feePaid: number) => void;
  onChase: () => void;
}) {
  const settled = isSettled(approval.status);
  const stalled = isStalled(approval, new Date());
  const chase = needsChase(approval, new Date());
  const outstanding = Math.max(0, approval.feeAmount - approval.feePaid);

  return (
    <li
      className={cn(
        "rounded-xl border bg-white p-4",
        approval.blocking && !settled
          ? "border-amber-300"
          : chase
            ? "border-red-200"
            : "border-ink/10",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] text-maroon">{approval.title}</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                STATUS_TONE_CLASS[approval.status],
              )}
            >
              {approval.status.replace(/_/g, " ")}
            </span>
            {approval.blocking && !settled ? (
              <Badge tone="gold" className="h-5 text-[9px]">Holds the build</Badge>
            ) : null}
            {chase ? (
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-red-800">
                Chase it
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-[12px] text-ink/55">
            {approval.authority || "No authority named"}
            {approval.reference ? ` · ${approval.reference}` : ""}
            {approval.chasedOn ? ` · chased ${approval.chasedOn}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`st-${approval.id}`}>
            Status for {approval.title}
          </label>
          <Select
            id={`st-${approval.id}`}
            value={approval.status}
            disabled={busy}
            onChange={(e) => onStatus(e.target.value as ApprovalStatus)}
            className="h-9 w-40 text-[12px]"
          >
            {APPROVAL_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>

          <label className="sr-only" htmlFor={`fee-${approval.id}`}>
            Fee paid for {approval.title}
          </label>
          <span className="flex h-9 items-center rounded-l-xl border border-r-0 border-line bg-cream pl-2.5 text-[11px] text-muted">
            KES
          </span>
          <Input
            id={`fee-${approval.id}`}
            type="number"
            inputMode="numeric"
            defaultValue={approval.feePaid || ""}
            placeholder="Fee paid"
            disabled={busy}
            className="h-9 w-24 rounded-l-none text-[12px]"
            onBlur={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next) && next !== approval.feePaid) onFeePaid(next);
            }}
          />

          {chase ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={onChase}>
              <Bell className="size-3.5" />
              Record chase
            </Button>
          ) : null}
        </div>
      </div>

      <p className="mt-2 text-[11px] text-muted">
        {approval.feeAmount > 0
          ? `Fee ${kes(approval.feeAmount)} · ${
              outstanding > 0 ? `${kes(outstanding)} still to pay` : "paid in full"
            }`
          : "No fee recorded"}
        {stalled ? " · nothing has moved in over three weeks" : ""}
      </p>
    </li>
  );
}

function NewApprovalForm({
  projectId,
  onDone,
}: {
  projectId: string;
  onDone: () => void;
}) {
  const [kind, setKind] = useState<ApprovalKind>("ncc");
  const [title, setTitle] = useState("");
  const [authority, setAuthority] = useState("");
  const [fee, setFee] = useState("");
  const [blocking, setBlocking] = useState(true);
  const [note, setNote] = useState("");

  const create = useMutation({
    mutationFn: createApproval,
    onSuccess: () => {
      toast.success("Approval added.");
      onDone();
    },
  });

  const valid = title.trim().length >= 2;

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-gold/40 bg-gold/5 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="ap-kind">What is it</Label>
          <Select
            id="ap-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as ApprovalKind)}
            className="mt-1"
          >
            {APPROVAL_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="ap-title">Title</Label>
          <Input
            id="ap-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Planning consent"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="ap-auth">Authority</Label>
          <Input
            id="ap-auth"
            value={authority}
            onChange={(e) => setAuthority(e.target.value)}
            placeholder="Nairobi City County"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="ap-fee">Fee (KES)</Label>
          <Input
            id="ap-fee"
            type="number"
            inputMode="numeric"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="120000"
            className="mt-1"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-[12px] text-ink/70">
        <input
          type="checkbox"
          checked={blocking}
          onChange={(e) => setBlocking(e.target.checked)}
        />
        This holds up the build until it is in hand
      </label>

      <div>
        <Label htmlFor="ap-note">Note for the client (optional)</Label>
        <Textarea
          id="ap-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Filed on 4 March. The county has acknowledged and the assessment is booked."
          className="mt-1 min-h-16"
        />
      </div>

      {create.error instanceof Error ? (
        <p role="alert" className="text-[12px] text-red-700">
          {create.error.message}
        </p>
      ) : null}

      <Button
        disabled={!valid || create.isPending}
        onClick={() =>
          create.mutate({
            data: {
              projectId,
              kind,
              title: title.trim(),
              authority: authority.trim(),
              feeAmount: Number(fee) || 0,
              blocking,
              note: note.trim(),
            },
          })
        }
      >
        {create.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Add to the record
      </Button>
    </div>
  );
}
