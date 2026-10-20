import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  FolderKanban,
  Hourglass,
  Inbox,
  LayoutDashboard,
  Loader2,
  Lock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { DashboardShell } from "@/components/dashboard/shell";
import {
  Donut,
  GroupedBars,
  MonthlyColumns,
  type Slice,
} from "@/components/dashboard/charts";
import { EnquiriesInbox } from "@/components/admin/enquiries-inbox";
import { SelectionsPanel } from "@/components/admin/selections-panel";
import { ApprovalsPanel } from "@/components/admin/approvals-panel";
import { EvidenceUploader } from "@/components/admin/evidence-uploader";
import { StudioMessagesPanel } from "@/components/admin/messages-panel";
import { AfterHandoverPanel } from "@/components/admin/after-handover-panel";
import { VariationsPanel } from "@/components/admin/variations-panel";
import { PresencePanel } from "@/components/admin/presence-panel";
import { readMessagesForStaff } from "@/lib/messages-server";
import { listPresenceForStaff } from "@/lib/presence-server";
import { isOpen } from "@/lib/presence";
import { getOpsOverview, type GroupRow } from "@/lib/ops";
import {
  getMyAccess,
  grantStaff,
  listStaff,
  requestStaffAccess,
  revokeStaff,
} from "@/lib/staff-access";
import { issueStatementForProject, releaseRetention } from "@/lib/staff-ops";
import { listProjectDocuments, voidDocument } from "@/lib/invoice-server";
import { KIND_LABEL } from "@/lib/invoices";
import { runAttentionSweepNow } from "@/lib/attention";
import {
  addDocument,
  addMilestoneEvidence,
  certifyPayment,
  getDeliveryLog,
  getMyStaffRole,
  getStaffProject,
  listStaffProjects,
  postUpdate,
  raiseDecision,
  releaseHeldDeliveries,
  retryDeliveries,
  updateMilestone,
  type StaffProjectSummary,
} from "@/lib/staff-ops";
import {
  getPaymentInstructions,
  savePaymentInstructions,
} from "@/lib/how-to-pay-server";
import { stampIn } from "@/lib/tz";
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

/**
 * Short money for headline figures.
 *
 * "KES 82,500,000" wraps onto two lines in a quarter-width card and forces the
 * label and the number apart. KES 82.5M reads at a glance and keeps the exact
 * figure available in the card's tooltip.
 */
