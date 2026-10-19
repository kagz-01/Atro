import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PhoneCall, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import {
  SEVERITIES,
  STATUS_TONE_CLASS,
  awaitingClient,
  awaitingStudio,
  fmtDate,
  statusLabel,
  type Defect,
  type DefectStatus,
  type Severity,
} from "@/lib/defects";
import {
  readAfterHandoverForStaff,
  reportDefectForClient,
  setDefectPeriod,
  setRetainer,
  updateDefect,
} from "@/lib/defects-server";

const KES = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

/** The move a studio can make from each state — read straight off the rules. */
const NEXT: Record<string, { status: DefectStatus; label: string }[]> = {
  reported: [
    { status: "accepted", label: "Accept" },
    { status: "rejected", label: "Not covered" },
  ],
  accepted: [
    { status: "in_progress", label: "Start work" },
    { status: "rejected", label: "Not covered" },
  ],
  in_progress: [
    { status: "fixed", label: "Mark fixed" },
    { status: "rejected", label: "Not covered" },
  ],
  rejected: [{ status: "accepted", label: "Reconsider" }],
};

function DefectRow({
  projectId,
  defect,
  onDone,
}: {
  projectId: string;
  defect: Defect;
  onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [err, setErr] = useState("");

  const move = useMutation({
    mutationFn: (input: { status: DefectStatus; rejectReason?: string }) =>
      updateDefect({
        data: {
          projectId,
          defectId: defect.id,
          status: input.status,
          note,
          rejectReason: input.rejectReason ?? "",
        },
      }),
    onSuccess: () => {
      setNote("");
      setReason("");
      setRejecting(false);
      setErr("");
      onDone();
    },
    onError: (e) => setErr(e instanceof Error ? e.message : "That did not save."),
  });

  const actions = NEXT[defect.status] ?? [];

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] text-maroon">{defect.title}</span>
            <Badge className={STATUS_TONE_CLASS[defect.status]}>{statusLabel(defect.status)}</Badge>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/40">
              {defect.severity}
            </span>
            <span className="text-[10px] uppercase tracking-[0.1em] text-ink/35">
              {defect.reportedBy === "studio" ? "logged by studio" : "reported by client"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-ink/45">
            {defect.area ? `${defect.area} · ` : ""}
            {defect.reportedOn ? `Reported ${fmtDate(defect.reportedOn)}` : ""}
            {defect.acceptedOn ? ` · Accepted ${fmtDate(defect.acceptedOn)}` : ""}
            {defect.fixedOn ? ` · Fixed ${fmtDate(defect.fixedOn)}` : ""}
            {defect.verifiedOn ? ` · Verified ${fmtDate(defect.verifiedOn)}` : ""}
          </p>
          {defect.detail ? <p className="mt-2 text-[13px] text-ink/70">{defect.detail}</p> : null}
          {defect.note ? (
            <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-[12px] text-ink/70">
              {defect.note}
            </p>
          ) : null}
          {defect.status === "rejected" && defect.rejectReason ? (
            <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-800">
              Declined: {defect.rejectReason}
            </p>
          ) : null}
          {awaitingStudio(defect.status) ? (
            <p className="mt-2 text-[11px] font-semibold text-amber-700">Waiting on us.</p>
          ) : null}
          {awaitingClient(defect.status) ? (
            <p className="mt-2 text-[11px] font-semibold text-sky-700">
              Fixed — waiting for the client to confirm.
            </p>
          ) : null}
        </div>
      </div>

      {actions.length > 0 ? (
        <div className="mt-3 space-y-2">
          <Input
            aria-label={`Note about ${defect.title}`}
            placeholder="Note for the client (optional) — tile ordered for Tuesday"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <Button
                key={a.status}
                size="sm"
                variant={a.status === "rejected" ? "outline" : "primary"}
                disabled={move.isPending}
                onClick={() => {
                  if (a.status === "rejected") {
                    if (!rejecting) {
                      setRejecting(true);
                      setErr("");
                      return;
                    }
                    move.mutate({ status: "rejected", rejectReason: reason });
                    return;
                  }
                  move.mutate({ status: a.status });
                }}
              >
                {move.isPending && !rejecting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
                {a.status === "rejected" && !rejecting ? "Not covered…" : a.label}
                {a.status === "rejected" && rejecting ? "Confirm decline" : ""}
              </Button>
            ))}
            {rejecting ? (
              <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>
                Cancel
              </Button>
            ) : null}
          </div>
          {rejecting ? (
            <Textarea
              aria-label="Why it is not covered"
              className="min-h-16"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why this is not covered — the client reads this, so it must say why (min 5 chars)."
            />
          ) : null}
          {err ? <p className="text-[12px] text-red-700">{err}</p> : null}
        </div>
      ) : null}
    </li>
  );
}

