import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  Hourglass,
  Inbox,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Search,
  Users,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { DashboardShell } from "@/components/dashboard/shell";
import { Donut, GroupedBars, MonthlyColumns, type Slice } from "@/components/dashboard/charts";
import { EnquiriesInbox, type EnquiryFilterStatus } from "@/components/admin/enquiries-inbox";
import { QuotationComposer } from "@/components/admin/quotation-composer";
import { DocumentFlowGuide } from "@/components/documents/document-flow-guide";
import { MyWorkPanel } from "@/components/admin/my-work";
import { StaffProfilePanel } from "@/components/admin/staff-profile-panel";
import { CoordinationCalendar } from "@/components/admin/coordination-calendar";
import { ProjectWorkflowChecklist } from "@/components/admin/project-workflow-checklist";
import { SelectionsPanel } from "@/components/admin/selections-panel";
import { ApprovalsPanel } from "@/components/admin/approvals-panel";
import { EvidenceUploader } from "@/components/admin/evidence-uploader";
import { StudioMessagesPanel } from "@/components/admin/messages-panel";
import { CommunicationsInbox } from "@/components/admin/communications-inbox";
import { ProjectExpensesPanel } from "@/components/admin/project-expenses-panel";
import { needsStudioReply } from "@/lib/messages";
import { AfterHandoverPanel } from "@/components/admin/after-handover-panel";
import { VariationsPanel } from "@/components/admin/variations-panel";
import { PresencePanel } from "@/components/admin/presence-panel";
import { listStaffMessageThreads, readMessagesForStaff } from "@/lib/messages-server";
import { listPresenceForStaff } from "@/lib/presence-server";
import { isOpen } from "@/lib/presence";
import { getOpsOverview, getStaffToday, type GroupRow, type StaffTodayOverview } from "@/lib/ops";
import {
  getMyAccess,
  acceptMyInvite,
  grantStaff,
  inviteStaff,
  listStaff,
  requestStaffAccess,
  revokeInvite,
  revokeStaff,
} from "@/lib/staff-access";
import { issueStatementForProject, releaseRetention } from "@/lib/staff-ops";
import { listProjectDocuments, voidDocument } from "@/lib/invoice-server";
import { KIND_LABEL } from "@/lib/invoices";
import { usesMeasuredWorkCertification } from "@/lib/diaspora/tracks";
import { runAttentionSweepNow } from "@/lib/attention";
import {
  addDocument,
  addMilestoneEvidence,
  certifyPayment,
  changeProjectLifecycle,
  getDeliveryLog,
  getMyStaffProfile,
  getMyStaffRole,
  getStaffClientProfile,
  getStaffProject,
  listStaffProjects,
  listProjectLifecycleHistory,
  postUpdate,
  raiseDecision,
  releaseHeldDeliveries,
  retryDeliveries,
  updateMilestone,
  type StaffProjectSummary,
} from "@/lib/staff-ops";
import type { ActivityItem } from "@/lib/diaspora/server";
import { getPaymentInstructions, savePaymentInstructions } from "@/lib/how-to-pay-server";
import { stampIn } from "@/lib/tz";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { cn } from "@/lib/utils";
import type { StaffRole } from "@/lib/staff";
import { canScheduleProjectCalls } from "@/lib/privileges";
import {
  nextProjectLifecycleState,
  portfolioLifecycleLabel,
  PROJECT_LIFECYCLE_LABEL,
} from "@/lib/project-lifecycle";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { resolveDashboardRoute } from "@/lib/dashboard-routing";

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
        <h1 className="mt-6 font-display text-[1.75rem] leading-none text-maroon">Office dashboard</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This is the ATRO office view. Sign in with the account ATRO has listed, or ask the team to
          add your address.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link to="/login">Sign in</Link>
        </Button>
        <Link
          to="/portal"
          className="mt-4 inline-block text-[13px] text-burgundy underline decoration-gold decoration-2 underline-offset-4"
        >
          Project portal instead
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
  const heldCount = (data?.log ?? []).filter(
    (n) => n.status === "pending" && n.deliverAfter,
  ).length;
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
          <h3 className="font-display text-lg text-maroon">Delivery log</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
            Every post records what it tried to send and who it was for — the client, or the
            studio's own contacts. A channel with no credentials is marked skipped rather than
            quietly dropped, and one aimed at a client whose zone is asleep waits for their morning
            instead of their three a.m.
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
                      r.sent === 1
                        ? "1 held row sent on its way."
                        : `${r.sent} held rows sent on their way.`,
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
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]",
                      DELIVERY_STATUS[n.status] ?? DELIVERY_STATUS.pending,
                    )}
                  >
                    {n.audience === "studio" ? "studio" : "client"} · {n.channel} · {n.status}
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
  clientType,
  isAdmin,
  onBack,
  onChanged,
  onOpenMessages,
}: {
  projectId: string;
  /** From the list row that opened this project — the profile's own flag. */
  clientType?: string;
  /**
   * Whether the signed-in staff account may move money. The console hides the
   * buttons it cannot press — certify, statement, retention, void, retainer —
   * so a staff account sees the record but never a write the server would
   * refuse.
   */
  isAdmin: boolean;
  onBack: () => void;
  onChanged: () => void;
  onOpenMessages: () => void;
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
  const { data: lifecycleHistory = [] } = useQuery({
    queryKey: ["project-lifecycle-history", projectId],
    queryFn: () => listProjectLifecycleHistory({ data: { projectId } }),
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
  const [readyToApprove, setReadyToApprove] = useState(false);
  const [evidenceCaption, setEvidenceCaption] = useState("");
  const [evidenceDetail, setEvidenceDetail] = useState("");
  const [decisionTitle, setDecisionTitle] = useState("");
  const [decisionDueDate, setDecisionDueDate] = useState("");
  const [decisionOptions, setDecisionOptions] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] =
    useState<(typeof DOC_CATEGORIES)[number]["value"]>("Contract");
  const [docRef, setDocRef] = useState("");
  const [docState, setDocState] = useState<(typeof DOC_STATES)[number]["value"]>("awaiting");
  const [lifecycleReason, setLifecycleReason] = useState("");
  const [lifecycleReview, setLifecycleReview] = useState(false);
  const [sectionRequest, setSectionRequest] = useState({ target: "", nonce: 0 });

  const [pending, setPending] = useState("");

  async function run(key: string, action: () => Promise<unknown>, done: string) {
    setPending(key);
    try {
      await action();
      await refetch();
      /* The delivery log and the issued documents read on their own keys; a
         write that can append to either (a post, a certification, a statement)
         marks them stale too, else the console keeps showing the rows that
         existed a moment ago. */
      void queryClient.invalidateQueries({ queryKey: ["delivery-log", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["project-documents", projectId] });
      if (key === "lifecycle") {
        void queryClient.invalidateQueries({ queryKey: ["project-lifecycle-history", projectId] });
      }
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
  const measuredWork = usesMeasuredWorkCertification(p.track);
  const defectPeriodEndIsFuture =
    Boolean(p.defectPeriodEnd) && p.defectPeriodEnd > new Date().toISOString().slice(0, 10);
  const allTrackedMilestonesComplete =
    data.milestones.length > 0 &&
    data.milestones.every((milestone) => milestone.status === "complete");
  const nextLifecycle = nextProjectLifecycleState(p.lifecycleState);
  const lifecycleNeedsAdmin = nextLifecycle === "closed" || nextLifecycle === "archived";
  const canChangeLifecycle = !p.isSample && !!nextLifecycle && (!lifecycleNeedsAdmin || isAdmin);
  // Decisions the client has not answered yet. (This was inverted before: it
  // counted the *decided* ones, so the "everything recorded" reassurance showed
  // up precisely when nothing had been recorded.)
  const stillOpen = data.decisions.filter((d) => d.state !== "decided").length;
  const uncertified = data.payments.filter((x) => x.status === "due" || x.status === "scheduled");
  const blockedMilestones = data.milestones.filter((m) => m.status === "blocked").length;
  const readyForClient = data.milestones.filter((m) => m.approvalReady).length;
  const firstBlockedMilestone = data.milestones.find((m) => m.status === "blocked");
  const certifiedPayments = data.payments.filter((payment) => payment.status === "certified");
  const certifiedTotal = certifiedPayments.reduce((total, payment) => total + payment.amount, 0);
  const ownerActions: {
    label: string;
    detail: string;
    count: number;
    section: string;
    milestoneId?: string;
  }[] = [
    ...(blockedMilestones > 0
      ? [
          {
            label: "Blocked work",
            detail: `${blockedMilestones} milestone${blockedMilestones === 1 ? "" : "s"} marked blocked`,
            count: blockedMilestones,
            section: "milestone-evidence",
            milestoneId: firstBlockedMilestone?.id,
          },
        ]
      : []),
    ...(stillOpen > 0
      ? [
          {
            label: "Client decisions",
            detail: `${stillOpen} decision${stillOpen === 1 ? "" : "s"} not yet recorded`,
            count: stillOpen,
            section: "client-decisions",
          },
        ]
      : []),
    ...(certifiedPayments.length > 0
      ? [
          {
            label: measuredWork ? "Certified payments" : "Approved payment stages",
            detail: `${kes(certifiedTotal)} awaiting payment`,
            count: certifiedPayments.length,
            section: "financial-summary",
          },
        ]
      : []),
    ...(waitingToReply > 0
      ? [
          {
            label: "Client messages",
            detail: `${waitingToReply} message${waitingToReply === 1 ? "" : "s"} waiting for a reply`,
            count: waitingToReply,
            section: "message-thread",
          },
        ]
      : []),
    ...(presenceOpen > 0
      ? [
          {
            label: "Site visit requests",
            detail: `${presenceOpen} request${presenceOpen === 1 ? "" : "s"} awaiting a response`,
            count: presenceOpen,
            section: "site-presence",
          },
        ]
      : []),
    ...(readyForClient > 0
      ? [
          {
            label: "Milestones ready for sign-off",
            detail: `${readyForClient} milestone${readyForClient === 1 ? "" : "s"} marked ready for the client`,
            count: readyForClient,
            section: "approvals",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {isAdmin ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="size-4" />
                All projects
              </Button>
              <h2 className="mt-3 font-display text-[1.6rem] leading-none text-maroon">{p.title}</h2>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink/55">
                <span className="font-mono">{p.reference}</span>
                <span>{p.clientLabel}</span>
                {p.clientCity ? <span>{p.clientCity}</span> : null}
                {clientType === "diaspora" ? (
                  <Badge tone="gold" className="h-5 text-[9px]">
                    From abroad
                  </Badge>
                ) : null}
                <span>
                  {p.startedLabel} → {p.targetLabel}
                </span>
                {p.isSample ? (
                  <Badge tone="gold" className="h-5 text-[9px]">
                    Sample
                  </Badge>
                ) : null}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-4">
              {!p.isSample ? (
                <Button size="sm" variant="outline" onClick={onOpenMessages}>
                  <MessageSquare className="size-4" />
                  Open conversation
                </Button>
              ) : null}
              <div className="text-right">
                <p className="font-display text-[1.8rem] leading-none text-maroon">{p.progress}%</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{p.stage}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Build progress"
              value={`${p.progress}%`}
              sub={`${data.milestones.filter((m) => m.status === "complete").length} of ${data.milestones.length} tracked milestones complete`}
              icon={CheckCircle2}
              tone={p.progress >= 100 ? "good" : "default"}
            />
            <StatCard
              label="Programme"
              value={p.schedule.onTrack ? "On track" : "Needs review"}
              sub={
                p.schedule.note ||
                (p.schedule.varianceDays !== 0
                  ? `Recorded variance: ${Math.abs(p.schedule.varianceDays)} days`
                  : p.schedule.daysRemaining > 0
                    ? `${p.schedule.daysRemaining} days remaining`
                    : "Based on the programme status recorded for this project")
              }
              icon={CalendarClock}
              tone={p.schedule.onTrack ? "good" : "warn"}
            />
            <StatCard
              label="Contract value"
              value={kesShort(p.contractValue)}
              exact={kes(p.contractValue)}
              sub={`${kes(p.budget.paidToDate)} paid to date`}
              icon={Banknote}
            />
            <StatCard
              label={measuredWork ? "Certified, awaiting payment" : "Stages approved, awaiting payment"}
              value={kesShort(p.budget.currentlyCertified)}
              exact={kes(p.budget.currentlyCertified)}
              sub={`${kes(p.budget.retentionHeld)} held in retention`}
              icon={Hourglass}
              tone={p.budget.currentlyCertified > 0 ? "warn" : "default"}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <Panel
              title="Needs your attention"
              subtitle="Open items from the project record — not a substitute for a site inspection."
            >
              {ownerActions.length === 0 ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] leading-relaxed text-emerald-900">
                  No tracked decisions, blocked milestones, payment stages, messages, visit
                  requests, or client sign-offs are waiting.
                </p>
              ) : (
                <ul className="space-y-2">
                  {ownerActions.map((action) => (
                    <li key={action.label}>
                      <button
                        type="button"
                        aria-label={`Review ${action.label}: ${action.detail}`}
                        onClick={() => {
                          if (action.milestoneId) setMilestoneId(action.milestoneId);
                          setSectionRequest((current) => ({
                            target: action.section,
                            nonce: current.nonce + 1,
                          }));
                        }}
                        className="flex w-full items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-left transition-colors hover:border-amber-400 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon focus-visible:ring-offset-2"
                      >
                        <AlertTriangle
                          className="mt-0.5 size-4 shrink-0 text-amber-800"
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium text-maroon">
                            {action.label}
                          </span>
                          <span className="mt-0.5 block text-[12px] text-ink/60">
                            {action.detail}
                          </span>
                          <span className="mt-1 block text-[11px] font-medium text-burgundy">
                            Review this item
                          </span>
                        </span>
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[12px] text-amber-900">
                          {action.count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Financial position"
              subtitle="Current recorded totals; open Financial summary below for the ledger and payment instructions."
            >
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  ["Contract", kes(p.contractValue)],
                  ["Paid", kes(p.budget.paidToDate)],
                  [
                    measuredWork ? "Work certified to date" : "Stages approved to date",
                    kes(p.budget.certifiedToDate),
                  ],
                  [
                    measuredWork ? "Certified, awaiting payment" : "Approved stages awaiting payment",
                    kes(p.budget.currentlyCertified),
                  ],
                  [`Retention · ${p.budget.retentionPct}%`, kes(p.budget.retentionHeld)],
                  ["Projected at completion", kes(p.budget.projectedAtCompletion)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-ink/8 bg-cream/50 p-3">
                    <dt className="text-[11px] text-muted">{label}</dt>
                    <dd className="mt-1 text-[13px] font-medium text-maroon">{value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>

          {data.activity.length > 0 ? (
            <Panel title="Latest project activity" subtitle="Most recent recorded updates">
              <ol className="space-y-3">
                {data.activity.slice(0, 3).map((item) => {
                  const at = item.at ? new Date(item.at) : null;
                  return (
                    <li key={item.id} className="flex gap-3 border-l-2 border-gold/60 pl-3">
                      <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-[13px] text-maroon">{item.title}</p>
                        {item.body ? (
                          <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-ink/55">
                            {item.body}
                          </p>
                        ) : null}
                        {at && !Number.isNaN(at.getTime()) ? (
                          <time className="mt-1 block text-[10px] text-muted" dateTime={item.at}>
                            {at.toLocaleString("en-KE", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </time>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Panel>
          ) : null}
        </section>
      ) : (
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="size-4" />
              All projects
            </Button>
            <h2 className="mt-3 font-display text-[1.6rem] leading-none text-maroon">{p.title}</h2>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink/55">
              <span className="font-mono">{p.reference}</span>
              <span>{p.clientLabel}</span>
              {p.clientCity ? <span>{p.clientCity}</span> : null}
              {clientType === "diaspora" ? (
                <Badge tone="gold" className="h-5 text-[9px]">
                  From abroad
                </Badge>
              ) : null}
              <span>
                {p.startedLabel} → {p.targetLabel}
              </span>
              {p.isSample ? (
                <Badge tone="gold" className="h-5 text-[9px]">
                  Sample
                </Badge>
              ) : null}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-[1.8rem] leading-none text-maroon">{p.progress}%</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{p.stage}</p>
          </div>
        </section>
      )}

      <Panel
        title="Project lifecycle"
        subtitle="Delivery progress and project close-out are tracked separately."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            tone={
              p.lifecycleState === "closed" || p.lifecycleState === "archived" ? "maroon" : "gold"
            }
          >
            {portfolioLifecycleLabel(p.lifecycleState, allTrackedMilestonesComplete)}
          </Badge>
          {p.lifecycleState === "active_build" && allTrackedMilestonesComplete ? (
            <p className="text-[12px] text-ink/60">
              All tracked milestones are complete; handover and close-out are not yet recorded.
            </p>
          ) : null}
        </div>

        {p.isSample ? (
          <p className="mt-4 text-[12px] text-muted">Sample projects are read-only.</p>
        ) : canChangeLifecycle && nextLifecycle ? (
          <div className="mt-4 grid gap-3 sm:max-w-2xl">
            <div>
              <p className="text-[11px] font-medium text-muted">Next lifecycle step</p>
              <p className="mt-1 text-[14px] font-medium text-maroon">
                {PROJECT_LIFECYCLE_LABEL[nextLifecycle]}
              </p>
            </div>
            {nextLifecycle === "handover" ? (
              <p className="text-[12px] leading-relaxed text-ink/60">
                {allTrackedMilestonesComplete
                  ? "Every tracked milestone is complete. Handover does not close the project."
                  : "Complete every tracked milestone before moving the project to handover."}
              </p>
            ) : null}
            {nextLifecycle === "defects_period" ? (
              <p className="text-[12px] leading-relaxed text-ink/60">
                {defectPeriodEndIsFuture
                  ? `Defect-period end date: ${p.defectPeriodEnd}.`
                  : p.defectPeriodEnd
                    ? `The defect-period end date (${p.defectPeriodEnd}) is not in the future. Update it in After handover.`
                    : "Set the defect-period end date in After handover before starting this period."}
              </p>
            ) : null}
            {nextLifecycle === "closed" ? (
              <p className="text-[12px] leading-relaxed text-ink/60">
                Admin close-out requires the defect period to have ended, all defects to be verified
                or declined, and retention to be released.
              </p>
            ) : null}
            {nextLifecycle === "archived" ? (
              <p className="text-[12px] leading-relaxed text-ink/60">
                Archiving removes this project from the live portfolio. Its history remains
                available.
              </p>
            ) : null}
            <div>
              <Label htmlFor="lifecycle-reason">Reason for this change</Label>
              <Textarea
                id="lifecycle-reason"
                value={lifecycleReason}
                onChange={(event) => {
                  setLifecycleReason(event.target.value);
                  setLifecycleReview(false);
                }}
                maxLength={500}
                placeholder="Record the handover, defects-period, close-out, or archive basis."
                className="min-h-20"
                disabled={pending === "lifecycle"}
              />
            </div>
            {!lifecycleReview ? (
              <Button
                className="w-fit"
                disabled={
                  pending === "lifecycle" ||
                  lifecycleReason.trim().length < 5 ||
                  (nextLifecycle === "handover" && !allTrackedMilestonesComplete) ||
                  (nextLifecycle === "defects_period" && !defectPeriodEndIsFuture)
                }
                onClick={() => setLifecycleReview(true)}
              >
                Review transition
              </Button>
            ) : (
              <div
                className="rounded-xl border border-amber-300 bg-amber-50 p-4"
                aria-live="polite"
              >
                <p className="text-[13px] font-medium text-amber-950">
                  Move this project to {PROJECT_LIFECYCLE_LABEL[nextLifecycle]}?
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-amber-900">
                  This change will be recorded with your name, the date, and the reason above.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    disabled={pending === "lifecycle"}
                    onClick={() =>
                      void run(
                        "lifecycle",
                        async () => {
                          await changeProjectLifecycle({
                            data: {
                              projectId,
                              to: nextLifecycle,
                              reason: lifecycleReason.trim(),
                            },
                          });
                          setLifecycleReview(false);
                          setLifecycleReason("");
                        },
                        `Project moved to ${PROJECT_LIFECYCLE_LABEL[nextLifecycle]}.`,
                      )
                    }
                  >
                    {pending === "lifecycle" ? "Saving…" : "Confirm transition"}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={pending === "lifecycle"}
                    onClick={() => setLifecycleReview(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : nextLifecycle && lifecycleNeedsAdmin ? (
          <p className="mt-4 flex items-center gap-2 text-[12px] text-ink/60">
            <Lock className="size-4" aria-hidden />
            Ready for admin approval to {PROJECT_LIFECYCLE_LABEL[nextLifecycle].toLowerCase()}.
          </p>
        ) : (
          <p className="mt-4 text-[12px] text-muted">This project is archived.</p>
        )}
        <div className="mt-5 border-t border-ink/8 pt-4">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            Transition record
          </h3>
          {lifecycleHistory.length === 0 ? (
            <p className="mt-2 text-[12px] text-ink/55">No lifecycle transitions recorded yet.</p>
          ) : (
            <ol className="mt-3 space-y-3">
              {lifecycleHistory.map((entry) => (
                <li key={entry.id} className="border-l-2 border-gold/60 pl-3">
                  <p className="text-[12px] font-medium text-maroon">
                    {PROJECT_LIFECYCLE_LABEL[entry.fromState]} →{" "}
                    {PROJECT_LIFECYCLE_LABEL[entry.toState]}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink/60">
                    {entry.changedBy} ·{" "}
                    {new Date(entry.changedAt).toLocaleString("en-KE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink/65">{entry.reason}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Panel>

      {!p.isSample ? (
        <ProjectWorkflowChecklist projectId={projectId} documents={data.documents} />
      ) : null}

      <Accordion className="space-y-4">
        <AccordionItem title="Client & consent">
          <ClientCard projectId={projectId} />
        </AccordionItem>
        <AccordionItem
          title="Activity"
          hint={data.activity.length ? `${data.activity.length}` : undefined}
        >
          <StudioActivityFeed items={data.activity} />
        </AccordionItem>
        <AccordionItem
          title="Message thread"
          hint={waitingToReply ? `${waitingToReply} waiting` : undefined}
          defaultOpen={waitingToReply > 0}
          sectionId="project-message-thread"
          openRequest={sectionRequest.target === "message-thread" ? sectionRequest.nonce : 0}
        >
          <StudioMessagesPanel projectId={projectId} />
        </AccordionItem>
        <AccordionItem
          title="Site presence"
          hint={presenceOpen ? `${presenceOpen} waiting` : undefined}
          defaultOpen={presenceOpen > 0}
          sectionId="project-site-presence"
          openRequest={sectionRequest.target === "site-presence" ? sectionRequest.nonce : 0}
        >
          <PresencePanel projectId={projectId} onChanged={onChanged} />
        </AccordionItem>
        <AccordionItem
          title="Financial summary"
          sectionId="project-financial-summary"
          openRequest={sectionRequest.target === "financial-summary" ? sectionRequest.nonce : 0}
        >
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-ink/8 pt-5 text-[12px] md:grid-cols-4">
            {[
              ["Contract", kes(p.contractValue)],
              ["Paid", kes(p.budget.paidToDate)],
              [
                measuredWork ? "Certified, awaiting payment" : "Approved stages awaiting payment",
                kes(p.budget.currentlyCertified),
              ],
              ["Retention", kes(p.budget.retentionHeld)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-muted">{k}</dt>
                <dd className="mt-1 text-[14px] text-maroon">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              {measuredWork ? "Certified payments awaiting payment" : "Approved stages awaiting payment"}
            </h3>
            {certifiedPayments.length === 0 ? (
              <p className="mt-2 rounded-xl border border-ink/8 bg-white px-4 py-3 text-[12px] text-ink/55">
                No payment stages are awaiting payment.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {certifiedPayments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3"
                  >
                    <span className="text-[13px] text-maroon">{payment.label}</span>
                    <span className="text-[13px] font-medium text-maroon">
                      {kes(payment.amount)}
                    </span>
                    {payment.certificate ? (
                      <span className="w-full font-mono text-[11px] text-muted">
                        {measuredWork ? "Certificate" : "Stage reference"} {payment.certificate}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-6">
            <HowToPayBlock projectId={projectId} run={run} onChanged={onChanged} />
          </div>
        </AccordionItem>
        <AccordionItem
          title="Milestone & evidence"
          sectionId="project-milestone-evidence"
          openRequest={sectionRequest.target === "milestone-evidence" ? sectionRequest.nonce : 0}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <WriteBlock
              title="Update a milestone"
              hint="Set the stage status the client sees. Completing one opens the next automatically."
              hideHeading
              onRun={() =>
                run(
                  "write",
                  async () => {
                    if (!milestoneId) throw new Error("Pick a milestone first.");
                    await updateMilestone({
                      data: {
                        projectId,
                        milestoneId,
                        status: status as "active" | "complete" | "blocked" | "pending",
                        note: milestoneNote.trim() || undefined,
                        approvalReady: readyToApprove,
                      },
                    });
                    setMilestoneNote("");
                  },
                  "Milestone updated.",
                )
              }
            >
              <div>
                <Label htmlFor="st-ms">Milestone</Label>
                <Select
                  id="st-ms"
                  value={milestoneId}
                  onChange={(e) => setMilestoneId(e.target.value)}
                >
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
              <div className="flex items-start gap-2 rounded-xl border border-ink/10 bg-ink/2 px-3 py-2.5">
                <input
                  id="st-ready"
                  type="checkbox"
                  className="mt-0.5 size-4 shrink-0 accent-[#7a1f2b]"
                  checked={readyToApprove}
                  onChange={(e) => setReadyToApprove(e.target.checked)}
                />
                <div className="min-w-0">
                  <Label htmlFor="st-ready">Ready for the client to approve</Label>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink/55">
                    Shows the Approve button on their portal. Completing a stage clears this on its
                    own.
                  </p>
                </div>
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
                run(
                  "write",
                  async () => {
                    if (!milestoneId) throw new Error("Pick a milestone first.");
                    if (evidenceCaption.trim().length < 3)
                      throw new Error("Give the evidence a caption.");
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
                  },
                  "Evidence added.",
                )
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
                milestones={data.milestones.map((m) => ({
                  id: m.id,
                  order: m.order,
                  name: m.name,
                }))}
                onUploaded={() => void refetch()}
              />
            </WriteBlock>

            <WriteBlock
              title="Raise a decision"
              hint="Puts a choice to the client. One option per line. They record it in the decision log."
              hideHeading
              onRun={() =>
                run(
                  "write",
                  async () => {
                    const options = decisionOptions
                      .split("\n")
                      .map((o) => o.trim())
                      .filter(Boolean);
                    if (decisionTitle.trim().length < 3)
                      throw new Error("Give the decision a title.");
                    if (options.length < 2)
                      throw new Error("List at least two options, one per line.");
                    await raiseDecision({
                      data: {
                        projectId,
                        title: decisionTitle.trim(),
                        detail: "",
                        options,
                        costImpact: 0,
                        dueDate: decisionDueDate || null,
                      },
                    });
                    setDecisionTitle("");
                    setDecisionDueDate("");
                    setDecisionOptions("");
                  },
                  "Decision raised.",
                )
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
              <div>
                <Label htmlFor="st-ddue">Reply by (optional)</Label>
                <Input
                  id="st-ddue"
                  type="date"
                  value={decisionDueDate}
                  onChange={(e) => setDecisionDueDate(e.target.value)}
                />
              </div>
            </WriteBlock>

            <WriteBlock
              title="Post an update"
              hint="Appears in the client's activity feed and counts as new since their last visit."
              hideHeading
              onRun={() =>
                run(
                  "write",
                  async () => {
                    if (updateTitle.trim().length < 3) throw new Error("Give the update a title.");
                    await postUpdate({
                      data: {
                        projectId,
                        title: updateTitle.trim(),
                        body: updateBody.trim(),
                        kind: "note",
                      },
                    });
                    setUpdateTitle("");
                    setUpdateBody("");
                  },
                  "Update posted.",
                )
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
        <AccordionItem
          title="Approvals"
          sectionId="project-approvals"
          openRequest={sectionRequest.target === "approvals" ? sectionRequest.nonce : 0}
        >
          <ApprovalsPanel projectId={projectId} onChanged={onChanged} />
        </AccordionItem>
        <AccordionItem title="Selections">
          <SelectionsPanel projectId={projectId} onChanged={onChanged} />
        </AccordionItem>
        <AccordionItem title="Variations">
          <VariationsPanel projectId={projectId} />
        </AccordionItem>
        <AccordionItem title="Defects & care">
          <AfterHandoverPanel projectId={projectId} isAdmin={isAdmin} />
        </AccordionItem>
        <AccordionItem title="Document vault">
          <WriteBlock
            title="Add to the document vault"
            hint="Contracts, approvals, drawings and certificates the client can see. They keep the record."
            hideHeading
            onRun={() =>
              run(
                "vault",
                async () => {
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
                },
                "Document added to the vault.",
              )
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
        </AccordionItem>
        {uncertified.length > 0 ? (
          <AccordionItem
            title={measuredWork ? "Certify completed work" : "Approve an agreed fee stage"}
            hint={`${uncertified.length}`}
          >
            <p className="text-[12px] text-ink/55">
              {measuredWork
                ? "Confirm the work has been inspected and measured against the agreement. The client receives a payment certificate and a separate payment request."
                : "Confirm the agreed deliverable or fee stage is complete under the signed engagement. The client receives a payment request, not a QS certificate."}
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
                  {isAdmin ? (
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
                          measuredWork ? "Work certified and payment request issued." : "Stage approved and payment request issued.",
                        )
                      }
                    >
                      {measuredWork ? "Certify work" : "Approve stage"}
                    </Button>
                  ) : (
                    <span className="text-[11px] text-muted">Admins only</span>
                  )}
                </li>
              ))}
            </ul>
          </AccordionItem>
        ) : null}
        <AccordionItem title="Statement of account">
          <p className="text-[12px] leading-relaxed text-ink/55">
            A record of where the money stands — not a demand. The client sees it in their
            documents.
          </p>
          {isAdmin ? (
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
          ) : (
            <p className="mt-4 text-[12px] text-muted">Issuing a statement is an admin action.</p>
          )}
        </AccordionItem>
        <AccordionItem title="Retention">
          <p className="text-[12px] leading-relaxed text-ink/55">
            Held against defects. Releasing it records that the defects liability period has closed
            and pays the money out.
          </p>
          {isAdmin ? (
            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() =>
                void run(
                  "retention",
                  () => releaseRetention({ data: { projectId } }),
                  "Retention released.",
                )
              }
              disabled={pending === "retention"}
            >
              Release retention
            </Button>
          ) : (
            <p className="mt-4 text-[12px] text-muted">Releasing retention is an admin action.</p>
          )}
        </AccordionItem>
        <AccordionItem
          title="What the client has decided"
          hint={`${stillOpen} awaiting · ${data.decisions.length} total`}
          sectionId="project-client-decisions"
          openRequest={sectionRequest.target === "client-decisions" ? sectionRequest.nonce : 0}
        >
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
                    {d.state !== "decided" && d.dueDate ? ` · Reply by ${d.dueDate}` : ""}
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
      <IssuedDocuments
        projectId={projectId}
        projectTitle={p.title}
        clientLabel={p.clientLabel}
        isAdmin={isAdmin}
        onChanged={onChanged}
      />
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
  message: { label: "Reply needed", cls: "bg-amber-50 text-amber-900 border-amber-300" },
  variation: {
    label: "Change awaiting client",
    cls: "bg-stone/100 text-stone-700 border-stone-300",
  },
};

type SortKey = "newest" | "attention" | "largest";
type PortfolioView = "active" | "completed" | "closed" | "archived" | "all" | "sample";

function ProjectsTable({
  projects,
  onOpen,
  onGoEnquiries,
  projectsLoading = false,
  projectsError = null,
  onRetryProjects,
  search = "",
  onClearSearch,
}: {
  projects: StaffProjectSummary[];
  onOpen: (id: string) => void;
  onGoEnquiries?: () => void;
  projectsLoading?: boolean;
  projectsError?: Error | null;
  onRetryProjects?: () => void;
  search?: string;
  onClearSearch?: () => void;
}) {
  const pageSize = 10;
  const [sort, setSort] = useState<SortKey>("attention");
  const [portfolioView, setPortfolioView] = useState<PortfolioView>("active");
  const [pageIndex, setPageIndex] = useState(0);

  const liveProjects = projects.filter(
    (project) =>
      project.source !== "sample" &&
      project.lifecycleState !== "closed" &&
      project.lifecycleState !== "archived",
  );
  const activeProjects = liveProjects.filter((project) => !project.buildComplete);
  const completedProjects = liveProjects.filter((project) => project.buildComplete);
  const closedProjects = projects.filter(
    (project) => project.source !== "sample" && project.lifecycleState === "closed",
  );
  const archivedProjects = projects.filter(
    (project) => project.source !== "sample" && project.lifecycleState === "archived",
  );
  const sampleProjects = projects.filter((project) => project.source === "sample");
  const visibleProjects =
    portfolioView === "active"
      ? activeProjects
      : portfolioView === "completed"
        ? completedProjects
        : portfolioView === "closed"
          ? closedProjects
          : portfolioView === "archived"
            ? archivedProjects
            : portfolioView === "sample"
              ? sampleProjects
              : liveProjects;
  const query = search.trim().toLowerCase();

  const sorted = visibleProjects
    .filter(
      (project) =>
        !query ||
        [project.title, project.reference, project.clientLabel, project.clientCity, project.stage]
          .join(" ")
          .toLowerCase()
          .includes(query),
    )
    .sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "largest") return b.contractValue - a.contractValue;
      const score = (p: StaffProjectSummary) =>
        (p.blockedStages > 0 ? 1000 : 0) + (p.openDecisions > 0 ? 500 : 0) + (p.onTrack ? 0 : 250);
      return score(b) - score(a);
    });

  const views: { id: PortfolioView; label: string; count: number }[] = [
    { id: "active", label: "Active", count: activeProjects.length },
    { id: "completed", label: "Build complete", count: completedProjects.length },
    { id: "closed", label: "Closed", count: closedProjects.length },
    { id: "archived", label: "Archived", count: archivedProjects.length },
    { id: "all", label: "All live", count: liveProjects.length },
    { id: "sample", label: "Samples", count: sampleProjects.length },
  ];
  const pageCount = Math.ceil(sorted.length / pageSize);
  const currentPage = Math.min(pageIndex, Math.max(0, pageCount - 1));
  const pageProjects = sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const firstVisible = sorted.length === 0 ? 0 : currentPage * pageSize + 1;
  const lastVisible = Math.min((currentPage + 1) * pageSize, sorted.length);
  const activeAttention = visibleProjects.filter((project) => project.blockedStages > 0 || project.openDecisions > 0).length;
  const portfolioRisk = visibleProjects.reduce(
    (sum, project) => sum + project.blockedStages + project.openDecisions,
    0,
  );
  const pendingRelease = visibleProjects.reduce(
    (sum, project) => sum + project.currentlyCertified,
    0,
  );
  const offTrack = visibleProjects.filter((project) => !project.onTrack).length;

  return (
    <Panel
      title="Live jobs"
      subtitle="A project is live until it is complete, closed or archived. Follow-up stays with the studio so the next action is always clear."
      className="min-w-0"
      bodyClassName="p-0"
    >
      {projectsError && projects.length === 0 ? (
        <div role="alert" className="px-6 py-10 text-center">
          <AlertTriangle className="mx-auto size-7 text-red-700" aria-hidden />
          <h3 className="mt-3 font-display text-lg text-red-900">Could not load the portfolio</h3>
          <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-relaxed text-red-800">
            {projectsError.message}
          </p>
          {onRetryProjects ? (
            <Button
              className="mt-4"
              size="sm"
              variant="outline"
              onClick={onRetryProjects}
              disabled={projectsLoading}
            >
              Try again
            </Button>
          ) : null}
        </div>
      ) : projectsLoading && projects.length === 0 ? (
        <div
          className="space-y-3 px-5 py-6"
          aria-busy="true"
          aria-label="Loading project portfolio"
        >
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-12 animate-pulse rounded-xl bg-ink/5" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <FolderKanban className="size-8 text-ink/25" aria-hidden />
          <h3 className="mt-4 font-display text-[1.35rem] leading-none text-maroon">
            {query ? "No projects match your search" : "Your live portfolio is clear"}
          </h3>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink/55">
            {query
              ? `No project, client, reference, or stage contains “${search.trim()}”.`
              : "Projects appear here once a client opens a portal project or the studio creates one. Review enquiries to see who may be ready to start."}
          </p>
          {query && onClearSearch ? (
            <Button className="mt-5" size="sm" variant="outline" onClick={onClearSearch}>
              Clear search
            </Button>
          ) : onGoEnquiries ? (
            <Button className="mt-5" size="sm" variant="outline" onClick={onGoEnquiries}>
              Review enquiries
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          {projectsError ? (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-5 py-3 text-[12px] text-amber-950"
            >
              <span>
                Could not refresh the portfolio. Showing the project records already loaded.
              </span>
              {onRetryProjects ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetryProjects}
                  disabled={projectsLoading}
                >
                  Retry
                </Button>
              ) : null}
            </div>
          ) : null}
          <div className="grid gap-3 border-b border-ink/8 bg-cream/40 px-5 py-4 md:grid-cols-4">
            <div className="rounded-2xl border border-ink/10 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">In view</p>
              <p className="mt-2 font-display text-[1.5rem] leading-none text-maroon">
                {visibleProjects.length}
              </p>
              <p className="mt-1 text-[11px] text-ink/55">projects in this portfolio slice</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-900">
                Needs follow-up
              </p>
              <p className="mt-2 font-display text-[1.5rem] leading-none text-amber-900">
                {activeAttention}
              </p>
              <p className="mt-1 text-[11px] text-amber-800">
                {portfolioRisk} open actions across the current view
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-900">
                Certified waiting
              </p>
              <p className="mt-2 font-display text-[1.4rem] leading-none text-sky-900">
                {kesShort(pendingRelease)}
              </p>
              <p className="mt-1 text-[11px] text-sky-800">not yet released to clients</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                Off track
              </p>
              <p className="mt-2 font-display text-[1.5rem] leading-none text-maroon">{offTrack}</p>
              <p className="mt-1 text-[11px] text-ink/55">projects needing programme review</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 px-5 py-3">
            <div className="flex flex-wrap gap-2" aria-label="Filter project portfolio">
              {views.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  aria-pressed={portfolioView === view.id}
                  onClick={() => {
                    setPortfolioView(view.id);
                    setPageIndex(0);
                  }}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-[11px] transition-colors",
                    portfolioView === view.id
                      ? "border-maroon bg-maroon text-paper"
                      : "border-ink/12 text-ink/55 hover:border-burgundy hover:text-burgundy",
                  )}
                >
                  {view.label} <span className="ml-1 opacity-75">{view.count}</span>
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-[12px] text-muted">
              <span>Sort</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortKey);
                  setPageIndex(0);
                }}
                className="h-9 rounded-lg border border-ink/10 bg-white px-2.5 text-[12px] text-maroon outline-none focus:border-gold"
              >
                <option value="attention">Needs follow-up</option>
                <option value="newest">Newest</option>
                <option value="largest">Largest contract</option>
              </select>
            </label>
          </div>
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <Inbox className="size-7 text-ink/25" aria-hidden />
              <h3 className="mt-3 font-display text-lg text-maroon">
                {query
                  ? "No projects match your search"
                  : portfolioView === "active"
                    ? "No active projects"
                    : portfolioView === "completed"
                      ? "No build-complete projects yet"
                      : portfolioView === "closed"
                        ? "No formally closed projects"
                        : portfolioView === "archived"
                          ? "No archived projects"
                          : portfolioView === "sample"
                            ? "No sample projects"
                            : "No live projects"}
              </h3>
              <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-ink/55">
                {query
                  ? `No projects in this view match “${search.trim()}”.`
                  : portfolioView === "active"
                    ? "Build-complete, closed, and archived projects are available in their own views."
                    : portfolioView === "completed"
                      ? "Projects appear here after every tracked milestone is marked complete."
                      : portfolioView === "closed"
                        ? "Close-out is recorded only after handover obligations are complete."
                        : portfolioView === "archived"
                          ? "Archived records remain available here for reference."
                          : portfolioView === "sample"
                            ? "Demonstration records will appear here when sample data is enabled."
                            : "New client projects will appear here as the studio opens them."}
              </p>
              {query && onClearSearch ? (
                <Button className="mt-4" size="sm" variant="outline" onClick={onClearSearch}>
                  Clear search
                </Button>
              ) : onGoEnquiries && (portfolioView === "active" || portfolioView === "all") ? (
                <Button className="mt-4" size="sm" variant="outline" onClick={onGoEnquiries}>
                  Review enquiries
                </Button>
              ) : null}
            </div>
          ) : (
            <>
            <ul className="divide-y divide-ink/8 lg:hidden">
              {pageProjects.map((p) => {
                const status =
                  p.lifecycleState === "closed"
                    ? "Closed"
                    : p.lifecycleState === "archived"
                      ? "Archived"
                      : p.buildComplete
                        ? "Build complete"
                        : p.blockedStages > 0
                          ? "Blocked"
                          : p.openDecisions > 0
                            ? "Awaiting client"
                            : p.onTrack
                              ? "On track"
                              : "Watch";
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(p.id)}
                      aria-label={`Open ${p.title} for ${p.clientLabel || "client"}`}
                      className="w-full space-y-3 p-4 text-left transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-maroon"
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium text-maroon">{p.title}</span>
                          <span className="font-mono text-[11px] text-muted">{p.reference}</span>
                          <span className="mt-1 block text-[12px] text-ink/65">
                            {p.clientLabel || "Client not named"}
                            {p.clientCity ? ` · ${p.clientCity}` : ""}
                          </span>
                        </span>
                        <Badge
                          tone={
                            p.lifecycleState === "closed" || p.lifecycleState === "archived"
                              ? "maroon"
                              : "gold"
                          }
                        >
                          {portfolioLifecycleLabel(p.lifecycleState, p.buildComplete)}
                        </Badge>
                      </span>
                      <span className="flex items-center justify-between gap-3 text-[11px] text-ink/60">
                        <span className="truncate">{p.stage || "Stage not set"}</span>
                        <span className="shrink-0">{p.progress}% complete</span>
                      </span>
                      <span className="block h-1.5 overflow-hidden rounded-full bg-ink/10">
                        <span
                          className="block h-full bg-gradient-to-r from-gold to-gold-light"
                          style={{ width: `${p.progress}%` }}
                        />
                      </span>
                      <span className="flex items-center justify-between gap-3">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                            p.blockedStages > 0
                              ? "border-red-200 bg-red-50 text-red-800"
                              : p.openDecisions > 0
                                ? "border-amber-300 bg-amber-50 text-amber-900"
                                : p.onTrack
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-stone-300 bg-stone/100 text-stone-700",
                          )}
                        >
                          {status}
                        </span>
                        <span className="text-right text-[11px] text-ink/60">
                          {kes(p.paidToDate)} paid
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/8 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                    <th scope="col" className="px-5 py-3 font-bold">
                      Project
                    </th>
                    <th scope="col" className="px-3 py-3 font-bold">
                      Client
                    </th>
                    <th scope="col" className="px-3 py-3 font-bold">
                      Stage
                    </th>
                    <th scope="col" className="px-3 py-3 font-bold">
                      Lifecycle
                    </th>
                    <th scope="col" className="px-3 py-3 font-bold">
                      Progress
                    </th>
                    <th scope="col" className="px-3 py-3 font-bold">
                      Paid
                    </th>
                    <th scope="col" className="px-5 py-3 font-bold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageProjects.map((p) => (
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
                        {p.clientType === "diaspora" ? (
                          <span className="mt-1 block">
                            <Badge tone="gold" className="h-4 text-[8px]">
                              From abroad
                            </Badge>
                          </span>
                        ) : null}
                        {p.clientCity ? (
                          <span className="block text-[11px] text-muted">{p.clientCity}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-[13px] text-ink/70">{p.stage || "—"}</td>
                      <td className="px-3 py-3">
                        <Badge
                          tone={
                            p.lifecycleState === "closed" || p.lifecycleState === "archived"
                              ? "maroon"
                              : "gold"
                          }
                          className="h-6 tracking-[0.08em]"
                        >
                          {portfolioLifecycleLabel(p.lifecycleState, p.buildComplete)}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-ink/10">
                            <span
                              className="block h-full bg-gradient-to-r from-gold to-gold-light"
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
                            p.progress >= 100
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : p.blockedStages > 0
                                ? "border-red-200 bg-red-50 text-red-800"
                                : p.openDecisions > 0
                                  ? "border-amber-300 bg-amber-50 text-amber-900"
                                  : p.onTrack
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-stone-300 bg-stone/100 text-stone-700",
                          )}
                        >
                          {p.lifecycleState === "closed"
                            ? "Closed"
                            : p.lifecycleState === "archived"
                              ? "Archived"
                              : p.buildComplete
                                ? "Build complete"
                                : p.blockedStages > 0
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
            </>
          )}
          {sorted.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 px-5 py-3">
              <p className="text-[11px] text-muted" aria-live="polite">
                Showing {firstVisible}–{lastVisible} of {sorted.length}{" "}
                {portfolioView === "active"
                  ? "active"
                  : portfolioView === "completed"
                    ? "build-complete"
                    : portfolioView === "closed"
                      ? "closed"
                      : portfolioView === "archived"
                        ? "archived"
                        : portfolioView === "sample"
                          ? "sample"
                          : "live"}{" "}
                projects
              </p>
              {pageCount > 1 ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPageIndex(currentPage - 1)}
                    disabled={currentPage === 0}
                    aria-label="Previous project page"
                  >
                    Previous
                  </Button>
                  <span className="text-[11px] text-muted" aria-current="page">
                    Page {currentPage + 1} of {pageCount}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPageIndex(currentPage + 1)}
                    disabled={currentPage >= pageCount - 1}
                    aria-label="Next project page"
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </Panel>
  );
}

function StaffProjectsDirectory({
  projects,
  onOpen,
}: {
  projects: StaffProjectSummary[];
  onOpen: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [followUpFilter, setFollowUpFilter] = useState<"all" | "needed">("all");
  const query = search.trim().toLowerCase();
  const visibleProjects = projects.filter((project) => {
    if (
      followUpFilter === "needed" &&
      (project.source === "sample" ||
        project.lifecycleState === "closed" ||
        project.lifecycleState === "archived" ||
        (project.blockedStages === 0 && project.openDecisions === 0 && project.onTrack))
    ) {
      return false;
    }
    return (
      !query ||
      [project.title, project.reference, project.clientLabel, project.clientCity, project.stage]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <Panel
      title="Project register"
      subtitle="Search by client, reference or stage and open the job record to see the next step."
      className="min-w-0"
      bodyClassName="p-0"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-ink/8 px-5 py-3">
        <label className="relative min-w-[200px] flex-1">
          <span className="sr-only">Search projects by project, client, reference, or stage</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Project, client, reference, or stage"
            className="h-10 w-full rounded-xl border border-line bg-paper pl-10 pr-3 text-sm outline-none focus:border-burgundy"
          />
        </label>
        <label className="flex items-center gap-2 text-[12px] text-muted">
          <span>Follow-up</span>
          <select
            value={followUpFilter}
            onChange={(event) => setFollowUpFilter(event.target.value as typeof followUpFilter)}
            className="h-10 rounded-lg border border-ink/10 bg-white px-2.5 text-[12px] text-maroon outline-none focus:border-gold"
          >
            <option value="all">All projects</option>
            <option value="needed">Needs follow-up</option>
          </select>
        </label>
        <span className="text-[12px] text-muted" aria-live="polite">
          {visibleProjects.length} of {projects.length} projects
        </span>
      </div>
      {visibleProjects.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <FolderKanban className="mx-auto size-7 text-ink/25" aria-hidden />
          <h3 className="mt-3 font-display text-lg text-maroon">
            {projects.length === 0
              ? "No projects to show yet"
              : followUpFilter === "needed" && !query
                ? "No projects need follow-up"
                : "No projects match this search"}
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-relaxed text-ink/55">
            {projects.length === 0
              ? "Projects appear here when a client opens a portal project or the studio creates one."
              : followUpFilter === "needed" && !query
                ? "Live projects with blocked work, open client decisions, or a programme review will appear here."
                : "Try a different client, project, reference, or stage, or clear the follow-up filter."}
          </p>
          {query || followUpFilter !== "all" ? (
            <Button
              className="mt-4"
              size="sm"
              variant="outline"
              onClick={() => {
                setSearch("");
                setFollowUpFilter("all");
              }}
            >
              Show all projects
            </Button>
          ) : null}
        </div>
      ) : (
        <>
        <ul className="divide-y divide-ink/8 lg:hidden">
          {visibleProjects.map((project) => {
            const followUpLabel =
              project.blockedStages > 0
                ? "Blocked"
                : project.openDecisions > 0
                  ? "Awaiting client"
                  : !project.onTrack
                    ? "Needs review"
                    : project.buildComplete
                      ? "Build complete"
                      : "No open issue";
            const programme =
              project.daysRemaining > 0
                ? `${project.daysRemaining} days remaining`
                : project.daysRemaining < 0
                  ? `${Math.abs(project.daysRemaining)} days past target`
                  : project.onTrack
                    ? "No target-date detail"
                    : "Programme needs review";
            return (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => onOpen(project.id)}
                  aria-label={`Open ${project.title} for ${project.clientLabel || "client"}`}
                  className="w-full space-y-3 p-4 text-left transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-maroon"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-maroon">
                        {project.title}
                      </span>
                      <span className="font-mono text-[11px] text-muted">{project.reference}</span>
                      <span className="mt-1 block text-[12px] text-ink/65">
                        {project.clientLabel || "Client not named"}
                        {project.clientCity ? ` · ${project.clientCity}` : ""}
                      </span>
                    </span>
                    <Badge
                      tone={
                        project.lifecycleState === "closed" || project.lifecycleState === "archived"
                          ? "maroon"
                          : "gold"
                      }
                    >
                      {portfolioLifecycleLabel(project.lifecycleState, project.buildComplete)}
                    </Badge>
                  </span>
                  {project.source === "sample" ? <Badge tone="gold">Sample</Badge> : null}
                  {project.clientType === "diaspora" ? <Badge tone="gold">From abroad</Badge> : null}
                  <span className="flex items-center justify-between gap-3 text-[11px] text-ink/60">
                    <span className="truncate">{project.stage || "Stage not set"}</span>
                    <span className="shrink-0">{programme}</span>
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                      project.blockedStages > 0
                        ? "border-red-200 bg-red-50 text-red-800"
                        : project.openDecisions > 0
                          ? "border-amber-300 bg-amber-50 text-amber-900"
                          : !project.onTrack
                            ? "border-stone-300 bg-stone/100 text-stone-700"
                            : project.buildComplete
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-ink/10 bg-ink/2 text-ink/60",
                    )}
                  >
                    {followUpLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink/8 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                <th scope="col" className="px-5 py-3 font-bold">
                  Project
                </th>
                <th scope="col" className="px-3 py-3 font-bold">
                  Client
                </th>
                <th scope="col" className="px-3 py-3 font-bold">
                  Current stage
                </th>
                <th scope="col" className="px-3 py-3 font-bold">
                  Lifecycle
                </th>
                <th scope="col" className="px-3 py-3 font-bold">
                  Programme
                </th>
                <th scope="col" className="px-5 py-3 font-bold">
                  Follow-up
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map((project) => {
                const followUp =
                  project.blockedStages > 0
                    ? { label: "Blocked", cls: "border-red-200 bg-red-50 text-red-800" }
                    : project.openDecisions > 0
                      ? {
                          label: "Awaiting client",
                          cls: "border-amber-300 bg-amber-50 text-amber-900",
                        }
                      : !project.onTrack
                        ? {
                            label: "Needs review",
                            cls: "border-stone-300 bg-stone/100 text-stone-700",
                          }
                        : project.buildComplete
                          ? {
                              label: "Build complete",
                              cls: "border-emerald-200 bg-emerald-50 text-emerald-800",
                            }
                          : { label: "No open issue", cls: "border-ink/10 bg-ink/2 text-ink/60" };
                const lifecycleTone =
                  project.lifecycleState === "closed" || project.lifecycleState === "archived"
                    ? "maroon"
                    : "gold";
                const programme =
                  project.daysRemaining > 0
                    ? `${project.daysRemaining} days remaining`
                    : project.daysRemaining < 0
                      ? `${Math.abs(project.daysRemaining)} days past recorded target`
                      : project.onTrack
                        ? "No target-date detail"
                        : "Programme needs review";

                return (
                  <tr
                    key={project.id}
                    onClick={() => onOpen(project.id)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpen(project.id);
                      }
                    }}
                    className="cursor-pointer border-b border-ink/6 transition-colors last:border-0 hover:bg-cream focus:bg-cream focus:outline-none"
                  >
                    <td className="px-5 py-3">
                      <span className="block text-[13px] font-medium text-maroon">
                        {project.title}
                      </span>
                      <span className="font-mono text-[11px] text-muted">{project.reference}</span>
                      {project.source === "sample" ? (
                        <span className="mt-1 block">
                          <Badge tone="gold" className="h-4 text-[8px]">
                            Sample
                          </Badge>
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-[13px] text-ink/70">
                      {project.clientLabel || "Client not named"}
                      {project.clientType === "diaspora" ? (
                        <span className="mt-1 block">
                          <Badge tone="gold" className="h-4 text-[8px]">
                            From abroad
                          </Badge>
                        </span>
                      ) : null}
                      {project.clientCity ? (
                        <span className="block text-[11px] text-muted">{project.clientCity}</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-[13px] text-ink/70">
                      {project.stage || "Not set"}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={lifecycleTone}>
                        {portfolioLifecycleLabel(project.lifecycleState, project.buildComplete)}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-ink/65">{programme}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                          followUp.cls,
                        )}
                      >
                        {followUp.label}
                      </span>
                      {project.blockedStages > 1 || project.openDecisions > 1 ? (
                        <span className="mt-1 block text-[10px] text-muted">
                          {project.blockedStages > 0
                            ? `${project.blockedStages} blocked stage${project.blockedStages === 1 ? "" : "s"}`
                            : `${project.openDecisions} open decisions`}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </Panel>
  );
}

function StaffToday({
  projects,
  today,
  todayLoading,
  todayError,
  projectsLoading,
  projectsError,
  onRetryToday,
  onRetryProjects,
  onOpen,
  onOpenEnquiry,
  onGoEnquiries,
  onGoNewEnquiries,
  onGoProjects,
  onGoAttentionProjects,
}: {
  projects: StaffProjectSummary[];
  today: StaffTodayOverview | undefined;
  todayLoading: boolean;
  todayError: Error | null;
  projectsLoading: boolean;
  projectsError: Error | null;
  onRetryToday: () => void;
  onRetryProjects: () => void;
  onOpen: (id: string) => void;
  onOpenEnquiry: (id: string) => void;
  onGoEnquiries: () => void;
  onGoNewEnquiries: () => void;
  onGoProjects: () => void;
  onGoAttentionProjects: () => void;
}) {
  const liveProjects = projects.filter(
    (project) =>
      project.source !== "sample" &&
      project.lifecycleState !== "closed" &&
      project.lifecycleState !== "archived",
  );
  const needsAttention = liveProjects.filter(
    (project) => project.blockedStages > 0 || project.openDecisions > 0 || !project.onTrack,
  ).length;
  const liveProjectIds = new Set(liveProjects.map((project) => project.id));
  const attentionItems = (today?.attention ?? []).filter((item) =>
    liveProjectIds.has(item.projectId),
  );
  const flaggedProjects = liveProjects.filter(
    (project) => project.blockedStages > 0 || project.openDecisions > 0 || !project.onTrack,
  ).length;
  const healthyProjects = liveProjects.filter(
    (project) => project.blockedStages === 0 && project.openDecisions === 0 && project.onTrack,
  ).length;

  return (
    <div className="space-y-5">
      <Panel
        title="Office overview"
        subtitle="The office needs a quick view of risk, follow-up and delivery health before a decision is made."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-900">
              Need attention
            </p>
            <p className="mt-2 font-display text-[1.8rem] leading-none text-amber-900">
              {flaggedProjects}
            </p>
            <p className="mt-1 text-[11px] text-amber-800">projects with blocked work or open decisions</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-900">
              Running clean
            </p>
            <p className="mt-2 font-display text-[1.8rem] leading-none text-emerald-900">
              {healthyProjects}
            </p>
            <p className="mt-1 text-[11px] text-emerald-800">projects without active blockers</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-sky-200 bg-sky-50 p-3 sm:col-span-1 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-900">
              Follow-up today
            </p>
            <p className="mt-2 font-display text-[1.8rem] leading-none text-sky-900">
              {attentionItems.length}
            </p>
            <p className="mt-1 text-[11px] text-sky-800">items waiting for review in the studio queue</p>
          </div>
        </div>
      </Panel>
      {projectsError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800"
        >
          <p>
            {projectsError instanceof Error
              ? `Could not load the project register: ${projectsError.message}`
              : "Could not load the project register."}
          </p>
          <Button className="mt-3" size="sm" variant="outline" onClick={onRetryProjects}>
            Try again
          </Button>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <button
          type="button"
          onClick={onGoProjects}
          aria-label="Open the project register"
          className="block w-full rounded-2xl text-left transition-shadow hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon focus-visible:ring-offset-2"
        >
          <StatCard
            label="Live projects"
            value={
              projectsLoading
                ? "…"
                : projectsError && projects.length === 0
                  ? "—"
                  : String(liveProjects.length)
            }
            sub={
              projectsError && projects.length === 0
                ? "Project count unavailable"
                : "Projects currently in the studio's live portfolio"
            }
            icon={FolderKanban}
            className="h-full transition-colors hover:border-burgundy/30"
          />
        </button>
        <button
          type="button"
          onClick={onGoAttentionProjects}
          aria-label="Open projects that need attention"
          className="block w-full rounded-2xl text-left transition-shadow hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon focus-visible:ring-offset-2"
        >
          <StatCard
            label="Projects to check"
            value={
              projectsLoading
                ? "…"
                : projectsError && projects.length === 0
                  ? "—"
                  : String(needsAttention)
            }
            sub={
              projectsError && projects.length === 0
                ? "Attention count unavailable"
                : "Blocked, awaiting a decision, or off programme"
            }
            icon={AlertTriangle}
            tone={needsAttention > 0 ? "warn" : "good"}
            className="h-full transition-colors hover:border-burgundy/30"
          />
        </button>
        <button
          type="button"
          onClick={onGoNewEnquiries}
          aria-label="Open new enquiries"
          className="block w-full rounded-2xl text-left transition-shadow hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon focus-visible:ring-offset-2"
        >
          <StatCard
            label="New enquiries"
            value={
              todayLoading ? "…" : todayError && !today ? "—" : String(today?.newEnquiries ?? 0)
            }
            sub={todayError && !today ? "Enquiry count unavailable" : "Not yet marked as contacted"}
            icon={Inbox}
            tone={(today?.newEnquiries ?? 0) > 0 ? "warn" : "default"}
            className="h-full transition-colors hover:border-burgundy/30"
          />
        </button>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[1.2fr_1fr]">
        <Panel
          title="Follow-up list"
          subtitle="Things waiting for a human response, sorted by how long they have been open."
          actions={
            <Button size="sm" variant="ghost" onClick={onGoProjects}>
              All projects <ArrowRight className="size-3.5" />
            </Button>
          }
        >
          {todayError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800"
            >
              <p>
                {todayError instanceof Error
                  ? `Could not load the studio follow-up queue: ${todayError.message}`
                  : "Could not load the studio follow-up queue."}
              </p>
              <Button className="mt-3" size="sm" variant="outline" onClick={onRetryToday}>
                Try again
              </Button>
            </div>
          ) : todayLoading || !today ? (
            <p className="rounded-xl border border-ink/10 bg-cream/60 px-4 py-5 text-center text-[13px] text-ink/55">
              Loading the studio follow-up queue…
            </p>
          ) : projectsError && projects.length === 0 ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-[13px] leading-relaxed text-amber-900">
              Project records could not be loaded, so this queue cannot verify which follow-ups are
              for live projects. Retry the project register above.
            </p>
          ) : attentionItems.length === 0 ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-center">
              <CheckCircle2 className="mx-auto size-5 text-emerald-700" aria-hidden />
              <p className="mt-2 text-[13px] font-medium text-emerald-900">
                No project follow-up is waiting
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-emerald-800">
                New client messages, blocked work, decisions, and quiet projects will appear here.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {attentionItems.slice(0, 8).map((item, index) => (
                <li key={`${item.projectId}-${item.kind}-${index}`}>
                  <button
                    type="button"
                    onClick={() => onOpen(item.projectId)}
                    className="flex w-full items-start justify-between gap-3 rounded-xl border border-ink/10 p-3 text-left transition-colors hover:border-burgundy hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon focus-visible:ring-offset-2"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-medium text-maroon">{item.title}</span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                            ATTENTION_COPY[item.kind]?.cls,
                          )}
                        >
                          {ATTENTION_COPY[item.kind]?.label ?? item.kind}
                        </span>
                      </span>
                      <span className="mt-1 block text-[11px] font-mono text-muted">
                        {item.reference}
                      </span>
                      <span className="mt-1 block text-[12px] leading-snug text-ink/55">
                        {item.detail}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-muted">
                      {item.ageDays === 0 ? "today" : `${item.ageDays}d waiting`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel
            title="Enquiry inbox"
            subtitle="Respond to people who have asked ATRO about a project."
            actions={
              <Button size="sm" variant="outline" onClick={onGoNewEnquiries}>
                Review new enquiries <ArrowRight className="size-3.5" />
              </Button>
            }
          >
            {todayError ? (
              <p role="alert" className="text-[13px] text-red-800">
                Enquiry count is unavailable. Open the inbox to check for new requests.
              </p>
            ) : todayLoading || !today ? (
              <p className="text-[13px] text-ink/55">Checking for new enquiries…</p>
            ) : today.newEnquiries > 0 ? (
              <p className="text-[13px] leading-relaxed text-ink/70">
                <strong className="text-maroon">{today.newEnquiries}</strong>{" "}
                {today.newEnquiries === 1 ? "enquiry is" : "enquiries are"} waiting to be contacted.
              </p>
            ) : (
              <p className="text-[13px] leading-relaxed text-ink/55">
                No new enquiries are waiting to be contacted.
              </p>
            )}
          </Panel>

          <Panel
            title="Project register"
            subtitle="See the project record and check what needs to happen next."
            actions={
              <Button size="sm" variant="outline" onClick={onGoProjects}>
                Browse projects <ArrowRight className="size-3.5" />
              </Button>
            }
          >
            <p className="text-[13px] leading-relaxed text-ink/60">
              Follow-up is coordinated by the studio admin. This queue helps the team see what needs
              attention; it does not assign project ownership or approval authority.
            </p>
          </Panel>
        </div>
      </div>

      <section aria-labelledby="my-work-heading">
        <div className="mb-3">
          <h2 id="my-work-heading" className="font-display text-[1.35rem] leading-none text-maroon">
            My work
          </h2>
          <p className="mt-1 text-[12px] text-muted">
            Enquiries you claimed, approval chases, and project notes you recorded.
          </p>
        </div>
        <MyWorkPanel
          onGoEnquiries={onGoEnquiries}
          onOpenEnquiry={onOpenEnquiry}
          onOpenProject={onOpen}
        />
      </section>
    </div>
  );
}

function Overview({
  projects,
  projectsLoading,
  projectsError,
  onOpen,
  onGoEnquiries,
  onRetryProjects,
  onClearSearch,
  search,
}: {
  projects: StaffProjectSummary[];
  projectsLoading: boolean;
  projectsError: Error | null;
  onOpen: (id: string) => void;
  onGoEnquiries: () => void;
  onRetryProjects: () => void;
  onClearSearch: () => void;
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-ink/10 bg-white" />
        ))}
      </div>
    );
  }

  const { funnel, money } = data;
  const exposure = money.certifiedUnreleased + money.retentionHeld;
  const collectionRate = money.contractValue > 0 ? (money.paid / money.contractValue) * 100 : 0;
  const months = data.byMonth;

  const moneySlices: Slice[] = [
    { name: "Collected", value: money.paid, color: "var(--color-maroon)" },
    {
      name: "Certified, awaiting payment",
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
  const liveProjectCount = projects.filter(
    (project) =>
      project.source !== "sample" &&
      project.lifecycleState !== "closed" &&
      project.lifecycleState !== "archived",
  ).length;
  const inFocusCount = projects.filter(
    (project) =>
      project.source !== "sample" &&
      project.lifecycleState !== "closed" &&
      project.lifecycleState !== "archived" &&
      (project.blockedStages > 0 || project.openDecisions > 0 || !project.onTrack),
  ).length;

  return (
    <div className="space-y-5">
      {!projectsLoading && !projectsError && liveProjectCount === 0 ? (
        <Panel
          title="No live projects yet"
          subtitle="Your owner portfolio is ready. New client projects will appear here as the studio opens them."
          actions={
            <Button size="sm" variant="outline" onClick={onGoEnquiries}>
              Review enquiries
            </Button>
          }
        >
          <p className="text-[13px] leading-relaxed text-ink/60">
            The metrics below still show enquiry and financial activity. Sample, closed, and
            archived records remain separate from the live portfolio.
          </p>
        </Panel>
      ) : null}

      <Panel
        title="Owner dashboard"
        subtitle="The owner needs to see the live jobs, open decisions and money movement without digging through the details."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink/10 bg-cream/60 p-3 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Live projects</p>
            <p className="mt-2 font-display text-[1.9rem] leading-none text-maroon">
              {liveProjectCount}
            </p>
            <p className="mt-1 text-[11px] text-ink/55">active sites currently in the portfolio</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-900">
              In focus
            </p>
            <p className="mt-2 font-display text-[1.9rem] leading-none text-amber-900">
              {inFocusCount}
            </p>
            <p className="mt-1 text-[11px] text-amber-800">need a decision, review, or unblock</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-sky-200 bg-sky-50 p-3 sm:col-span-1 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-900">
              Certified to collect
            </p>
            <p className="mt-2 font-display text-[1.9rem] leading-none text-sky-900">
              {kesShort(money.certifiedUnreleased)}
            </p>
            <p className="mt-1 text-[11px] text-sky-800">
              {kes(money.certifiedUnreleased)} certified and awaiting payment
            </p>
          </div>
        </div>
      </Panel>

      {/* headline numbers */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
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
                <li
                  key={slice.name}
                  className="flex items-center justify-between gap-3 text-[13px]"
                >
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
        <ProjectsTable
          projects={projects}
          projectsLoading={projectsLoading}
          projectsError={projectsError}
          onRetryProjects={onRetryProjects}
          search={search}
          onClearSearch={onClearSearch}
          onOpen={onOpen}
          onGoEnquiries={onGoEnquiries}
        />

        <Panel
          title="Needs a human"
          subtitle={
            data.attention.length > 0 ? "Sorted by how long it has waited" : "Nothing stuck"
          }
        >
          {data.attention.length === 0 ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] leading-relaxed text-emerald-900">
              Nothing is stuck, nothing is waiting on a client, and everyone has looked at their
              project recently.
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

/**
 * Who the client is and what they have allowed.
 *
 * The consent switches are the point of this card: they are a record of
 * permission, not a preference, and the delivery layer honours them. Seeing
 * them here answers "why did my message not arrive?" without reading the
 * outbox — the switch was off, and this is who turned it.
 */
function ClientCard({ projectId }: { projectId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["staff-client", projectId],
    queryFn: () => getStaffClientProfile({ data: { projectId } }),
  });

  if (isLoading) {
    return <Loader2 className="size-5 animate-spin text-gold" aria-label="Loading client" />;
  }
  if (!data) return null;

  const consent: [string, boolean][] = [
    ["Email", data.notifyEmail],
    ["WhatsApp", data.notifyWhatsapp],
    ["SMS", data.notifySms],
    ["Site photos", data.sitePhotoConsent],
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-lg text-maroon">{data.displayName || "Not named yet"}</p>
          <div className="mt-1 space-y-0.5 text-[13px] text-ink/65">
            {data.email ? <p>{data.email}</p> : null}
            {data.phone ? <p>{data.phone}</p> : null}
            {data.city || data.country ? (
              <p>{[data.city, data.country].filter(Boolean).join(", ")}</p>
            ) : null}
            {data.company ? <p>{data.company}</p> : null}
          </div>
        </div>
        <div className="text-right text-[11px] uppercase tracking-[0.14em] text-muted">
          {data.clientType ? <p>{data.clientType}</p> : null}
          {data.timezone ? <p className="normal-case tracking-normal">{data.timezone}</p> : null}
        </div>
      </div>
      {!data.hasProfile ? (
        <p className="rounded-xl border border-ink/10 bg-ink/2 px-4 py-3 text-[12px] leading-relaxed text-ink/55">
          This project is waiting for its client to sign in and fill in their profile. Contact
          details here come from the enquiry it was opened from.
        </p>
      ) : null}
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Allowed channels</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {consent.map(([label, on]) => (
            <li
              key={label}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px]",
                on
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-ink/10 bg-ink/2 text-ink/45",
              )}
            >
              <span aria-hidden>{on ? "✓" : "✕"}</span>
              {label}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-snug text-ink/45">
          Set by the client in their portal. A channel switched off is never contacted — the outbox
          records it as suppressed rather than dropping it.
        </p>
      </div>
    </div>
  );
}

/**
 * The project's shared timeline — the same feed the client reads, so the studio
 * and the portal can never tell different stories about what happened.
 */
function StudioActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-[13px] text-ink/55">Nothing posted yet.</p>;
  }
  return (
    <ul className="divide-y divide-ink/8">
      {items.map((a) => (
        <li key={a.id} className="py-3 first:pt-0 last:pb-0">
          <p className="text-[13px] text-maroon">{a.title}</p>
          {a.body ? (
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink/60">{a.body}</p>
          ) : null}
          <p className="mt-0.5 text-[11px] text-muted">
            {new Date(a.at).toLocaleString("en-KE", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}

function IssuedDocuments({
  projectId,
  projectTitle,
  clientLabel,
  isAdmin,
  onChanged,
}: {
  projectId: string;
  projectTitle: string;
  clientLabel: string;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  const { data } = useQuery({
    queryKey: ["project-documents", projectId],
    queryFn: () => listProjectDocuments({ data: { projectId } }),
  });
  const queryClient = useQueryClient();
  // The void is a two-step action: pick the document, then say why. The reason
  // is required — a void that cannot explain itself is how a paper trail
  // loses the studio's trust — so the confirm stays disabled until it is
  // written.
  const [voiding, setVoiding] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [quoteOpen, setQuoteOpen] = useState(false);

  if (!isAdmin && (!data || data.length === 0)) return null;

  return (
    <section className="rounded-3xl border border-ink/10 bg-white p-6">
      <h3 className="font-display text-lg text-maroon">Documents issued</h3>
      <div className="mt-4">
        <DocumentFlowGuide audience="studio" />
      </div>
      {data?.length ? (
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
              <a
                href={`/admin/document/${doc.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-[12px] text-burgundy underline"
              >
                Open
              </a>
              {doc.status === "issued" && isAdmin && voiding !== doc.id ? (
                <Button size="sm" variant="ghost" onClick={() => setVoiding(doc.id)}>
                  Void
                </Button>
              ) : null}
            </span>
            {doc.status === "issued" && isAdmin && voiding === doc.id ? (
              <span className="flex w-full flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`void-${doc.id}`}>
                  Why is {doc.number} being voided?
                </label>
                <Input
                  id={`void-${doc.id}`}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Why is this being voided? (required)"
                  className="h-9 w-72 text-[12px]"
                  autoFocus
                />
                <Button
                  size="sm"
                  disabled={voidReason.trim().length < 3}
                  onClick={() => {
                    void voidDocument({
                      data: { id: doc.id, reason: voidReason.trim() },
                    })
                      .then(() => {
                        toast.success(`${doc.number} voided. Issue a corrected one.`);
                        void queryClient.invalidateQueries({
                          queryKey: ["project-documents", projectId],
                        });
                        onChanged();
                      })
                      .catch((e: unknown) =>
                        toast.error(e instanceof Error ? e.message : "Could not void."),
                      )
                      .finally(() => {
                        setVoiding(null);
                        setVoidReason("");
                      });
                  }}
                >
                  Confirm void
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setVoiding(null);
                    setVoidReason("");
                  }}
                >
                  Cancel
                </Button>
              </span>
            ) : null}
          </li>
        ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-ink/55">No quotations, certificates or receipts yet.</p>
      )}
      {isAdmin ? (
        <div className="mt-5">
          {!quoteOpen ? (
            <Button
              variant="outline"
              onClick={() => setQuoteOpen(true)}
            >
              Prepare quotation
            </Button>
          ) : (
            <QuotationComposer
              projectId={projectId}
              recipient={clientLabel || "Client"}
              projectLabel={projectTitle}
              onIssued={() => {
                void queryClient.invalidateQueries({ queryKey: ["project-documents", projectId] });
                onChanged();
              }}
              onCancel={() => setQuoteOpen(false)}
            />
          )}
        </div>
      ) : null}
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
        <h1 className="mt-6 font-display text-[1.75rem] leading-none text-maroon">Request studio access</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink/65">
          You are signed in as <strong>{me?.email || "this account"}</strong>, which is not on the
          studio access list. Ask below and an existing admin approves it — usually the same day.
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

/**
 * The card for a signed-in account the studio has already invited.
 *
 * It replaces the request form: asking would restart a conversation that is
 * already half-had — the invitation names who sent it and why, and accepting
 * is the whole remaining step. The parent re-reads the role after a
 * successful accept, which is what swaps this card for the console itself.
 */
function AcceptInviteCard({
  email,
  invite,
  onAccepted,
}: {
  email: string;
  invite: { invitedBy: string; note: string; createdAt: string };
  onAccepted: () => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center bg-stone/30 px-4 py-24">
      <div className="w-full max-w-xl rounded-3xl border border-line/50 bg-paper p-8 shadow-card">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-maroon/10 text-maroon">
          <Mail className="size-6" />
        </span>
        <h1 className="mt-6 font-display text-2xl text-maroon">
          You have been invited to the studio
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink/65">
          <strong>{invite.invitedBy}</strong> invited <strong>{email}</strong> to open the studio
          console.
          {invite.note ? <> — “{invite.note}”</> : null} Accept below and the console opens now; the
          invitation closes with it.
        </p>
        <Button
          className="mt-6"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void acceptMyInvite({ data: {} })
              .then(() => {
                toast.success("Access accepted. Welcome to the console.");
                onAccepted();
              })
              .catch((e: unknown) =>
                toast.error(e instanceof Error ? e.message : "Could not accept."),
              )
              .finally(() => setBusy(false));
          }}
        >
          Accept studio access
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
  const [role, setRole] = useState<StaffRole>("staff");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteNote, setInviteNote] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["staff-list"],
    queryFn: () => listStaff({ data: undefined }),
  });

  const members = data?.members ?? [];
  const requests = data?.requests ?? [];
  const invites = data?.invites ?? [];

  return (
    <Accordion>
      <AccordionItem title="Who can open the console" hint={`${members.length}`} defaultOpen>
        <p className="text-[12px] leading-relaxed text-ink/55">
          Access is an allowlist keyed on the address a person signs in with. Office Managers
          coordinate calls, visits, messages, and enquiries; money release, lifecycle changes, and
          access administration remain admin-only.
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
                  {m.role === "office_manager" ? "Office Manager" : m.role} · since {m.since}
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
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="mt-1"
              >
                <option value="staff">Staff</option>
                <option value="office_manager">Office Manager</option>
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

      {isAdmin || invites.length > 0 ? (
        <AccordionItem
          title="Invited, waiting to accept"
          hint={`${invites.length}`}
          defaultOpen={isAdmin || invites.length > 0}
          className="border-gold/40 bg-gold/5"
        >
          <p className="text-[12px] leading-relaxed text-ink/55">
            An invitation goes to an address and opens nothing on its own — the console opens the
            first time that address signs in and accepts. Use Grant access instead for someone who
            already has an account.
          </p>

          {isAdmin ? (
            <div className="mt-4 grid gap-3 border-t border-ink/10 pt-5 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="inv-email">Their address</Label>
                <Input
                  id="inv-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@atro.ke"
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="inv-note">Why the console</Label>
                <Input
                  id="inv-note"
                  value={inviteNote}
                  onChange={(e) => setInviteNote(e.target.value)}
                  placeholder="Site management, Karen projects"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full"
                  disabled={inviteBusy}
                  onClick={() => {
                    setInviteBusy(true);
                    void inviteStaff({ data: { email: inviteEmail, note: inviteNote } })
                      .then((r) => {
                        toast.success(
                          r.resent
                            ? `Invitation to ${r.email} sent again.`
                            : `Invitation sent to ${r.email}.`,
                        );
                        setInviteEmail("");
                        setInviteNote("");
                        void refetch();
                      })
                      .catch((e: unknown) =>
                        toast.error(e instanceof Error ? e.message : "Could not invite."),
                      )
                      .finally(() => setInviteBusy(false));
                  }}
                >
                  Send invite
                </Button>
              </div>
            </div>
          ) : null}

          {invites.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {invites.map((i) => (
                <li
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-4"
                >
                  <span className="min-w-0">
                    <span className="block text-[13px] text-maroon">{i.email}</span>
                    {i.note ? (
                      <span className="mt-1 block text-[12px] text-ink/60">{i.note}</span>
                    ) : null}
                    <span className="text-[11px] text-muted">
                      invited {new Date(i.createdAt).toLocaleDateString("en-KE")} by {i.invitedBy}
                    </span>
                  </span>
                  {isAdmin ? (
                    <span className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={inviteBusy}
                        onClick={() => {
                          setInviteBusy(true);
                          void inviteStaff({ data: { email: i.email, note: i.note } })
                            .then(() => {
                              toast.success(`Invitation to ${i.email} sent again.`);
                              void refetch();
                            })
                            .catch((e: unknown) =>
                              toast.error(e instanceof Error ? e.message : "Could not send."),
                            )
                            .finally(() => setInviteBusy(false));
                        }}
                      >
                        Resend
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={inviteBusy}
                        onClick={() => {
                          setInviteBusy(true);
                          void revokeInvite({ data: { email: i.email } })
                            .then(() => {
                              toast.success(`Invitation to ${i.email} withdrawn.`);
                              void refetch();
                            })
                            .catch((e: unknown) =>
                              toast.error(e instanceof Error ? e.message : "Could not withdraw."),
                            )
                            .finally(() => setInviteBusy(false));
                        }}
                      >
                        Withdraw
                      </Button>
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </AccordionItem>
      ) : null}

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
                      void grantStaff({
                        data: { email: r.email, role: "staff", note: "Approved from request" },
                      })
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
  { id: "work", label: "My work", title: "My work", body: "Claimed leads, chases and notes" },
  { id: "overview", label: "Today", title: "Today", body: "Studio follow-up and your work" },
  {
    id: "calendar",
    label: "Calendar",
    title: "Calendar",
    body: "Calls, site visits, and walkthroughs",
  },
  {
    id: "communications",
    label: "Communications",
    title: "Communications",
    body: "Project conversations with clients",
  },
  {
    id: "funds",
    label: "Project funds",
    title: "Project funds",
    body: "Verified receipts, expense reservations, approvals and bank references",
  },
  {
    id: "projects",
    label: "Projects",
    title: "Projects",
    body: "Everything the studio is running",
  },
  { id: "enquiries", label: "Enquiries", title: "Enquiries", body: "People who asked us to build" },
  {
    id: "profile",
    label: "My profile",
    title: "My profile",
    body: "Your studio identity and work context",
  },
  { id: "access", label: "Access", title: "Access", body: "Who can open the console" },
] as const;

type RoleState = {
  role: StaffRole | null;
  userId: string | null;
  email: string | null;
  invite: { invitedBy: string; note: string; createdAt: string } | null;
};

const NO_ROLE: RoleState = { role: null, userId: null, email: null, invite: null };

function AdminConsole() {
  const hydrated = useIsHydrated();
  const user = useCurrentUser();
  const { data: access } = useQuery({
    queryKey: ["my-access"],
    queryFn: () => getMyAccess({ data: undefined }),
    enabled: Boolean(user),
  });
  const dashboardRoute = resolveDashboardRoute({
    user,
    accessRole: access?.role ?? null,
  });
  const [roleState, setRoleState] = useState<RoleState | null>(null);
  // Bumped after an invitation is accepted, which re-runs the role fetch —
  // the accept card's whole job is to make that fetch return staff.
  const [roleNonce, setRoleNonce] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedCommunicationProjectId, setSelectedCommunicationProjectId] = useState<
    string | null
  >(null);
  const [filter, setFilter] = useState<"all" | "local" | "diaspora" | "attention" | "sample">(
    "all",
  );
  const [tab, setTab] = useState<(typeof TABS)[number]["id"] | null>(null);
  const [search, setSearch] = useState("");
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<EnquiryFilterStatus>("open");
  const [focusedEnquiryId, setFocusedEnquiryId] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getMyStaffRole({ data: undefined })
      .then((r) => live && setRoleState(r))
      .catch(() => live && setRoleState(NO_ROLE));
    return () => {
      live = false;
    };
  }, [roleNonce]);

  const isStaff =
    roleState?.role === "staff" ||
    roleState?.role === "office_manager" ||
    roleState?.role === "admin";
  const isOwner = roleState?.role === "admin";
  const isAdmin = isOwner;
  const canViewCalendar = isStaff;
  const { data: myStaffProfile } = useQuery({
    queryKey: ["my-staff-profile"],
    queryFn: () => getMyStaffProfile({ data: undefined }),
    enabled: isStaff,
  });
  // Staff land on the operational queue; admins land on the portfolio.
  // Explicit navigation always wins over this default.
  const view = tab ?? "overview";

  const {
    data: projects,
    isLoading,
    error: projectsError,
    refetch,
  } = useQuery({
    queryKey: ["staff-projects"],
    queryFn: () => listStaffProjects({ data: undefined }),
    enabled: isStaff,
  });

  const {
    data: messageThreads,
    isLoading: messageThreadsLoading,
    error: messageThreadsError,
    refetch: refetchMessageThreads,
  } = useQuery({
    queryKey: ["staff-message-threads"],
    queryFn: () => listStaffMessageThreads(),
    enabled: isStaff,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });

  const { data: overview } = useQuery({
    queryKey: ["ops-overview"],
    queryFn: () => getOpsOverview({ data: undefined }),
    enabled: isAdmin && view === "overview",
  });

  const {
    data: staffToday,
    isLoading: staffTodayLoading,
    error: staffTodayError,
    refetch: refetchStaffToday,
  } = useQuery({
    queryKey: ["staff-today"],
    queryFn: () => getStaffToday({ data: undefined }),
    enabled: isStaff && !isAdmin && view === "overview",
  });

  if (user && access && dashboardRoute === "/portal") {
    return <Navigate to="/portal" replace />;
  }

  if (!hydrated || roleState === null) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center" aria-busy>
        <Loader2 className="size-6 animate-spin text-gold" />
      </main>
    );
  }

  // Signed out: ask them to sign in. Signed in but not on the allowlist: an
  // invitation, if one is waiting, answers the question before it is asked —
  // otherwise let them request access, which is otherwise a one-way door.
  if (!isStaff) {
    if (!roleState.email) return <StaffWall />;
    return roleState.invite ? (
      <AcceptInviteCard
        email={roleState.email}
        invite={roleState.invite}
        onAccepted={() => {
          setRoleState(null);
          setRoleNonce((n) => n + 1);
        }}
      />
    ) : (
      <RequestAccessCard />
    );
  }

  const all = projects ?? [];
  const q = search.trim().toLowerCase();
  const matches = (p: StaffProjectSummary) =>
    !q ||
    [p.title, p.reference, p.clientLabel, p.clientCity, p.stage]
      .join(" ")
      .toLowerCase()
      .includes(q);

  const rows = all.filter((p) => {
    // "At home" is everyone who has not said otherwise — the flag comes from
    // the client's own profile, and silence reads as local, not as unknown.
    if (filter === "diaspora" && p.clientType !== "diaspora") return false;
    if (filter === "local" && p.clientType === "diaspora") return false;
    if (filter === "attention") {
      const isLive =
        p.source !== "sample" && p.lifecycleState !== "closed" && p.lifecycleState !== "archived";
      if (!isLive || !(p.blockedStages > 0 || p.openDecisions > 0 || !p.onTrack)) {
        return false;
      }
    }
    if (filter === "sample" && p.source !== "sample") return false;
    return matches(p);
  });
  const shellAttention = isAdmin
    ? (overview?.attention ?? [])
    : (staffToday?.attention ?? []).filter((item) =>
        all.some(
          (project) =>
            project.id === item.projectId &&
            project.source !== "sample" &&
            project.lifecycleState !== "closed" &&
            project.lifecycleState !== "archived",
        ),
      );

  const activeTab = TABS.find((t) => t.id === view) ?? TABS[0];
  const openProject = (id: string) => {
    setSelected(id);
    setTab("projects");
  };
  const openCommunication = (id: string) => {
    setSelectedCommunicationProjectId(id);
    setSelected(null);
    setTab("communications");
  };

  const shellGroups = isOwner
    ? [
        {
          title: "Executive view",
          items: [
            { id: "work", label: "Owner priorities", icon: ClipboardList },
            { id: "overview", label: "Portfolio", icon: LayoutDashboard },
            { id: "projects", label: "Projects", icon: FolderKanban, badge: all.length || undefined },
            { id: "enquiries", label: "New leads", icon: Inbox, badge: overview?.funnel.enquiriesNew || undefined },
          ],
        },
        {
          title: "Controls",
          items: [
            { id: "funds", label: "Project funds", icon: Banknote },
            { id: "communications", label: "Client updates", icon: MessageSquare, badge: messageThreads?.filter((thread) => needsStudioReply(thread.latestAuthorRole)).length || undefined },
            { id: "access", label: "Access", icon: Users },
          ],
        },
      ]
    : [
        {
          title: "Operations",
          items: [
            { id: "overview", label: "Today", icon: LayoutDashboard },
            { id: "projects", label: "Projects", icon: FolderKanban, badge: all.length || undefined },
            ...(canViewCalendar ? [{ id: "calendar", label: "Calendar", icon: CalendarClock }] : []),
            { id: "communications", label: "Client updates", icon: MessageSquare, badge: messageThreads?.filter((thread) => needsStudioReply(thread.latestAuthorRole)).length || undefined },
            { id: "profile", label: "My profile", icon: UserRound },
            { id: "enquiries", label: "New leads", icon: Inbox, badge: staffToday?.newEnquiries || undefined },
          ],
        },
      ];
  const mobileItems = (isOwner
    ? [
        { id: "work", label: "Priorities", icon: ClipboardList },
        { id: "overview", label: "Portfolio", icon: LayoutDashboard },
        { id: "projects", label: "Projects", icon: FolderKanban, badge: all.length || undefined },
        { id: "enquiries", label: "Leads", icon: Inbox, badge: overview?.funnel.enquiriesNew || undefined },
        { id: "funds", label: "Funds", icon: Banknote },
      ]
    : [
        { id: "overview", label: "Today", icon: LayoutDashboard },
        { id: "projects", label: "Projects", icon: FolderKanban, badge: all.length || undefined },
        ...(canViewCalendar ? [{ id: "calendar", label: "Calendar", icon: CalendarClock }] : []),
        {
          id: "communications",
          label: "Updates",
          icon: MessageSquare,
          badge:
            messageThreads?.filter((thread) => needsStudioReply(thread.latestAuthorRole)).length ||
            undefined,
        },
        {
          id: "enquiries",
          label: "Leads",
          icon: Inbox,
          badge: staffToday?.newEnquiries || undefined,
        },
      ]).slice(0, 4);

  return (
    <DashboardShell
      groups={shellGroups}
      mobileItems={mobileItems}
      active={view}
      onSelect={(id) => {
        setTab(id as (typeof TABS)[number]["id"]);
        setSelected(null);
      }}
      alerts={shellAttention.slice(0, 8).map((item, i) => ({
        id: `${item.projectId}-${item.kind}-${i}`,
        title: item.title,
        detail: item.detail,
        onSelect: () => openProject(item.projectId),
      }))}
      user={{
        name: myStaffProfile?.displayName || roleState?.email || "Studio",
        role:
          roleState?.role === "office_manager" ? "Office Manager" : (roleState?.role ?? undefined),
        email: roleState?.email ?? undefined,
      }}
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search projects, clients, references"
      toolbar={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-lg leading-tight text-maroon">
              {view === "overview"
                ? isOwner
                  ? "Owner dashboard"
                  : "Office dashboard"
                : activeTab.title}
            </h1>
            <p className="text-[12px] text-muted">
              {view === "overview" && isOwner
                ? "Project performance, money, approvals and the actions that matter most"
                : view === "overview"
                  ? "Today’s delivery flow, client updates and the work the team is closing"
                  : activeTab.body}
            </p>
          </div>

          {view === "projects" && !selected ? (
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ["all", "All"],
                  ["local", "At home"],
                  ["diaspora", "From abroad"],
                  ["attention", "Needs follow-up"],
                  ["sample", "Sample"],
                ] as const
              ).map(([id, label]) => (
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
      {view === "work" && isAdmin ? (
        <MyWorkPanel
          onGoEnquiries={() => setTab("enquiries")}
          onOpenEnquiry={(id) => {
            setEnquiryStatusFilter("open");
            setFocusedEnquiryId(id);
            setTab("enquiries");
          }}
          onOpenProject={openProject}
        />
      ) : null}

      {view === "calendar" && canViewCalendar ? (
        <CoordinationCalendar
          canSchedule={canScheduleProjectCalls(roleState?.role ?? null)}
          onOpenProject={openProject}
        />
      ) : null}

      {view === "communications" && isStaff ? (
        <CommunicationsInbox
          threads={messageThreads ?? []}
          isLoading={messageThreadsLoading}
          error={messageThreadsError instanceof Error ? messageThreadsError : null}
          selectedProjectId={selectedCommunicationProjectId}
          onSelectProject={setSelectedCommunicationProjectId}
          onBack={() => setSelectedCommunicationProjectId(null)}
          onRetry={() => void refetchMessageThreads()}
        />
      ) : null}

      {view === "profile" && isStaff ? <StaffProfilePanel /> : null}
      {view === "funds" && isAdmin ? (
        <ProjectExpensesPanel staffEmail={roleState?.email ?? ""} />
      ) : null}

      {view === "overview" && isAdmin ? (
        <Overview
          projects={all}
          projectsLoading={isLoading}
          projectsError={projectsError instanceof Error ? projectsError : null}
          onOpen={openProject}
          onGoEnquiries={() => setTab("enquiries")}
          onRetryProjects={() => void refetch()}
          onClearSearch={() => setSearch("")}
          search={search}
        />
      ) : null}
      {view === "overview" && !isAdmin ? (
        <StaffToday
          projects={all}
          today={staffToday}
          todayLoading={staffTodayLoading}
          todayError={staffTodayError instanceof Error ? staffTodayError : null}
          projectsLoading={isLoading}
          projectsError={projectsError instanceof Error ? projectsError : null}
          onRetryToday={() => void refetchStaffToday()}
          onRetryProjects={() => void refetch()}
          onOpen={openProject}
          onOpenEnquiry={(id) => {
            setEnquiryStatusFilter("open");
            setFocusedEnquiryId(id);
            setTab("enquiries");
          }}
          onGoEnquiries={() => setTab("enquiries")}
          onGoNewEnquiries={() => {
            setEnquiryStatusFilter("new");
            setTab("enquiries");
          }}
          onGoProjects={() => {
            setFilter("all");
            setTab("projects");
          }}
          onGoAttentionProjects={() => {
            setFilter("attention");
            setTab("projects");
          }}
        />
      ) : null}

      {view === "enquiries" ? (
        <EnquiriesInbox
          statusFilter={enquiryStatusFilter}
          onStatusFilterChange={setEnquiryStatusFilter}
          focusEnquiryId={focusedEnquiryId}
          onFocusEnquiryHandled={() => setFocusedEnquiryId(null)}
        />
      ) : null}

      {view === "access" && isAdmin ? <AccessPanel isAdmin={isAdmin} /> : null}

      {view === "projects" && selected ? (
        <ProjectDetail
          projectId={selected}
          clientType={all.find((x) => x.id === selected)?.clientType}
          isAdmin={isAdmin}
          onBack={() => setSelected(null)}
          onChanged={() => void refetch()}
          onOpenMessages={() => openCommunication(selected)}
        />
      ) : view === "projects" && projectsError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
        >
          <AlertTriangle className="mx-auto size-7 text-red-700" aria-hidden />
          <h2 className="mt-3 font-display text-xl text-red-900">Could not load projects</h2>
          <p className="mx-auto mt-2 max-w-lg text-[13px] leading-relaxed text-red-800">
            {projectsError instanceof Error
              ? projectsError.message
              : "The project register is unavailable right now."}
          </p>
          <Button
            className="mt-4"
            size="sm"
            variant="outline"
            onClick={() => void refetch()}
            disabled={isLoading}
          >
            Try again
          </Button>
        </div>
      ) : view === "projects" && isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-gold" />
        </div>
      ) : view === "projects" && rows.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
          <Inbox className="size-8 text-ink/25" aria-hidden />
          <h2 className="mt-4 font-display text-xl text-maroon">
            {q
              ? "Nothing matches that search"
              : filter !== "all"
                ? "No projects in this view"
                : "Your project register is clear"}
          </h2>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink/55">
            {q
              ? `No project, client or reference contains “${search.trim()}”.`
              : filter !== "all"
                ? `No projects currently match the ${filter === "local" ? "At home" : filter === "diaspora" ? "From abroad" : filter === "attention" ? "Needs follow-up" : "Sample"} filter. Try All to review the full register.`
                : "New projects appear here when a client opens their portal or the studio creates a project from an enquiry."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {q ? (
              <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            ) : filter !== "all" ? (
              <Button size="sm" variant="outline" onClick={() => setFilter("all")}>
                Show all projects
              </Button>
            ) : isAdmin ? (
              <Button size="sm" variant="outline" onClick={() => setTab("enquiries")}>
                Review enquiries
              </Button>
            ) : null}
          </div>
        </div>
      ) : view === "projects" ? (
        isAdmin ? (
          <ProjectsTable
            projects={rows}
            onOpen={setSelected}
            onGoEnquiries={() => setTab("enquiries")}
          />
        ) : (
          <StaffProjectsDirectory projects={rows} onOpen={setSelected} />
        )
      ) : null}
    </DashboardShell>
  );
}
