import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Loader2, Plus, ShieldCheck, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import {
  SEVERITIES,
  STATUS_TONE_CLASS,
  fmtDate,
  isStalled,
  retainerLine,
  retainerState,
  statusLabel,
  summariseDefects,
  type Severity,
} from "@/lib/defects";
import { listMyAfterHandover, reportDefect, verifyDefect } from "@/lib/defects-server";
import { postMyMessage } from "@/lib/messages-server";

const KES = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

/**
 * The years after the keys, on one screen.
 *
 * Two things a finished build needs that nothing else in the portal holds: the
 * deadline for reporting what went wrong, and the fee for the years after the
 * deadline. Together they are the difference between a studio you can ring in
 * April and one you cannot.
 *
 * The report form stays available after the period closes — you can always tell
 * us about a crack — but it says plainly that the studio decides coverage from
 * there, because pretending every late report is covered is how a promise
 * becomes a liability nobody honours.
 */
export function AfterHandoverPanel({
  projectId,
  onChanged,
}: {
  projectId: string;
  onChanged?: () => void;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["after-handover", projectId],
    queryFn: () => listMyAfterHandover({ data: { projectId } }),
  });

  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [detail, setDetail] = useState("");
  const [severity, setSeverity] = useState<Severity>("minor");
  const [formError, setFormError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [askText, setAskText] = useState("");

  const report = useMutation({
    mutationFn: () => reportDefect({ data: { projectId, title, detail, area, severity } }),
    onSuccess: () => {
      setTitle("");
      setArea("");
      setDetail("");
      setFormError("");
      void queryClient.invalidateQueries({ queryKey: ["after-handover", projectId] });
      onChanged?.();
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "That did not send."),
  });

  const ask = useMutation({
    mutationFn: (defectId: string) =>
      postMyMessage({
        data: { projectId, body: `About “${titleFor(defectId)}” — ${askText.trim()}` },
      }),
    onSuccess: () => {
      setAskText("");
      void queryClient.invalidateQueries({ queryKey: ["my-messages", projectId] });
      onChanged?.();
    },
  });

  const verify = useMutation({
    mutationFn: (defectId: string) => verifyDefect({ data: { projectId, defectId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["after-handover", projectId] });
      onChanged?.();
    },
  });

  if (isLoading) {
    return (
      <Panel title="After handover" subtitle="Defects and the care plan">
        <div className="flex items-center gap-3 text-[13px] text-ink/50">
          <Loader2 className="size-4 animate-spin" />
          Loading the record…
        </div>
      </Panel>
    );
  }

  if (error || !data) {
    return (
      <Panel title="After handover" subtitle="Defects and the care plan">
        <p className="text-[13px] text-red-700">
          We could not open this. Refresh the page and try again.
        </p>
      </Panel>
    );
  }

  const titleFor = (id: string) => data.defects.find((x) => x.id === id)?.title ?? "defect";
  const now = new Date();
  const summary = summariseDefects(data.defects, data.periodEnd, now);
  const rState = retainerState(data.retainer, now);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Days left to report"
          value={summary.daysRemaining === null ? "—" : String(summary.daysRemaining)}
          sub={summary.periodEnd ? `Until ${fmtDate(summary.periodEnd)}` : "Period not set"}
        />
        <StatCard
          label="Open defects"
          value={String(summary.open)}
          sub={
            summary.awaitingClient
              ? `${summary.awaitingClient} waiting for your check`
              : "Nothing waiting on you"
          }
        />
        <StatCard
          label="Care plan"
          value={data.retainer ? `KES ${KES.format(data.retainer.annualAmount)}` : "None"}
          sub={retainerLine(data.retainer, now)}
        />
      </div>

      <Panel title="Defect period" subtitle="What the promise covers, and until when">
        <p
          className={
            summary.daysRemaining === 0
              ? "text-[14px] leading-relaxed text-amber-900"
              : "text-[14px] leading-relaxed text-ink/75"
          }
        >
          {summary.headline}
        </p>
        {summary.stalled > 0 ? (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {summary.stalled} report{summary.stalled === 1 ? " has" : "s have"} been waiting for a
            response for over two weeks. Message the studio if you have not heard.
          </p>
        ) : null}
      </Panel>

      <Panel title="Report something" subtitle="What is wrong, and where" bodyClassName="p-0">
        <form
          className="space-y-4 px-5 py-5"
          onSubmit={(e) => {
            e.preventDefault();
            setFormError("");
            if (title.trim().length >= 5 && !report.isPending) report.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="df-title">What is wrong</Label>
              <Input
                id="df-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Crack above the ensuite door"
              />
            </div>
            <div>
              <Label htmlFor="df-area">Where</Label>
              <Input
                id="df-area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ensuite, first floor"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="df-detail">What you can see</Label>
            <Textarea
              id="df-detail"
              className="min-h-20"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Hairline crack on the reveal, about 30 cm, started after the rains."
            />
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="df-sev">How serious</Label>
              <Select
                id="df-sev"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
              >
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" size="sm" disabled={title.trim().length < 5 || report.isPending}>
              {report.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              Report it
            </Button>
          </div>

          {formError ? <p className="text-[12px] text-red-700">{formError}</p> : null}
          {summary.daysRemaining === 0 ? (
            <p className="text-[12px] text-amber-800">
              The defect period has closed. Report it anyway — the studio decides from here whether
              it is covered, and you will get that answer in writing.
            </p>
          ) : null}
        </form>
      </Panel>

      <Panel
        title="Reports"
        subtitle={summary.total ? `${summary.total} on record` : "Nothing reported yet"}
        bodyClassName="p-0"
      >
        {summary.total === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-ink/50">
            Nothing reported on this project. If something is wrong after handover, it goes here
            with a date on it.
          </p>
        ) : (
          <ul className="divide-y divide-ink/8">
            {data.defects.map((d) => (
              <li key={d.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] text-maroon">{d.title}</span>
                      <Badge className={STATUS_TONE_CLASS[d.status]}>{statusLabel(d.status)}</Badge>
                      {d.severity !== "minor" ? (
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/40">
                          {d.severity}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] text-ink/45">
                      {d.area ? `${d.area} · ` : ""}Reported {fmtDate(d.reportedOn)}
                      {d.acceptedOn ? ` · Accepted ${fmtDate(d.acceptedOn)}` : ""}
                      {d.fixedOn ? ` · Fixed ${fmtDate(d.fixedOn)}` : ""}
                      {d.verifiedOn ? ` · Closed ${fmtDate(d.verifiedOn)}` : ""}
                    </p>
                    {d.detail ? <p className="mt-2 text-[13px] text-ink/70">{d.detail}</p> : null}
                    {d.note ? (
                      <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-[12px] text-ink/70">
                        <span className="font-semibold text-maroon">From the studio:</span> {d.note}
                      </p>
                    ) : null}
                    {d.status === "rejected" ? (
                      <p className="mt-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-800">
                        <span className="font-semibold">Not covered — </span>
                        {d.rejectReason || "no reason was recorded. Ask the studio why."}
                      </p>
                    ) : null}
                    {isStalled(d, now) ? (
                      <p className="mt-2 text-[11px] font-semibold text-amber-700">
                        Reported {fmtDate(d.reportedOn)} — no response yet.
                      </p>
                    ) : null}
                  </div>

                  {d.status === "fixed" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={verify.isPending}
                      onClick={() => verify.mutate(d.id)}
                    >
                      <CheckCircle2 className="size-3.5" />I have checked it
                    </Button>
                  ) : null}
                </div>

                {open !== d.id ? (
                  <button
                    type="button"
                    className="mt-2 text-[12px] text-maroon underline"
                    onClick={() => {
                      setOpen(d.id);
                      setAskText("");
                      ask.reset();
                    }}
                  >
                    Ask the studio about this
                  </button>
                ) : null}
                {open === d.id ? (
                  <form
                    className="mt-2 flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (askText.trim() && !ask.isPending) ask.mutate(d.id);
                    }}
                  >
                    <Input
                      aria-label={`Message about ${d.title}`}
                      className="max-w-md flex-1"
                      placeholder="Any update on this?"
                      value={askText}
                      onChange={(e) => setAskText(e.target.value)}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      disabled={ask.isPending || !askText.trim()}
                    >
                      {ask.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                      Send
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setOpen(null);
                        ask.reset();
                      }}
                    >
                      Close
                    </Button>
                    {ask.error instanceof Error ? (
                      <p className="w-full text-[12px] text-red-700">{ask.error.message}</p>
                    ) : null}
                    {ask.isSuccess ? (
                      <p className="w-full text-[12px] text-emerald-700">
                        Sent — it is in your Messages thread, and the studio is notified.
                      </p>
                    ) : null}
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {data.retainer ? (
        <Panel
          title={data.retainer.name}
          subtitle={rState === "lapsed" ? "Renewal due" : "Maintenance retainer"}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-relaxed text-ink/70">{data.retainer.covers}</p>
              <p className="mt-2 text-[12px] text-ink/50">
                {retainerLine(data.retainer, now)}
                {data.retainer.lastPaidOn
                  ? ` · Last paid ${fmtDate(data.retainer.lastPaidOn)}`
                  : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl text-maroon">
                KES {KES.format(data.retainer.annualAmount)}
              </p>
              <p className="text-[11px] uppercase tracking-[0.1em] text-ink/40">a year</p>
            </div>
          </div>
          {rState === "due_soon" || rState === "lapsed" ? (
            <p className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900">
              <Wrench className="size-4 shrink-0" aria-hidden />
              {rState === "lapsed"
                ? "The retainer has lapsed — a defect reported now has nobody answerable for it. Renew to put the cover back."
                : "Renewal is close. Renewing keeps the cover unbroken."}
            </p>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-[12px] text-emerald-800">
              <ShieldCheck className="size-4" aria-hidden />
              Cover active.
            </p>
          )}
        </Panel>
      ) : (
        <Panel title="Maintenance" subtitle="The years after the build">
          <p className="text-[13px] leading-relaxed text-ink/60">
            No maintenance retainer on this project yet. If the studio offers one, it appears here
            with what it covers, what it costs and when it renews.
          </p>
        </Panel>
      )}
    </div>
  );
}
