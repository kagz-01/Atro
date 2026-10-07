import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Inbox,
  Loader2,
  Lock,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { EnquiriesInbox } from "@/components/admin/enquiries-inbox";
import { getOpsOverview, type OpsOverview } from "@/lib/ops";
import {
  addDocument,
  addMilestoneEvidence,
  certifyPayment,
  getMyStaffRole,
  getStaffProject,
  listStaffProjects,
  postUpdate,
  raiseDecision,
  updateMilestone,
  type StaffProjectSummary,
} from "@/lib/staff-ops";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminConsole,
  head: () => ({
    meta: [{ title: "Studio console — ATRO" }],
    robots: { index: false, follow: false },
  }),
});

const KES = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
const kes = (n: number) => `KES ${KES.format(n)}`;

function ago(iso: string | null): string {
  if (!iso) return "—";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

/* ── gate ── */

function StaffWall() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center bg-stone/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line/50 bg-paper p-8 text-center shadow-card">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-maroon/10 text-maroon">
          <Lock className="size-6" />
        </span>
        <h1 className="mt-6 font-display text-2xl text-maroon">Studio console</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This area is for ATRO staff. Sign in with the account ATRO has listed, or
          ask the studio to add your address.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link to="/login">Sign in</Link>
        </Button>
        <Link
          to="/portal"
          className="mt-4 inline-block text-[13px] text-burgundy underline decoration-gold decoration-2 underline-offset-4"
        >
          Client portal instead
        </Link>
      </div>
    </main>
  );
}

/* ── one project in the list ── */

function ProjectRow({
  project,
  onOpen,
}: {
  project: StaffProjectSummary;
  onOpen: (id: string) => void;
}) {
  const needsAttention = project.blockedStages > 0 || project.openDecisions > 0;
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(project.id)}
        className={cn(
          "w-full rounded-2xl border bg-white p-5 text-left transition-colors hover:border-burgundy",
          needsAttention ? "border-amber-300" : "border-ink/10",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-display text-lg text-maroon">{project.title}</span>
              <span className="font-mono text-[11px] text-muted">{project.reference}</span>
              {project.source === "sample" ? (
                <Badge tone="gold" className="h-5 text-[9px]">Sample</Badge>
              ) : null}
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink/55">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {project.clientCity || project.clientLabel || "Kenya"}
              </span>
              <span className="inline-flex items-center gap-1">
                {project.clientLabel || "Unnamed client"}
              </span>
              <span>Stage: {project.stage || "—"}</span>
              <span>Last update {ago(project.lastActivityAt)}</span>
              <span>Client viewed {ago(project.lastViewedAt)}</span>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {project.blockedStages > 0 ? (
              <Badge tone="live" className="h-5 text-[9px]">
                {project.blockedStages} blocked
              </Badge>
            ) : null}
            {project.openDecisions > 0 ? (
              <Badge tone="gold" className="h-5 text-[9px]">
                {project.openDecisions} awaiting client
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-24 overflow-hidden rounded-full bg-ink/10">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                style={{ width: `${project.progress}%` }}
              />
            </span>
            <span className="text-ink/60">{project.progress}%</span>
          </span>
          <span className="text-ink/60">Contract {kes(project.contractValue)}</span>
          <span className="text-ink/60">Paid {kes(project.paidToDate)}</span>
          {project.currentlyCertified > 0 ? (
            <span className="text-burgundy">
              Certified {kes(project.currentlyCertified)}
            </span>
          ) : null}
          <span
            className={cn(
              "ml-auto",
              project.onTrack ? "text-emerald-700" : "text-amber-700",
            )}
          >
            {project.onTrack ? "On track" : "Needs attention"}
          </span>
        </div>
      </button>
    </li>
  );
}

/* ── the write panel: this is the half the client never sees ── */

const DOC_CATEGORIES = [
  { value: "Contract", label: "Contract" },
  { value: "Approval", label: "Approval" },
  { value: "Certificate", label: "Certificate" },
  { value: "Payment", label: "Payment" },
  { value: "Drawing", label: "Drawing" },
  { value: "Report", label: "Report" },
] as const;

const DOC_STATES = [
  { value: "awaiting", label: "Pending" },
  { value: "signed", label: "Signed" },
  { value: "verified", label: "Verified" },
] as const;

const STATUS_OPTIONS = [
  { value: "active", label: "In progress" },
  { value: "complete", label: "Complete" },
  { value: "blocked", label: "Blocked" },
  { value: "pending", label: "Not started" },
] as const;

function WriteBlock({
  title,
  hint,
  onRun,
  children,
}: {
  title: string;
  hint: string;
  onRun: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <section className="rounded-2xl border border-ink/10 bg-cream p-5">
      <h3 className="font-display text-lg text-maroon">{title}</h3>
      <p className="mt-1 text-[12px] leading-relaxed text-ink/55">{hint}</p>
      <div className="mt-4 space-y-3">{children}</div>
      <Button
        className="mt-4 w-full"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void onRun().finally(() => setBusy(false));
        }}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        {busy ? "Saving…" : "Save"}
      </Button>
    </section>
  );
}