const kesShort = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `KES ${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `KES ${Math.round(n / 1_000)}k`;
  return `KES ${KES.format(n)}`;
};


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

const DELIVERY_STATUS: Record<string, string> = {
  sent: "bg-emerald-50 text-emerald-800 border-emerald-200",
  pending: "bg-amber-50 text-amber-900 border-amber-300",
  skipped: "bg-stone-100 text-stone-600 border-stone-300",
  failed: "bg-red-50 text-red-800 border-red-200",
  suppressed: "bg-burgundy/5 text-burgundy border-burgundy/25",
};

function DeliveryLog({ projectId, onChanged }: { projectId: string; onChanged: () => void }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["delivery-log", projectId],
    queryFn: () => getDeliveryLog({ data: { projectId } }),
  });
  const [retrying, setRetrying] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const heldCount = (data?.log ?? []).filter((n) => n.status === "pending" && n.deliverAfter)
    .length;
  /* onChanged refetches the project's headline, not this query key — so a
     release or retry redraws its own rows too, else the held button keeps
     counting rows that have already gone. */
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["delivery-log", projectId] });
    void onChanged();
  };

  if (isLoading || !data) return null;

  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg text-maroon">What the client was told</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
            Every post records what it tried to send. A channel with no credentials is
            marked skipped rather than quietly dropped, and one aimed at a client whose
            zone is asleep waits for their morning instead of their three a.m.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {heldCount > 0 ? (
            <Button
              size="sm"
              disabled={releasing}
              onClick={() => {
                setReleasing(true);
                void releaseHeldDeliveries({ data: { projectId } })
                  .then((r) => {
                    toast.success(
                      r.sent === 1 ? "1 held row sent on its way." : `${r.sent} held rows sent on their way.`,
                    );
                    refresh();
                  })
                  .catch((e: unknown) =>
                    toast.error(e instanceof Error ? e.message : "Release failed."),
                  )
                  .finally(() => setReleasing(false));
              }}
            >
              Send held now ({heldCount})
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            disabled={retrying}
            onClick={() => {
              setRetrying(true);
              void retryDeliveries({ data: { projectId } })
                .then((r) => {
                  toast.success(`${r.queued} queued for another attempt.`);
                  refresh();
                })
                .catch((e: unknown) =>
                  toast.error(e instanceof Error ? e.message : "Retry failed."),
                )
                .finally(() => setRetrying(false));
            }}
          >
            Retry failed
          </Button>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {data.channels.map((c) => (
          <li
            key={c.channel}
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
              c.configured
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-stone-100 text-stone-600 border-stone-300",
            )}
            title={c.configured ? "Configured" : c.reason}
          >
            {c.channel}
            {c.configured ? " ready" : " not set"}
          </li>
        ))}
      </ul>

      {data.log.length === 0 ? (
        <p className="mt-5 text-[13px] text-ink/55">Nothing has been sent to this client yet.</p>
      ) : (
        <ul className="mt-5 space-y-2">
          {data.log.slice(0, 8).map((n) => (
            <li
              key={n.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-cream p-4"
            >
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] text-maroon">{n.title}</span>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]", DELIVERY_STATUS[n.status] ?? DELIVERY_STATUS.pending)}>
                    {n.channel} · {n.status}
                  </span>
                </span>
                {n.detail ? (
                  <span className="mt-1 block text-[11px] text-ink/50">{n.detail}</span>
                ) : null}
              </span>
              <span className="shrink-0 text-[11px] text-muted">
                {stampIn(n.createdAt, "Africa/Nairobi")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
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
  hideHeading,
}: {
  title: string;
  hint: string;
  onRun: () => Promise<void>;
  children: React.ReactNode;
  /** Set when an accordion header already names the block. */
  hideHeading?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <section
      className={cn(
        "rounded-2xl border border-ink/10 bg-white p-5",
        hideHeading && "border-transparent bg-transparent p-0",
      )}
    >
      {hideHeading ? null : (
        <>
          <h3 className="font-display text-lg text-maroon">{title}</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-ink/55">{hint}</p>
        </>
      )}
      <div className={cn("space-y-3", hideHeading ? "" : "mt-4")}>{children}</div>
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

/**
 * The two sheets a client pays from — typed once, here, read on the portal by
 * whoever they belong to: the local one for a client in the country, the
 * international one for a client abroad. The boxes prefill from what is
 * already saved so opening the accordion shows the studio's own words; a
 * cleared box takes that sheet down, and the portal panel with it.
 */
function HowToPayBlock({
  projectId,
  run,
  onChanged,
}: {
  projectId: string;
  run: (key: string, action: () => Promise<unknown>, done: string) => Promise<void>;
  onChanged: () => void;
}) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["payment-instructions", projectId],
    queryFn: () => getPaymentInstructions({ data: { projectId } }),
  });
  const [local, setLocal] = useState("");
  const [international, setInternational] = useState("");
  // Sync the boxes once per fetch: a background refetch landing mid-edit must
  // not overwrite what somebody is typing.
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    if (data && !synced) {
      setLocal(data.local);
      setInternational(data.international);
      setSynced(true);
    }
  }, [data, synced]);

  return (
    <WriteBlock
      title="How to pay"
      hint="Both halves live here; the portal shows each client the one that matches where they are. Clear a box to take that sheet down."
      onRun={() =>
        run(
          "write",
          async () => {
            await savePaymentInstructions({ data: { projectId, local, international } });
            void queryClient.invalidateQueries({ queryKey: ["payment-instructions", projectId] });
            onChanged();
          },
          "How to pay saved.",
        )
      }
    >
      <div>
        <Label htmlFor="st-pay-local">In the country</Label>
        <Textarea
          id="st-pay-local"
          className="min-h-24"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={"M-Pesa Paybill …, Account ATRO-….\nBank …, Branch …, Account …."}
        />
      </div>
      <div>
        <Label htmlFor="st-pay-intl">From abroad</Label>
        <Textarea
          id="st-pay-intl"
          className="min-h-24"
          value={international}
          onChange={(e) => setInternational(e.target.value)}
          placeholder={"SWIFT …, Bank …, Branch ….\nQuote the project reference on the transfer."}
        />
      </div>
    </WriteBlock>
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
  const queryClient = useQueryClient();

  // Same key the thread panel uses, so the hint and the panel are one fetch.
  // Reading this never marks anything read — that only happens when the panel
  // opens — so a closed accordion can still say "2 waiting".
  const { data: thread } = useQuery({
    queryKey: ["staff-messages", projectId],
    queryFn: () => readMessagesForStaff({ data: { projectId } }),
  });
  const waitingToReply = (thread ?? []).filter(
    (m) => m.authorRole === "client" && !m.readAt,
  ).length;

  // Presence requests waiting on an answer, for the accordion hint — same
  // shape as the thread above: ProjectDetail reads the shared cache key, so
  // the hint (and the auto-open it drives) works even while the panel is
  // unmounted inside a closed accordion. The panel's mutations invalidate this
  // key too, so the count follows every answer.
  const { data: presence } = useQuery({
    queryKey: ["staff-presence", projectId],
    queryFn: () => listPresenceForStaff({ data: { projectId } }),
  });
  const presenceOpen = (presence ?? []).filter(isOpen).length;

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

  const [pending, setPending] = useState("");

  async function run(key: string, action: () => Promise<unknown>, done: string) {
    setPending(key);
    try {
      await action();
      await refetch();
      /* The delivery log reads on its own key; a write that can append to it
         (a post, a certification, a vault drop) marks it stale too, else the
         console keeps showing the rows that existed a moment ago. */
      void queryClient.invalidateQueries({ queryKey: ["delivery-log", projectId] });
      onChanged();
      toast.success(done);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That did not save.");
    } finally {
      setPending("");
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
  // Decisions the client has not answered yet. (This was inverted before: it
  // counted the *decided* ones, so the "everything recorded" reassurance showed
  // up precisely when nothing had been recorded.)
  const stillOpen = data.decisions.filter((d) => d.state !== "decided").length;
  const uncertified = data.payments.filter((x) => x.status === "due" || x.status === "scheduled");

  return (
    <div className="space-y-6">
      <Accordion className="space-y-4">
        <AccordionItem title="Project info" defaultOpen>
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
        </AccordionItem>
        <AccordionItem
          title="Message thread"
          hint={waitingToReply ? `${waitingToReply} waiting` : undefined}
          defaultOpen={waitingToReply > 0}
        >
          <StudioMessagesPanel projectId={projectId} />
        </AccordionItem>
        <AccordionItem
          title="Site presence"
          hint={presenceOpen ? `${presenceOpen} waiting` : undefined}
          defaultOpen={presenceOpen > 0}
        >
          <PresencePanel projectId={projectId} onChanged={onChanged} />
        </AccordionItem>
        <AccordionItem title="Financial summary">
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
          <div className="mt-6">
            <HowToPayBlock projectId={projectId} run={run} onChanged={onChanged} />
          </div>
        </AccordionItem>
        <AccordionItem title="Milestone & evidence">
          <div className="grid gap-6 lg:grid-cols-2">
            <WriteBlock
              title="Update a milestone"
              hint="Set the stage status the client sees. Completing one opens the next automatically."
              hideHeading
              onRun={() =>
                run("write", async () => {
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
              hideHeading
              onRun={() =>
                run("write", async () => {
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
              title="Post a photograph"
              hint="The picture that proves the stage happened. It appears against the milestone in the client's Evidence tab."
              hideHeading
              onRun={async () => {}}
            >
              <EvidenceUploader
                projectId={projectId}
                milestones={data.milestones.map((m) => ({ id: m.id, order: m.order, name: m.name }))}
                onUploaded={() => void refetch()}
              />
            </WriteBlock>

            <WriteBlock
              title="Raise a decision"
              hint="Puts a choice to the client. One option per line. They record it in the decision log."
              hideHeading
              onRun={() =>
                run("write", async () => {
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
              hideHeading
              onRun={() =>
                run("write", async () => {
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
        </AccordionItem>
        <AccordionItem title="Approvals">
          <ApprovalsPanel projectId={projectId} onChanged={onChanged} />
        </AccordionItem>
        <AccordionItem title="Selections">
          <SelectionsPanel projectId={projectId} onChanged={onChanged} />
        </AccordionItem>
        <AccordionItem title="Variations">
          <VariationsPanel projectId={projectId} />
        </AccordionItem>
        <AccordionItem title="Defects & care">
          <AfterHandoverPanel projectId={projectId} />
        </AccordionItem>
        <AccordionItem title="Document vault">
          <WriteBlock
            title="Add to the document vault"
            hint="Contracts, approvals, drawings and certificates the client can see. They keep the record."
              hideHeading
            onRun={() =>
              run("vault", async () => {
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
                    setDocCategory(e.target.value as (typeof DOC_CATEGORIES)[number]["value"])}
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
                    setDocState(e.target.value as (typeof DOC_STATES)[number]["value"])}
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
        </AccordionItem>
        {uncertified.length > 0 ? (
          <AccordionItem title="Certify a payment" hint={`${uncertified.length}`}>
            <p className="text-[12px] text-ink/55">
              Only certified amounts appear as releasable in the client portal.
            </p>
            <ul className="mt-4 space-y-2">
              {uncertified.map((pay) => (
                <li
                  key={pay.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-4"
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
                        "inline",
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
          </AccordionItem>
        ) : null}
        <AccordionItem title="Statement of account">
          <p className="text-[12px] leading-relaxed text-ink/55">
            A record of where the money stands — not a demand. The client sees it in
            their documents.
          </p>
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() =>
              void run(
                "statement",
                () => issueStatementForProject({ data: { projectId } }),
                "Statement issued.",
              )
            }
            disabled={pending === "statement"}
          >
            Issue a statement
          </Button>
        </AccordionItem>
        <AccordionItem title="Retention">
          <p className="text-[12px] leading-relaxed text-ink/55">
            Held against defects. Releasing it records that the defects liability
            period has closed and pays the money out.
          </p>
          <Button
            className="mt-4 w-full"
            variant="outline"
            onClick={() =>
              void run("retention", () => releaseRetention({ data: { projectId } }),
                "Retention released.")
            }
            disabled={pending === "retention"}
          >
            Release retention
          </Button>
        </AccordionItem>
        <AccordionItem title="What the client has decided" hint={`${data.decisions.length}`}>
          {data.decisions.length === 0 ? (
            <p className="text-[13px] text-ink/55">No decisions on this project yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.decisions.map((d) => (
                <li key={d.id} className="rounded-xl border border-ink/10 bg-white p-4">
                  <p className="text-[14px] text-maroon">{d.title}</p>
                  <p className="mt-1 text-[12px] text-ink/55">
                    {d.state === "decided" ? `Chose: ${d.chosen}` : "Awaiting the client"} ·{" "}
                    {d.date}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {data.decisions.length > 0 && stillOpen === 0 ? (
            <p className="mt-4 text-[12px] text-muted">
              Every decision on this project has been recorded.
            </p>
          ) : null}
        </AccordionItem>
      </Accordion>

      <DeliveryLog projectId={projectId} onChanged={onChanged} />
      <IssuedDocuments projectId={projectId} onChanged={onChanged} />
    </div>
  );
}

/* ── overview: the numbers a studio runs on ── */

function GroupBars({ rows, empty }: { rows: GroupRow[]; empty: string }) {
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
  stalled: { label: "Gone quiet", cls: "bg-stone/100 text-stone-700 border-stone-300" },
  unviewed: { label: "Client not looking", cls: "bg-sky-50 text-sky-900 border-sky-300" },
};

type SortKey = "newest" | "attention" | "largest";

function ProjectsTable({
  projects,
  onOpen,
}: {
  projects: StaffProjectSummary[];
  onOpen: (id: string) => void;
}) {
  const [sort, setSort] = useState<SortKey>("attention");

  const sorted = [...projects].sort((a, b) => {
    if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
    if (sort === "largest") return b.contractValue - a.contractValue;
    const score = (p: StaffProjectSummary) =>
      (p.blockedStages > 0 ? 1000 : 0) +
      (p.openDecisions > 0 ? 500 : 0) +
      (p.onTrack ? 0 : 250);
    return score(b) - score(a);
  });

  const select = (
    <label className="flex items-center gap-2 text-[12px] text-muted">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as SortKey)}
        className="h-9 rounded-lg border border-ink/10 bg-white px-2.5 text-[12px] text-maroon outline-none focus:border-gold"
      >
        <option value="attention">Needs attention</option>
        <option value="newest">Newest</option>
        <option value="largest">Largest contract</option>
      </select>
    </label>
  );

  return (
    <Panel
      title="Projects"
      subtitle={`${projects.length} in the studio`}
      actions={select}
      className="min-w-0"
      bodyClassName="p-0"
    >
      {projects.length === 0 ? (
        <p className="p-6 text-center text-[13px] text-ink/55">
          Projects appear as soon as a client opens one in their portal.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink/8 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                <th scope="col" className="px-5 py-3 font-bold">Project</th>
                <th scope="col" className="px-3 py-3 font-bold">Client</th>
                <th scope="col" className="px-3 py-3 font-bold">Stage</th>
                <th scope="col" className="px-3 py-3 font-bold">Progress</th>
                <th scope="col" className="px-3 py-3 font-bold">Paid</th>
                <th scope="col" className="px-5 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onOpen(p.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpen(p.id);
                    }
                  }}
                  className="cursor-pointer border-b border-ink/6 transition-colors last:border-0 hover:bg-cream focus:bg-cream focus:outline-none"
                >
                  <td className="px-5 py-3">
                    <span className="block text-[13px] font-medium text-maroon">{p.title}</span>
                    <span className="font-mono text-[11px] text-muted">{p.reference}</span>
                  </td>
                  <td className="px-3 py-3 text-[13px] text-ink/70">
                    {p.clientLabel || "—"}
                    {p.clientCity ? (
                      <span className="block text-[11px] text-muted">{p.clientCity}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-[13px] text-ink/70">{p.stage || "—"}</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-ink/10">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                          style={{ width: `${p.progress}%` }}
                        />
                      </span>
                      <span className="text-[12px] text-ink/60">{p.progress}%</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[13px] text-ink/70">
                    {kes(p.paidToDate)}
                    <span className="block whitespace-nowrap text-[11px] text-muted">
                      of {kes(p.contractValue)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]",
                        p.blockedStages > 0
                          ? "border-red-200 bg-red-50 text-red-800"
                          : p.openDecisions > 0
                            ? "border-amber-300 bg-amber-50 text-amber-900"
                            : p.onTrack
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-stone-300 bg-stone/100 text-stone-700",
                      )}
                    >
                      {p.blockedStages > 0
                        ? "Blocked"
                        : p.openDecisions > 0
                          ? "Awaiting client"
                          : p.onTrack
                            ? "On track"
                            : "Watch"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function Overview({
  projects,
  onOpen,
  search,
}: {
  projects: StaffProjectSummary[];
  onOpen: (id: string) => void;
  search: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["ops-overview"],
    queryFn: () => getOpsOverview({ data: undefined }),
  });

  // Opening the console is the trigger for the attention sweep. It is idempotent
  // by dedupe key, so opening the console a hundred times sends nothing extra.
  const swept = useRef(false);
  useEffect(() => {
    if (swept.current) return;
    swept.current = true;
    void runAttentionSweepNow({ data: undefined }).catch(() => undefined);
  }, []);

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-ink/10 bg-white" />
        ))}
      </div>
    );
  }

  const { funnel, money } = data;
  const exposure = money.certifiedUnreleased + money.retentionHeld;
  const collectionRate =
    money.contractValue > 0 ? (money.paid / money.contractValue) * 100 : 0;
  const months = data.byMonth;

  const moneySlices: Slice[] = [
    { name: "Collected", value: money.paid, color: "var(--color-maroon)" },
    {
      name: "Certified, awaiting release",
      value: money.certifiedUnreleased,
      color: "var(--color-gold)",
    },
    { name: "Retention held", value: money.retentionHeld, color: "var(--color-burgundy)" },
    {
      name: "Not yet due",
      value: Math.max(
        0,
        money.contractValue - money.paid - money.certifiedUnreleased - money.retentionHeld,
      ),
      color: "rgba(60,5,8,0.10)",
    },
  ];
  const moneyTotal = moneySlices.reduce((sum, d) => sum + d.value, 0);

  const trackBars = data.byTrack.slice(0, 6).map((r) => ({
    label: r.label,
    contracted: r.value,
    collected: r.paid,
  }));

  const q = search.trim().toLowerCase();
  const visible = q
    ? projects.filter((p) =>
        [p.title, p.reference, p.clientLabel, p.clientCity, p.stage]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : projects;

  return (
    <div className="space-y-5">
      {/* headline numbers */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Contracted"
          value={kesShort(money.contractValue)}
          exact={kes(money.contractValue)}
          sub={`${funnel.projectsLive} live · ${funnel.projectsSample} sample`}
          icon={Banknote}
          trend={{ data: months.map((m) => m.received) }}
        />
        <StatCard
          label="Collected"
          value={kesShort(money.paid)}
          exact={kes(money.paid)}
          sub={`${collectionRate.toFixed(0)}% of contracted value`}
          icon={CheckCircle2}
          tone="good"
          trend={{ data: months.map((m) => m.received) }}
        />
        <StatCard
          label="Committed, not in"
          value={kesShort(exposure)}
          exact={kes(exposure)}
          sub={
            money.contractValue > 0
              ? `${((exposure / money.contractValue) * 100).toFixed(1)}% of contracted value`
              : "Nothing contracted yet"
          }
          icon={Hourglass}
          tone="warn"
        />
        <StatCard
          label="Enquiries"
          value={String(funnel.enquiriesTotal)}
          sub={`${funnel.enquiriesLast7Days} in the last 7 days · ${funnel.enquiriesDiaspora} diaspora`}
          icon={Inbox}
          trend={{ data: months.map((m) => m.enquiries) }}
        />
      </div>

      {/* money */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Where the money sits" subtitle="Collected, certified and held">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center">
            <Donut
              data={moneySlices}
              centerValue={kesShort(moneyTotal)}
              centerLabel="contracted"
              formatValue={kes}
            />
            <ul className="space-y-2.5">
              {moneySlices.map((slice) => (
                <li key={slice.name} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: slice.color }}
                      aria-hidden
                    />
                    <span className="truncate text-ink/70">{slice.name}</span>
                  </span>
                  <span className="shrink-0 text-ink/60">
                    {moneyTotal > 0 ? ((slice.value / moneyTotal) * 100).toFixed(1) : "0.0"}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel
          title="Contracted against collected"
          subtitle="By kind of work"
          actions={<span className="text-[11px] text-muted">{data.byTrack.length} tracks</span>}
        >
          <GroupedBars
            data={trackBars}
            series={[
              { key: "contracted", label: "Contracted", color: "var(--color-gold)" },
              { key: "collected", label: "Collected", color: "var(--color-maroon)" },
            ]}
            formatValue={kes}
          />
        </Panel>
      </div>

      {/* pipeline */}
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Enquiries" subtitle="Last six months">
          <MonthlyColumns data={months.map((m) => ({ label: m.label, enquiries: m.enquiries }))} />
        </Panel>

        <Panel title="Workload by county" subtitle="Projects and contracted value">
          <GroupBars rows={data.byZone} empty="No zones recorded yet." />
        </Panel>
      </div>

      {/* the work itself */}
      <div className="grid min-w-0 gap-5 xl:grid-cols-[1.35fr_1fr]">
        <ProjectsTable projects={visible} onOpen={onOpen} />

        <Panel
          title="Needs a human"
          subtitle={data.attention.length > 0 ? "Sorted by how long it has waited" : "Nothing stuck"}
        >
          {data.attention.length === 0 ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] leading-relaxed text-emerald-900">
              Nothing is stuck, nothing is waiting on a client, and everyone has looked at
              their project recently.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.attention.slice(0, 8).map((item, i) => (
                <li key={`${item.projectId}-${item.kind}-${i}`}>
                  <button
                    type="button"
                    onClick={() => onOpen(item.projectId)}
                    className="flex w-full items-start justify-between gap-3 rounded-xl border border-ink/10 p-3 text-left transition-colors hover:border-burgundy hover:bg-cream"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] text-maroon">{item.title}</span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                            ATTENTION_COPY[item.kind]?.cls,
                          )}
                        >
                          {ATTENTION_COPY[item.kind]?.label ?? item.kind}
                        </span>
                      </span>
                      <span className="mt-1 block text-[12px] leading-snug text-ink/55">
                        {item.detail}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-muted">
                      {item.ageDays === 0 ? "today" : `${item.ageDays}d`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function IssuedDocuments({
  projectId,
  onChanged,
}: {
  projectId: string;
  onChanged: () => void;
}) {
  const { data } = useQuery({
    queryKey: ["project-documents", projectId],
    queryFn: () => listProjectDocuments({ data: { projectId } }),
  });
  const [voiding, setVoiding] = useState<string | null>(null);

  if (!data || data.length === 0) return null;

  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-6">
      <h3 className="font-display text-lg text-maroon">Documents issued</h3>
      <ul className="mt-4 space-y-2">
        {data.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-cream p-4"
          >
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] text-maroon">{KIND_LABEL[doc.kind]}</span>
                <span className="font-mono text-[11px] text-muted">{doc.number}</span>
                {doc.status === "void" ? (
                  <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-red-800">
                    Void
                  </span>
                ) : null}
              </span>
              {doc.voidedReason ? (
                <span className="mt-1 block text-[11px] text-ink/50">{doc.voidedReason}</span>
              ) : null}
            </span>
            <span className="flex items-center gap-3">
              <span className="text-[13px] text-maroon">{kes(doc.total)}</span>
              {doc.status === "issued" ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={voiding === doc.id}
                  onClick={() => {
                    setVoiding(doc.id);
                    void voidDocument({
                      data: { id: doc.id, reason: "Voided from the studio console" },
                    })
                      .then(() => {
                        toast.success(`${doc.number} voided. Issue a corrected one.`);
                        onChanged();
                      })
                      .catch((e: unknown) =>
                        toast.error(e instanceof Error ? e.message : "Could not void."),
                      )
                      .finally(() => setVoiding(null));
                  }}
                >
                  Void
                </Button>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── access: how a real person becomes staff ── */

/**
 * The request form for a signed-in account that is not on the allowlist.
 *
 * This used to live inside AccessPanel, behind the tab strip — which made it
 * unreachable, because non-staff never got past the console gate. Asking for
 * access is the one thing a non-staff person can actually do here, so it gets
 * its own screen.
 */
function RequestAccessCard() {
  const { data: me } = useQuery({
    queryKey: ["my-access"],
    queryFn: () => getMyAccess({ data: undefined }),
  });
  const [askNote, setAskNote] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center bg-stone/30 px-4 py-24">
      <div className="w-full max-w-xl rounded-3xl border border-line/50 bg-paper p-8 shadow-card">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-maroon/10 text-maroon">
          <Lock className="size-6" />
        </span>
        <h1 className="mt-6 font-display text-2xl text-maroon">Request studio access</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink/65">
          You are signed in as <strong>{me?.email ?? "this account"}</strong>, which is not
          on the studio access list. Ask below and an existing admin approves it — usually the
          same day.
        </p>
        {me?.requested ? (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
            Your request is with the studio. You will see the console once it is approved.
          </p>
        ) : null}
        <textarea
          value={askNote}
          onChange={(e) => setAskNote(e.target.value)}
          placeholder="Who you are and what you need"
          className="mt-4 h-24 w-full rounded-xl border border-line bg-cream p-3 text-sm"
        />
        <Button
          className="mt-4"
          disabled={busy || me?.requested}
          onClick={() => {
            setBusy(true);
            void requestStaffAccess({ data: { note: askNote } })
              .then(() => toast.success("Request sent to the studio."))
              .catch((e: unknown) =>
                toast.error(e instanceof Error ? e.message : "Could not send."),
              )
              .finally(() => setBusy(false));
          }}
        >
          Request access
        </Button>
        <Link
          to="/portal"
          className="mt-6 inline-block text-[13px] text-burgundy underline decoration-gold decoration-2 underline-offset-4"
        >
          Client portal instead
        </Link>
      </div>
    </main>
  );
}

function AccessPanel({ isAdmin }: { isAdmin: boolean }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["staff-list"],
    queryFn: () => listStaff({ data: undefined }),
  });

  const members = data?.members ?? [];
  const requests = data?.requests ?? [];

  return (
    <Accordion>
      <AccordionItem title="Who can open the console" hint={`${members.length}`} defaultOpen>
        <p className="text-[12px] leading-relaxed text-ink/55">
          Access is an allowlist keyed on the address a person signs in with. You cannot
          grant it to yourself.
        </p>

        <ul className="mt-4 space-y-2">
          {members.map((m) => (
            <li
              key={m.email}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-4"
            >
              <span className="min-w-0">
                <span className="block text-[13px] text-maroon">{m.email}</span>
                <span className="text-[11px] text-ink/50">
                  {m.role} · since {m.since}
                  {m.note ? ` · ${m.note}` : ""}
                </span>
              </span>
              {isAdmin ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    void revokeStaff({ data: { email: m.email } })
                      .then(() => {
                        toast.success(`${m.email} removed.`);
                        void refetch();
                      })
                      .catch((e: unknown) =>
                        toast.error(e instanceof Error ? e.message : "Could not remove."),
                      )
                  }
                >
                  Remove
                </Button>
              ) : null}
            </li>
          ))}
        </ul>

        {isAdmin ? (
          <div className="mt-5 grid gap-3 border-t border-ink/10 pt-5 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label htmlFor="st-email">Their address</Label>
              <Input
                id="st-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@atro.ke"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="st-role">Role</Label>
              <Select
                id="st-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "staff" | "admin")}
                className="mt-1"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="st-note">What they do</Label>
              <Input
                id="st-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Quantity surveying"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  void grantStaff({ data: { email, role, note } })
                    .then(() => {
                      toast.success(`${email} can now open the console.`);
                      setEmail("");
                      setNote("");
                      void refetch();
                    })
                    .catch((e: unknown) =>
                      toast.error(e instanceof Error ? e.message : "Could not grant."),
                    )
                    .finally(() => setBusy(false));
                }}
              >
                Grant access
              </Button>
            </div>
          </div>
        ) : null}
      </AccordionItem>

      {requests.length > 0 ? (
        <AccordionItem
          title="Waiting to be let in"
          hint={`${requests.length}`}
          defaultOpen
          className="border-gold/40 bg-gold/5"
        >
          <ul className="space-y-2">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-4"
              >
                <span className="min-w-0">
                  <span className="block text-[13px] text-maroon">
                    {r.name || "—"} · {r.email}
                  </span>
                  {r.note ? (
                    <span className="mt-1 block text-[12px] text-ink/60">{r.note}</span>
                  ) : null}
                  <span className="text-[11px] text-muted">
                    asked {new Date(r.createdAt).toLocaleDateString("en-KE")}
                  </span>
                </span>
                {isAdmin ? (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setBusy(true);
                      void grantStaff({ data: { email: r.email, role: "staff", note: "Approved from request" } })
                        .then(() => {
                          toast.success(`${r.email} approved.`);
                          void refetch();
                        })
                        .catch((e: unknown) =>
                          toast.error(e instanceof Error ? e.message : "Could not approve."),
                        )
                        .finally(() => setBusy(false));
                    }}
                  >
                    Approve
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </AccordionItem>
      ) : null}
    </Accordion>
  );
}

/* ── console ── */

const TABS = [
  { id: "overview", label: "Overview", title: "Studio overview", body: "Every project, one page" },
  { id: "projects", label: "Projects", title: "Projects", body: "Everything the studio is running" },
  { id: "enquiries", label: "Enquiries", title: "Enquiries", body: "People who asked us to build" },
  { id: "access", label: "Access", title: "Access", body: "Who can open the console" },
] as const;

function AdminConsole() {
  const hydrated = useIsHydrated();
  const [roleState, setRoleState] = useState<{
    role: string | null;
    userId: string | null;
    email: string | null;
  } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "attention" | "sample">("all");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let live = true;
    getMyStaffRole({ data: undefined })
      .then((r) => live && setRoleState(r))
      .catch(() => live && setRoleState({ role: null, userId: null, email: null }));
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

  const { data: overview } = useQuery({
    queryKey: ["ops-overview"],
    queryFn: () => getOpsOverview({ data: undefined }),
    enabled: isStaff && tab === "overview",
  });

  if (!hydrated || roleState === null) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center" aria-busy>
        <Loader2 className="size-6 animate-spin text-gold" />
      </main>
    );
  }

  // Signed out: ask them to sign in. Signed in but not on the allowlist: let
  // them ask for access, which is otherwise a one-way door.
  if (!isStaff) return roleState.email ? <RequestAccessCard /> : <StaffWall />;

  const all = projects ?? [];
  const q = search.trim().toLowerCase();
  const matches = (p: StaffProjectSummary) =>
    !q ||
    [p.title, p.reference, p.clientLabel, p.clientCity, p.stage]
      .join(" ")
      .toLowerCase()
      .includes(q);

  const rows = all.filter((p) => {
    if (filter === "attention" && !(p.blockedStages > 0 || p.openDecisions > 0 || !p.onTrack)) {
      return false;
    }
    if (filter === "sample" && p.source !== "sample") return false;
    return matches(p);
  });

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];
  const openProject = (id: string) => {
    setSelected(id);
    setTab("projects");
  };

  return (
    <DashboardShell
      groups={[
        {
          title: "Studio",
          items: [
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            {
              id: "projects",
              label: "Projects",
              icon: FolderKanban,
              badge: all.length || undefined,
            },
            {
              id: "enquiries",
              label: "Enquiries",
              icon: Inbox,
              badge: overview?.funnel.enquiriesNew || undefined,
            },
          ],
        },
        {
          title: "Administration",
          items: [{ id: "access", label: "Access", icon: Users }],
        },
      ]}
      active={tab}
      onSelect={(id) => {
        setTab(id as (typeof TABS)[number]["id"]);
        setSelected(null);
      }}
      alerts={(overview?.attention ?? []).slice(0, 8).map((item, i) => ({
        id: `${item.projectId}-${item.kind}-${i}`,
        title: item.title,
        detail: item.detail,
        onSelect: () => openProject(item.projectId),
      }))}
      user={{
        name: roleState?.email ?? "Studio",
        role: roleState?.role ?? undefined,
        email: roleState?.email ?? undefined,
      }}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search projects, clients, references"
      toolbar={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-lg leading-tight text-maroon">
              {activeTab.title}
            </h1>
            <p className="text-[12px] text-muted">{activeTab.body}</p>
          </div>

          {tab === "projects" && !selected ? (
            <div className="flex flex-wrap items-center gap-2">
              {([
                ["all", "All"],
                ["attention", "Needs attention"],
                ["sample", "Sample"],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-colors",
                    filter === id
                      ? "border-maroon bg-maroon text-paper"
                      : "border-ink/12 text-ink/55 hover:border-burgundy hover:text-burgundy",
                  )}
                >
                  {label}
                </button>
              ))}
              <Button size="sm" variant="ghost" onClick={() => void refetch()} disabled={isLoading}>
                Refresh
              </Button>
            </div>
          ) : null}
        </div>
      }
    >
      {tab === "overview" ? (
        <Overview projects={all} onOpen={openProject} search={search} />
      ) : null}

      {tab === "enquiries" ? <EnquiriesInbox /> : null}

      {tab === "access" ? (
        <AccessPanel isAdmin={roleState?.role === "admin"} />
      ) : null}

      {tab === "projects" && selected ? (
        <ProjectDetail
          projectId={selected}
          onBack={() => setSelected(null)}
          onChanged={() => void refetch()}
        />
      ) : tab === "projects" && isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : tab === "projects" && rows.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/15 py-16 text-center">
          <Inbox className="size-7 text-ink/30" />
          <p className="mt-4 font-display text-xl text-maroon">
            {q ? "Nothing matches that search" : "Nothing here yet"}
          </p>
          <p className="mt-2 max-w-md text-[13px] text-ink/55">
            {q
              ? `No project, client or reference contains “${search.trim()}”.`
              : "Projects appear as soon as a client opens one in their portal, or you create one for them."}
          </p>
        </div>
      ) : tab === "projects" ? (
        <ProjectsTable projects={rows} onOpen={setSelected} />
      ) : null}
    </DashboardShell>
  );
}
