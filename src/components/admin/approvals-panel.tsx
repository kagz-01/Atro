import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Pencil, Plus, Save, X } from "lucide-react";
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
  approvalStatusLabel,
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

  const { data, isLoading, error: queryError, refetch } = useQuery({
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
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not record the follow-up."),
  });

  const update = useMutation({
    mutationFn: updateApproval,
    onSuccess: () => {
      toast.success("Approval updated.");
      invalidate();
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not update the approval."),
  });

  const create = useMutation({
    mutationFn: createApproval,
    onSuccess: () => {
      toast.success("Approval added.");
      setAdding(false);
      invalidate();
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not add the approval."),
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

  if (queryError) {
    return (
      <section role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-[13px] text-red-800">
          {queryError instanceof Error ? queryError.message : "Could not load project approvals."}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => void refetch()}
        >
          Try again
        </Button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-cream p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-maroon">Permits & approvals</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
            Track authority, application status, dates, fees, references and client-facing updates.
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
          busy={create.isPending}
          error={create.error}
          onCancel={() => setAdding(false)}
          onCreate={(data) => create.mutate({ data })}
        />
      ) : null}

      {approvals.length === 0 && !adding ? (
        <p className="mt-4 text-[13px] text-ink/55">
          None recorded yet. Add the permits and approvals required for this project;
          requirements vary by project and authority.
        </p>
      ) : null}

      <ul className="mt-4 space-y-3">
        {approvals.map((a) => (
          <ApprovalRow
            key={a.id}
            approval={a}
            busy={update.isPending || chase.isPending}
            onUpdate={(patch) => update.mutate({ data: { approvalId: a.id, ...patch } })}
            onChase={(note) => chase.mutate({ data: { approvalId: a.id, note } })}
          />
        ))}
      </ul>
      {update.error instanceof Error || chase.error instanceof Error ? (
        <p role="alert" className="mt-3 text-[12px] text-red-700">
          {update.error instanceof Error
            ? update.error.message
            : chase.error instanceof Error
              ? chase.error.message
              : "Could not save this approval update."}
        </p>
      ) : null}
    </section>
  );
}

function ApprovalRow({
  approval,
  busy,
  onUpdate,
  onChase,
}: {
  approval: Approval;
  busy: boolean;
  onUpdate: (patch: ApprovalPatch) => void;
  onChase: (note: string) => void;
}) {
  const settled = isSettled(approval.status);
  const stalled = isStalled(approval, new Date());
  const chase = needsChase(approval, new Date());
  const outstanding = Math.max(0, approval.feeAmount - approval.feePaid);
  const canRecordFollowUp =
    approval.status === "submitted" ||
    approval.status === "under_review" ||
    approval.status === "rejected";
  const [chasing, setChasing] = useState(false);
  const [chaseNote, setChaseNote] = useState("");
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="rounded-xl border border-gold/50 bg-white p-4">
        <ApprovalEditForm
          approval={approval}
          busy={busy}
          onCancel={() => setEditing(false)}
          onSave={(patch) => {
            onUpdate(patch);
            setEditing(false);
          }}
        />
      </li>
    );
  }

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
              {approvalStatusLabel(approval.status)}
            </span>
            {approval.blocking && !settled ? (
              <Badge tone="gold" className="h-5 text-[9px]">Holds the build</Badge>
            ) : null}
            {chase ? (
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-red-800">
                Chase it
              </span>
            ) : null}
            {stalled ? (
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-red-800">
                Waiting 3+ weeks
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-[12px] text-ink/55">
            {approval.authority || "No authority named"}
            {approval.reference ? ` · Ref ${approval.reference}` : " · No reference recorded"}
          </p>
          <p className="mt-1 text-[11px] text-ink/50">
            {approval.submittedOn ? `Submitted ${approvalDateLabel(approval.submittedOn)}` : ""}
            {approval.submittedOn && approval.decidedOn ? " · " : ""}
            {approval.decidedOn
              ? `${approval.status === "approved" || approval.status === "rejected" ? "Decision" : "Last decision"} ${approvalDateLabel(approval.decidedOn)}`
              : ""}
            {!approval.submittedOn && !approval.decidedOn ? "Dates not recorded" : ""}
            {approval.chasedOn ? ` · Follow-up ${approvalDateLabel(approval.chasedOn)}` : ""}
          </p>
          {approval.note ? (
            <p className="mt-2 text-[12px] leading-relaxed text-ink/65">{approval.note}</p>
          ) : null}
          {approval.chaseNote ? (
            <p className="mt-1 text-[11px] leading-snug text-ink/50">
              Last follow-up: {approval.chaseNote}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
            Edit record
          </Button>
          {canRecordFollowUp && !chasing ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setChasing(true)}>
              <Bell className="size-3.5" />
              Record follow-up
            </Button>
          ) : null}
        </div>
      </div>

      {chasing ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`chase-${approval.id}`}>
            What did you do about {approval.title}?
          </label>
          <Input
            id={`chase-${approval.id}`}
            value={chaseNote}
            onChange={(e) => setChaseNote(e.target.value)}
            placeholder="Called the county; file is with the assessment desk (optional)."
            className="h-9 w-80 text-[12px]"
            autoFocus
          />
          <Button
            size="sm"
            disabled={busy}
            onClick={() => {
              onChase(chaseNote.trim());
              setChasing(false);
              setChaseNote("");
            }}
          >
            Save follow-up
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setChasing(false);
              setChaseNote("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : null}

      <p className="mt-2 text-[11px] text-muted">
        {approval.feeAmount > 0
          ? `Fee ${kes(approval.feeAmount)} · ${
              outstanding > 0 ? `${kes(outstanding)} still to pay` : "paid in full"
            }`
          : "No fee recorded"}
        {stalled ? " · status has not moved in over three weeks" : ""}
      </p>
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

type ApprovalPatch = Pick<
  Approval,
  | "kind"
  | "title"
  | "authority"
  | "reference"
  | "status"
  | "submittedOn"
  | "decidedOn"
  | "feeAmount"
  | "feePaid"
  | "blocking"
  | "note"
>;

function ApprovalEditForm({
  approval,
  busy,
  onCancel,
  onSave,
}: {
  approval: Approval;
  busy: boolean;
  onCancel: () => void;
  onSave: (patch: ApprovalPatch) => void;
}) {
  const [kind, setKind] = useState<ApprovalKind>(approval.kind);
  const [title, setTitle] = useState(approval.title);
  const [authority, setAuthority] = useState(approval.authority);
  const [reference, setReference] = useState(approval.reference);
  const [status, setStatus] = useState<ApprovalStatus>(approval.status);
  const [submittedOn, setSubmittedOn] = useState(approval.submittedOn);
  const [decidedOn, setDecidedOn] = useState(approval.decidedOn);
  const [feeAmount, setFeeAmount] = useState(String(approval.feeAmount));
  const [feePaid, setFeePaid] = useState(String(approval.feePaid));
  const [blocking, setBlocking] = useState(approval.blocking);
  const [note, setNote] = useState(approval.note);
  const amount = Number(feeAmount);
  const paid = Number(feePaid);
  const feeValid =
    Number.isInteger(amount) &&
    amount >= 0 &&
    Number.isInteger(paid) &&
    paid >= 0 &&
    paid <= amount;

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!feeValid || title.trim().length < 2) return;
        onSave({
          kind,
          title: title.trim(),
          authority: authority.trim(),
          reference: reference.trim(),
          status,
          submittedOn,
          decidedOn,
          feeAmount: amount,
          feePaid: paid,
          blocking,
          note: note.trim(),
        });
      }}
    >
      <h4 className="text-[13px] font-semibold text-maroon">Edit approval record</h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor={`ap-kind-${approval.id}`}>Type</Label>
          <Select
            id={`ap-kind-${approval.id}`}
            value={kind}
            onChange={(event) => setKind(event.target.value as ApprovalKind)}
          >
            {APPROVAL_KINDS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`ap-title-${approval.id}`}>Title</Label>
          <Input
            id={`ap-title-${approval.id}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            minLength={2}
            maxLength={160}
          />
        </div>
        <div>
          <Label htmlFor={`ap-authority-${approval.id}`}>Authority</Label>
          <Input
            id={`ap-authority-${approval.id}`}
            value={authority}
            onChange={(event) => setAuthority(event.target.value)}
            maxLength={120}
          />
        </div>
        <div>
          <Label htmlFor={`ap-reference-${approval.id}`}>Application / permit reference</Label>
          <Input
            id={`ap-reference-${approval.id}`}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            maxLength={80}
          />
        </div>
        <div>
          <Label htmlFor={`ap-status-${approval.id}`}>Status</Label>
          <Select
            id={`ap-status-${approval.id}`}
            value={status}
            onChange={(event) => setStatus(event.target.value as ApprovalStatus)}
          >
            {APPROVAL_STATUS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`ap-submitted-${approval.id}`}>Submitted on</Label>
          <Input
            id={`ap-submitted-${approval.id}`}
            type="date"
            value={submittedOn}
            onChange={(event) => setSubmittedOn(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`ap-decided-${approval.id}`}>Decision date</Label>
          <Input
            id={`ap-decided-${approval.id}`}
            type="date"
            value={decidedOn}
            onChange={(event) => setDecidedOn(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`ap-fee-${approval.id}`}>Total fee (KES)</Label>
          <Input
            id={`ap-fee-${approval.id}`}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={feeAmount}
            onChange={(event) => setFeeAmount(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`ap-paid-${approval.id}`}>Fee paid (KES)</Label>
          <Input
            id={`ap-paid-${approval.id}`}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={feePaid}
            onChange={(event) => setFeePaid(event.target.value)}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-[12px] text-ink/70">
        <input
          type="checkbox"
          checked={blocking}
          onChange={(event) => setBlocking(event.target.checked)}
        />
        This approval currently holds up the next build stage
      </label>
      <div>
        <Label htmlFor={`ap-note-${approval.id}`}>Client-facing update</Label>
        <Textarea
          id={`ap-note-${approval.id}`}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={600}
          className="min-h-16"
        />
      </div>
      {!feeValid ? (
        <p role="alert" className="text-[12px] text-red-700">
          Enter whole KES amounts, and ensure the amount paid does not exceed the total fee.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={busy || !feeValid || title.trim().length < 2}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save approval
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function NewApprovalForm({
  projectId,
  busy,
  error,
  onCancel,
  onCreate,
}: {
  projectId: string;
  busy: boolean;
  error: Error | null;
  onCancel: () => void;
  onCreate: (data: {
    projectId: string;
    kind: ApprovalKind;
    title: string;
    authority: string;
    feeAmount: number;
    blocking: boolean;
    note: string;
  }) => void;
}) {
  const [kind, setKind] = useState<ApprovalKind>("ncc");
  const [title, setTitle] = useState("");
  const [authority, setAuthority] = useState("");
  const [fee, setFee] = useState("");
  const [blocking, setBlocking] = useState(true);
  const [note, setNote] = useState("");

  const valid = title.trim().length >= 2;
  const feeAmount = fee === "" ? 0 : Number(fee);
  const validFee = Number.isInteger(feeAmount) && feeAmount >= 0 && feeAmount <= 100_000_000;

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
            min={0}
            max={100_000_000}
            step={1}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="120000"
            className="mt-1"
          />
        </div>
      </div>

      {!validFee ? (
        <p role="alert" className="text-[12px] text-red-700">
          Enter a whole KES amount between 0 and 100,000,000.
        </p>
      ) : null}

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

      {error instanceof Error ? (
        <p role="alert" className="text-[12px] text-red-700">
          {error.message}
        </p>
      ) : null}

      <Button
        disabled={!valid || !validFee || busy}
        onClick={() =>
          onCreate({
            projectId,
            kind,
            title: title.trim(),
            authority: authority.trim(),
            feeAmount,
            blocking,
            note: note.trim(),
          })
        }
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        Add to the record
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