function ProjectDetail({
  projectId,
  onBack,
  onChanged,
}: {
  projectId: string;
  onBack: () => void;
  onChanged: () => void;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["staff-project", projectId],
    queryFn: () => getStaffProject({ data: { projectId } }),
  });

  // Form state
  const [milestoneId, setMilestoneId] = useState("");
  const [status, setStatus] = useState<string>("active");
  const [milestoneNote, setMilestoneNote] = useState("");
  const [evidenceCaption, setEvidenceCaption] = useState("");
  const [evidenceDetail, setEvidenceDetail] = useState("");
  const [decisionTitle, setDecisionTitle] = useState("");
  const [decisionOptions, setDecisionOptions] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState<(typeof DOC_CATEGORIES)[number]["value"]>(
    "Contract",
  );
  const [docRef, setDocRef] = useState("");
  const [docState, setDocState] = useState<(typeof DOC_STATES)[number]["value"]>("awaiting");

  async function run(action: () => Promise<unknown>, done: string) {
    try {
      await action();
      await refetch();
      onChanged();
      toast.success(done);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That did not save.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-3xl border border-ink/10 bg-white py-20">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <p className="text-[13px] text-red-800">
          {error instanceof Error ? error.message : "Could not open that project."}
        </p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>
    );
  }

  const p = data.project;
  const undecided = data.decisions.filter((d) => d.state === "decided");
  const uncertified = data.payments.filter((x) => x.status === "due" || x.status === "scheduled");

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-ink/10 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="size-4" />
              All projects
            </Button>
            <h2 className="mt-3 font-display text-2xl text-maroon">{p.title}</h2>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink/55">
              <span className="font-mono">{p.reference}</span>
              <span>{p.clientLabel}</span>
              {p.clientCity ? <span>{p.clientCity}</span> : null}
              <span>
                {p.startedLabel} → {p.targetLabel}
              </span>
              {p.isSample ? <Badge tone="gold" className="h-5 text-[9px]">Sample</Badge> : null}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl text-maroon">{p.progress}%</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{p.stage}</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-ink/8 pt-5 text-[12px] md:grid-cols-4">
          {[
            ["Contract", kes(p.contractValue)],
            ["Paid", kes(p.budget.paidToDate)],
            ["Certified, unreleased", kes(p.budget.currentlyCertified)],
            ["Retention", kes(p.budget.retentionHeld)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted">{k}</dt>
              <dd className="mt-1 text-[14px] text-maroon">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WriteBlock
          title="Update a milestone"
          hint="Set the stage status the client sees. Completing one opens the next automatically."
          onRun={() =>
            run(async () => {
              if (!milestoneId) throw new Error("Pick a milestone first.");
              await updateMilestone({
                data: {
                  projectId,
                  milestoneId,
                  status: status as "active" | "complete" | "blocked" | "pending",
                  note: milestoneNote.trim() || undefined,
                },
              });
              setMilestoneNote("");
            }, "Milestone updated.")
          }
        >
          <div>
            <Label htmlFor="st-ms">Milestone</Label>
            <Select id="st-ms" value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)}>
              <option value="">Choose a stage…</option>
              {data.milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.order}. {m.name} — {m.status}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="st-status">Status</Label>
            <Select id="st-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="st-note">Note to the client (optional)</Label>
            <Textarea
              id="st-note"
              className="min-h-20"
              value={milestoneNote}
              onChange={(e) => setMilestoneNote(e.target.value)}
              placeholder="Frame completed to first floor ring beam; ring beam cast 12 May."
            />
          </div>
        </WriteBlock>

        <WriteBlock
          title="Add evidence"
          hint="A site photograph or inspection note against a stage. The client sees this in the milestone record."
          onRun={() =>
            run(async () => {
              if (!milestoneId) throw new Error("Pick a milestone first.");
              if (evidenceCaption.trim().length < 3) throw new Error("Give the evidence a caption.");
              await addMilestoneEvidence({
                data: {
                  projectId,
                  milestoneId,
                  caption: evidenceCaption.trim(),
                  detail: evidenceDetail.trim(),
                },
              });
              setEvidenceCaption("");
              setEvidenceDetail("");
            }, "Evidence added.")
          }
        >
          <div>
            <Label htmlFor="st-cap">Caption</Label>
            <Input
              id="st-cap"
              value={evidenceCaption}
              onChange={(e) => setEvidenceCaption(e.target.value)}
              placeholder="Ring beam cast — 21 m³"
            />
          </div>
          <div>
            <Label htmlFor="st-detail">Detail</Label>
            <Textarea
              id="st-detail"
              className="min-h-20"
              value={evidenceDetail}
              onChange={(e) => setEvidenceDetail(e.target.value)}
              placeholder="Reinforcement photographed before the pour. Engineer present."
            />
          </div>
        </WriteBlock>

        <WriteBlock
          title="Raise a decision"
          hint="Puts a choice to the client. One option per line. They record it in the decision log."
          onRun={() =>
            run(async () => {
              const options = decisionOptions
                .split("\n")
                .map((o) => o.trim())
                .filter(Boolean);
              if (decisionTitle.trim().length < 3) throw new Error("Give the decision a title.");
              if (options.length < 2) throw new Error("List at least two options, one per line.");
              await raiseDecision({
                data: {
                  projectId,
                  title: decisionTitle.trim(),
                  detail: "",
                  options,
                  costImpact: 0,
                },
              });
              setDecisionTitle("");
              setDecisionOptions("");
            }, "Decision raised.")
          }
        >
          <div>
            <Label htmlFor="st-dtitle">Title</Label>
            <Input
              id="st-dtitle"
              value={decisionTitle}
              onChange={(e) => setDecisionTitle(e.target.value)}
              placeholder="Roof covering"
            />
          </div>
          <div>
            <Label htmlFor="st-dopts">Options (one per line)</Label>
            <Textarea
              id="st-dopts"
              className="min-h-24"
              value={decisionOptions}
              onChange={(e) => setDecisionOptions(e.target.value)}
              placeholder={"Stone-coated tile\nConcrete roof tile\nMetal sheet"}
            />
          </div>
        </WriteBlock>

        <WriteBlock
          title="Post an update"
          hint="Appears in the client's activity feed and counts as new since their last visit."
          onRun={() =>
            run(async () => {
              if (updateTitle.trim().length < 3) throw new Error("Give the update a title.");
              await postUpdate({
                data: { projectId, title: updateTitle.trim(), body: updateBody.trim(), kind: "note" },
              });
              setUpdateTitle("");
              setUpdateBody("");
            }, "Update posted.")
          }
        >
          <div>
            <Label htmlFor="st-utitle">Title</Label>
            <Input
              id="st-utitle"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              placeholder="Weekly report — Week 08"
            />
          </div>
          <div>
            <Label htmlFor="st-ubody">Detail</Label>
            <Textarea
              id="st-ubody"
              className="min-h-24"
              value={updateBody}
              onChange={(e) => setUpdateBody(e.target.value)}
              placeholder="Frame on track. Slab deck poured Thursday. Rain expected week 9."
            />
          </div>
        </WriteBlock>
      </div>

      <WriteBlock
        title="Add to the document vault"
        hint="Contracts, approvals, drawings and certificates the client can see. They keep the record."
        onRun={() =>
          run(async () => {
            if (docName.trim().length < 3) throw new Error("Name the document.");
            await addDocument({
              data: {
                projectId,
                name: docName.trim(),
                category: docCategory,
                reference: docRef.trim(),
                state: docState,
              },
            });
            setDocName("");
            setDocRef("");
          }, "Document added to the vault.")
        }
      >
        <div>
          <Label htmlFor="st-docname">Document</Label>
          <Input
            id="st-docname"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="Structural drawings Rev C"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="st-doccat">Category</Label>
            <Select
              id="st-doccat"
              value={docCategory}
              onChange={(e) =>
                setDocCategory(e.target.value as (typeof DOC_CATEGORIES)[number]["value"])
              }
            >
              {DOC_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="st-docref">Reference</Label>
            <Input
              id="st-docref"
              value={docRef}
              onChange={(e) => setDocRef(e.target.value)}
              placeholder="SD/Rev C"
            />
          </div>
          <div>
            <Label htmlFor="st-docstate">State</Label>
            <Select
              id="st-docstate"
              value={docState}
              onChange={(e) =>
                setDocState(e.target.value as (typeof DOC_STATES)[number]["value"])
              }
            >
              {DOC_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </WriteBlock>

      {uncertified.length > 0 ? (
        <section className="rounded-3xl border border-ink/10 bg-white p-6">
          <h3 className="font-display text-lg text-maroon">Certify a payment</h3>
          <p className="mt-1 text-[12px] text-ink/55">
            Only certified amounts appear as releasable in the client portal.
          </p>
          <ul className="mt-4 space-y-2">
            {uncertified.map((pay) => (
              <li
                key={pay.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-cream p-4"
              >
                <span>
                  <span className="block text-[14px] text-maroon">{pay.label}</span>
                  <span className="text-[12px] text-ink/50">{kes(pay.amount)}</span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void run(
                      () =>
                        certifyPayment({
                          data: {
                            projectId,
                            paymentId: pay.id,
                            certificate: `QS/${new Date().getFullYear()}/${p.reference.split("-").pop()}-${pay.label.slice(0, 3)}`,
                          },
                        }),
                      "Payment certified.",
                    )
                  }
                >
                  Certify
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-3xl border border-ink/10 bg-white p-6">
        <h3 className="font-display text-lg text-maroon">What the client has decided</h3>
        {data.decisions.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink/55">No decisions on this project yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.decisions.map((d) => (
              <li key={d.id} className="rounded-xl border border-ink/10 bg-cream p-4">
                <p className="text-[14px] text-maroon">{d.title}</p>
                <p className="mt-1 text-[12px] text-ink/55">
                  {d.state === "decided" ? `Chose: ${d.chosen}` : "Awaiting the client"} ·{" "}
                  {d.date}
                </p>
              </li>
            ))}
          </ul>
        )}
        {undecided.length > 0 ? null : (
          <p className="mt-4 text-[12px] text-muted">
            Every decision on this project has been recorded.
          </p>
        )}
      </section>
    </div>
  );
}

/* ── overview: the numbers a studio runs on ── */

function Money({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{label}</p>
      <p className={cn("mt-2 font-display text-2xl text-maroon", tone)}>{value}</p>
    </div>
  );
}

function GroupBars({ rows, empty }: { rows: OpsOverview["byTrack"]; empty: string }) {
  if (rows.length === 0) {
    return <p className="text-[13px] text-ink/55">{empty}</p>;
  }
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.key} className="text-[13px]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-ink/70">{row.label}</span>
            <span className="text-ink/50">
              {row.count} · {kes(row.value)}
            </span>
          </div>
          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-ink/10">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
              style={{ width: `${max > 0 ? (row.count / max) * 100 : 0}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

const ATTENTION_COPY: Record<string, { label: string; cls: string }> = {
  blocked: { label: "Blocked", cls: "bg-red-50 text-red-800 border-red-200" },
  decision: { label: "Awaiting client", cls: "bg-amber-50 text-amber-900 border-amber-300" },
  stalled: { label: "Gone quiet", cls: "bg-stone-100 text-stone-700 border-stone-300" },
  unviewed: { label: "Client not looking", cls: "bg-sky-50 text-sky-900 border-sky-300" },
};

function Overview({ onOpen }: { onOpen: (id: string) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["ops-overview"],
    queryFn: () => getOpsOverview({ data: undefined }),
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  const { funnel, money } = data;
  const exposure = money.certifiedUnreleased + money.retentionHeld;

  return (
    <div className="space-y-8">
      {/* Funnel */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
          The funnel
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Enquiries received", String(funnel.enquiriesTotal), `${funnel.enquiriesLast7Days} in the last 7 days`],
            ["Of those, diaspora", String(funnel.enquiriesDiaspora), `${funnel.enquiriesTotal ? Math.round((funnel.enquiriesDiaspora / funnel.enquiriesTotal) * 100) : 0}% of enquiries`],
            ["Projects opened", String(funnel.projectsLive), `${funnel.clients} client account${funnel.clients === 1 ? "" : "s"}`],
            ["Sample projects", String(funnel.projectsSample), "not real work"],
          ].map(([label, value, sub]) => (
            <div key={label} className="rounded-2xl border border-ink/10 bg-cream p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{label}</p>
              <p className="mt-2 font-display text-2xl text-maroon">{value}</p>
              <p className="mt-1 text-[12px] text-ink/50">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Money */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
          Money
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Money label="Contracted" value={kes(money.contractValue)} />
          <Money label="Paid to date" value={kes(money.paid)} tone="text-emerald-700" />
          <Money
            label="Certified, unreleased"
            value={kes(money.certifiedUnreleased)}
            tone="text-amber-700"
          />
          <Money label="Retention held" value={kes(money.retentionHeld)} tone="text-burgundy" />
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-ink/55">
          {kes(exposure)} of the studio&apos;s money is committed but not yet received —
          {money.contractValue > 0
            ? ` that is ${((exposure / money.contractValue) * 100).toFixed(1)}% of contracted value.`
            : " nothing contracted yet."}
        </p>
      </section>

      {/* Workload */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
            Workload by kind of work
          </p>
          <div className="mt-4">
            <GroupBars rows={data.byTrack} empty="No projects opened yet." />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
            Workload by county
          </p>
          <div className="mt-4">
            <GroupBars rows={data.byZone} empty="No zones recorded yet." />
          </div>
        </div>
      </section>

      {/* The queue that needs a human */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
          Needs a human
        </p>
        {data.attention.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-[13px] text-emerald-900">
            Nothing is stuck, nothing is waiting on a client, and everyone has looked
            at their project recently.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.attention.map((item, i) => (
              <li key={`${item.projectId}-${item.kind}-${i}`}>
                <button
                  type="button"
                  onClick={() => onOpen(item.projectId)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white p-4 text-left transition-colors hover:border-burgundy"
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] text-maroon">{item.title}</span>
                      <span className="font-mono text-[11px] text-muted">{item.reference}</span>
                      <Badge tone="gold" className="h-5 text-[9px]">
                        {ATTENTION_COPY[item.kind]?.label ?? item.kind}
                      </Badge>
                    </span>
                    <span className="mt-1 block text-[12px] text-ink/60">{item.detail}</span>
                  </span>
                  <span className="shrink-0 text-[12px] text-muted">
                    {item.ageDays === 0 ? "today" : `${item.ageDays}d`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ── console ── */

function AdminConsole() {
  const hydrated = useIsHydrated();
  const [roleState, setRoleState] = useState<{ role: string | null; userId: string | null } | null>(
    null,
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "attention" | "sample">("all");
  const [tab, setTab] = useState<"overview" | "projects" | "enquiries">("overview");

  useEffect(() => {
    let live = true;
    getMyStaffRole({ data: undefined })
      .then((r) => live && setRoleState(r))
      .catch(() => live && setRoleState({ role: null, userId: null }));
    return () => {
      live = false;
    };
  }, []);

  const isStaff = roleState?.role === "staff" || roleState?.role === "admin";

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ["staff-projects"],
    queryFn: () => listStaffProjects({ data: undefined }),
    enabled: isStaff,
  });

  if (!hydrated || roleState === null) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center" aria-busy>
        <Loader2 className="size-6 animate-spin text-gold" />
      </main>
    );
  }

  if (!isStaff) return <StaffWall />;

  const rows = (projects ?? []).filter((p) => {
    if (filter === "attention") return p.blockedStages > 0 || p.openDecisions > 0 || !p.onTrack;
    if (filter === "sample") return p.source === "sample";
    return true;
  });

  return (
    <>
      <section className="relative overflow-hidden bg-maroon pt-28 pb-12 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-burgundy/50 via-maroon to-maroon" />
        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge tone="gold" className="mb-4">Studio console</Badge>
              <h1 className="font-display text-4xl text-paper sm:text-5xl">
                Every project, one page
              </h1>
              <p className="mt-4 max-w-2xl text-paper/75">
                What ATRO posts here is what the client sees in their portal — stage
                status, evidence, certificates, decisions and weekly updates.
              </p>
            </div>
            <Link
              to="/admin"
              className="shrink-0 rounded-full border border-paper/25 px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:border-gold hover:text-gold"
            >
              Enquiries inbox
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-paper py-10 md:py-14">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-wrap items-center gap-2">
            {([
              ["overview", "Overview"],
              ["projects", "Projects"],
              ["enquiries", "Enquiries"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "cursor-pointer rounded-full border px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] transition-colors",
                  tab === id
                    ? "border-maroon bg-maroon text-paper"
                    : "border-ink/12 text-ink/60 hover:border-burgundy hover:text-burgundy",
                )}
              >
                {label}
              </button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto"
              onClick={() => void refetch()}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>

          {tab === "overview" ? <Overview onOpen={setSelected} /> : null}
          {tab === "enquiries" ? (
            <div className="mt-8">
              <EnquiriesInbox />
            </div>
          ) : null}
          {tab === "projects" ? null : null}

          {tab === "projects" && selected ? (
            <div className="mt-6">
              <ProjectDetail
              projectId={selected}
              onBack={() => setSelected(null)}
              onChanged={() => void refetch()}
            />
            </div>
          ) : tab === "projects" && isLoading ? (
            <div className="mt-6 flex justify-center py-16">
              <Loader2 className="size-6 animate-spin text-gold" />
            </div>
          ) : tab === "projects" && rows.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-ink/15 py-16 text-center">
              <Inbox className="size-7 text-ink/30" />
              <p className="mt-4 font-display text-xl text-maroon">Nothing here yet</p>
              <p className="mt-2 max-w-md text-[13px] text-ink/55">
                Projects appear as soon as a client opens one in their portal, or you
                create one for them.
              </p>
            </div>
          ) : tab === "projects" ? (
            <>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {([
                  ["all", "All"],
                  ["attention", "Needs attention"],
                  ["sample", "Sample projects"],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={cn(
                      "cursor-pointer rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors",
                      filter === id
                        ? "border-burgundy bg-burgundy/10 text-burgundy"
                        : "border-ink/12 text-ink/60 hover:border-burgundy hover:text-burgundy",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <ul className="mt-4 space-y-3">
                {rows.map((p) => (
                  <ProjectRow key={p.id} project={p} onOpen={setSelected} />
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}