export function AfterHandoverPanel({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const key = ["after-handover-staff", projectId];
  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: () => readAfterHandoverForStaff({ data: { projectId } }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const [period, setPeriod] = useState<string | null>(null);
  const periodValue = period ?? data?.periodEnd ?? "";
  const savePeriod = useMutation({
    mutationFn: () => setDefectPeriod({ data: { projectId, ends: periodValue } }),
    onSuccess: refresh,
  });

  const [dTitle, setDTitle] = useState("");
  const [dArea, setDArea] = useState("");
  const [dDetail, setDDetail] = useState("");
  const [dSeverity, setDSeverity] = useState<Severity>("minor");
  const logReport = useMutation({
    mutationFn: () =>
      reportDefectForClient({
        data: { projectId, title: dTitle, detail: dDetail, area: dArea, severity: dSeverity },
      }),
    onSuccess: () => {
      setDTitle("");
      setDArea("");
      setDDetail("");
      refresh();
    },
  });

  const r = data?.retainer;
  const [rName, setRName] = useState<string | null>(null);
  const [rCovers, setRCovers] = useState<string | null>(null);
  const [rAmount, setRAmount] = useState<string | null>(null);
  const [rRenews, setRRenews] = useState<string | null>(null);
  const [rStatus, setRStatus] = useState<string | null>(null);
  const [rPaid, setRPaid] = useState<string | null>(null);
  const saveRetainer = useMutation({
    mutationFn: () =>
      setRetainer({
        data: {
          projectId,
          name: rName ?? r?.name ?? "Annual care",
          covers: rCovers ?? r?.covers ?? "",
          annualAmount: Number(rAmount ?? r?.annualAmount ?? 0) || 0,
          renewsOn: rRenews ?? r?.renewsOn ?? "",
          status: (rStatus ?? r?.status ?? "active") as "active" | "lapsed" | "cancelled",
          lastPaidOn: rPaid ?? r?.lastPaidOn ?? "",
        },
      }),
    onSuccess: refresh,
  });

  if (isLoading) {
    return (
      <Panel title="Defects & care" subtitle="After handover">
        <div className="flex items-center gap-3 text-[13px] text-ink/50">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      </Panel>
    );
  }
  if (error || !data) {
    return (
      <Panel title="Defects & care" subtitle="After handover">
        <p className="text-[13px] text-red-700">Could not open this project’s record.</p>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <Panel title="Defect period" subtitle="Set it the day the keys are handed over">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="dp">Ends</Label>
            <Input
              id="dp"
              type="date"
              value={periodValue}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
          <Button size="sm" disabled={savePeriod.isPending} onClick={() => savePeriod.mutate()}>
            {savePeriod.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save
          </Button>
          <p className="text-[12px] text-ink/50">
            {data.periodEnd
              ? `Client-facing deadline: ${fmtDate(data.periodEnd)}.`
              : "No period set — the client sees “not set”."}
          </p>
        </div>
        {savePeriod.error instanceof Error ? (
          <p className="mt-2 text-[12px] text-red-700">{savePeriod.error.message}</p>
        ) : null}
      </Panel>

      <Panel title="Reports" subtitle={`${data.defects.length} on record`} bodyClassName="p-0">
        {data.defects.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-ink/50">
            Nothing reported. A defect logged here has a date, a status and a decision behind it.
          </p>
        ) : (
          <ul className="divide-y divide-ink/8">
            {data.defects.map((d) => (
              <DefectRow
                key={d.id}
                projectId={projectId}
                defect={d}
                onDone={() => void refresh()}
              />
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Log a report made by phone"
        subtitle="They rang; you write it down"
        bodyClassName="p-0"
      >
        <form
          className="space-y-4 px-5 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (dTitle.trim().length >= 5 && !logReport.isPending) logReport.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="sd-title">What is wrong</Label>
              <Input
                id="sd-title"
                value={dTitle}
                onChange={(e) => setDTitle(e.target.value)}
                placeholder="Tap leaking under the kitchen sink"
              />
            </div>
            <div>
              <Label htmlFor="sd-area">Where</Label>
              <Input
                id="sd-area"
                value={dArea}
                onChange={(e) => setDArea(e.target.value)}
                placeholder="Kitchen"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="sd-detail">What they said</Label>
            <Textarea
              id="sd-detail"
              className="min-h-16"
              value={dDetail}
              onChange={(e) => setDDetail(e.target.value)}
              placeholder="Called Tuesday evening, noticed water in the cabinet."
            />
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="sd-sev">Severity</Label>
              <Select
                id="sd-sev"
                value={dSeverity}
                onChange={(e) => setDSeverity(e.target.value as Severity)}
              >
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={dTitle.trim().length < 5 || logReport.isPending}
            >
              <PhoneCall className="size-3.5" />
              Log it
            </Button>
          </div>
          {logReport.error instanceof Error ? (
            <p className="text-[12px] text-red-700">{logReport.error.message}</p>
          ) : null}
          {logReport.isSuccess ? (
            <p className="text-[12px] text-emerald-700">
              Logged — it appears in the client’s portal.
            </p>
          ) : null}
        </form>
      </Panel>

      <Panel title="Maintenance retainer" subtitle="The yearly fee, and when it renews">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="rt-name">Name</Label>
            <Input
              id="rt-name"
              value={rName ?? r?.name ?? ""}
              onChange={(e) => setRName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="rt-amt">Annual fee (KES)</Label>
            <Input
              id="rt-amt"
              type="number"
              min={0}
              step={1000}
              value={rAmount ?? (r ? String(r.annualAmount) : "")}
              onChange={(e) => setRAmount(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="rt-covers">What it covers</Label>
            <Textarea
              id="rt-covers"
              className="min-h-16"
              value={rCovers ?? r?.covers ?? ""}
              onChange={(e) => setRCovers(e.target.value)}
              placeholder="Roof, gutters, waterproofing, two visits a year."
            />
          </div>
          <div>
            <Label htmlFor="rt-renews">Renews on</Label>
            <Input
              id="rt-renews"
              type="date"
              value={rRenews ?? r?.renewsOn ?? ""}
              onChange={(e) => setRRenews(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="rt-status">Status</Label>
            <Select
              id="rt-status"
              value={rStatus ?? r?.status ?? "active"}
              onChange={(e) => setRStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="lapsed">Lapsed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="rt-paid">Last paid</Label>
            <Input
              id="rt-paid"
              type="date"
              value={rPaid ?? r?.lastPaidOn ?? ""}
              onChange={(e) => setRPaid(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" disabled={saveRetainer.isPending} onClick={() => saveRetainer.mutate()}>
            {saveRetainer.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save retainer
          </Button>
          {saveRetainer.error instanceof Error ? (
            <p className="text-[12px] text-red-700">{saveRetainer.error.message}</p>
          ) : (
            r && (
              <p className="text-[12px] text-ink/50">
                Client sees: KES {KES.format(r.annualAmount)} a year · renews {fmtDate(r.renewsOn)}
              </p>
            )
          )}
        </div>
      </Panel>
    </div>
  );
}
