import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  FileCheck2,
  FileDiff,
  FolderOpen,
  Globe,
  Hourglass,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  MessageSquareWarning,
  SlidersHorizontal,
  UsersRound,
  UserRound,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import { Gauge, type Slice } from "@/components/dashboard/charts";
import { DashboardShell } from "@/components/dashboard/shell";
import { ProfilePanel } from "@/components/profile/profile-panel";
import { ProjectCircleOwnerPanel } from "@/components/project-circle/project-circle-panels";
import { ClientProjectTeamPanel } from "@/components/dashboard/project-team-panel";
import { SelectionsPanel } from "@/components/dashboard/selections-panel";
import { listMySelections } from "@/lib/selections-server";
import { ApprovalsPanel } from "@/components/dashboard/approvals-panel";
import { KIND_LABEL } from "@/lib/invoices";
import { CONTRACTOR, PROFESSIONALS } from "@/lib/diaspora/portal";
import { usesMeasuredWorkCertification } from "@/lib/diaspora/tracks";
import type { Decision, Milestone, Payment } from "@/lib/diaspora/portal";
import { EvidencePanel } from "@/components/dashboard/evidence-panel";
import { MessagesPanel } from "@/components/dashboard/messages-panel";
import { listMyMessages } from "@/lib/messages-server";
import { unreadFor } from "@/lib/messages";
import { AfterHandoverPanel } from "@/components/dashboard/after-handover-panel";
import { ClientProjectFilesPanel } from "@/components/dashboard/client-project-files-panel";
import { listMyAfterHandover } from "@/lib/defects-server";
import { awaitingClient, daysLeft } from "@/lib/defects";
import { VariationsPanel } from "@/components/dashboard/variations-panel";
import { listMyVariations } from "@/lib/variations-server";
import { countAwaiting } from "@/lib/variations";
import { AbroadPanel } from "@/components/dashboard/abroad-panel";
import { AbroadHomeBand, LocalHomeBand } from "@/components/dashboard/home-band";
import {
  ClientCalendarPanel,
  VisitPanel,
  WalkthroughPanel,
} from "@/components/dashboard/presence-panel";
import { formatDay } from "@/lib/presence";
import { clientZone, isHomeZone, zonedClock } from "@/lib/tz";
import { getMyProfile } from "@/lib/profile-server";
import type { ActivityItem, PortalPayload, ProjectSummary } from "@/lib/diaspora/server";
import type { DocumentSummary } from "@/lib/invoice-server";
import { cn } from "@/lib/utils";
import { getMyDecisionVisualUrl } from "@/lib/decision-visuals-server";
import { DashboardBackLink } from "@/components/dashboard/shell";

/**
 * The client's side of the same dashboard.
 *
 * The Overview surfaces progress, money, evidence, and the client's next action.
 * Local and diaspora clients share project access while getting different
 * coordination tools.
 */

const KES = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
const kes = (n: number) => `KES ${KES.format(n)}`;
const kesShort = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `KES ${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `KES ${Math.round(n / 1_000)}k`;
  return `KES ${KES.format(n)}`;
};

const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  certified: {
    label: "Ready for payment",
    cls: "bg-amber-50 text-amber-900 border-amber-300",
  },
  due: { label: "Awaiting stage confirmation", cls: "bg-sky-50 text-sky-900 border-sky-300" },
  scheduled: { label: "Scheduled", cls: "bg-stone/100 text-stone-600 border-stone-200" },
  retained: { label: "Held in retention", cls: "bg-burgundy/10 text-burgundy border-burgundy/25" },
};

const DOC_TONE: Record<string, string> = {
  certificate: "bg-sky-50 text-sky-900 border-sky-300",
  invoice: "bg-amber-50 text-amber-900 border-amber-300",
  receipt: "bg-emerald-50 text-emerald-800 border-emerald-200",
  statement: "bg-stone/100 text-stone-700 border-stone-300",
};

type Section =
  | "overview"
  | "calendar"
  | "approvals"
  | "selections"
  | "milestones"
  | "money"
  | "changes"
  | "documents"
  | "decisions"
  | "messages"
  | "after-handover"
  | "abroad"
  | "people"
  | "profile";

const SECTION_GUIDANCE: Record<Exclude<Section, "overview">, string> = {
  calendar:
    "See confirmed appointments and requests waiting for the studio. Request a site visit or walkthrough here; it appears as pending until the team confirms it.",
  approvals:
    "Follow permits, authority responses and related fees here. ATRO manages submissions and follow-up; this page keeps you informed.",
  selections:
    "Compare each product or finish against its contract allowance. Choose your preferred option and record it; anything over allowance comes back as a contract change to approve.",
  milestones:
    "Your project team records each stage's status and posts dated site photos and notes; you do not need to enter progress percentages. Review the evidence here. When a stage is ready, choose Approve stage to sign it off, mark it complete and open the next stage. If anything is unclear, message your project manager before approving.",
  money:
    "Review your budget and payment records. Pay only a stage marked ready for payment; a receipt appears after the payment is confirmed.",
  changes:
    "Review the price and programme impact of each proposed contract change. Nothing changes until you approve it.",
  decisions:
    "Review the options, cost impact and reply date. Choose an option and record your decision to add it to the project log.",
  documents:
    "Upload project documents for the team to review, then read their response here. Issued certificates and payment documents remain available below.",
  messages:
    "Ask your project manager a question or attach a file. Messages stay in this project thread for you and the team to refer back to.",
  "after-handover":
    "Check your defect-reporting period, report an issue, and confirm once the studio marks a repair as fixed.",
  abroad:
    "See remote-project guidance, local-time call details and contact preferences. Set your timezone and notification choices in Profile.",
  people:
    "See your named ATRO contacts and their project roles. You can message them here, or invite a trusted representative with limited access.",
  profile: "Keep your contact details, timezone and notification preferences up to date.",
};

export function ClientDashboard({
  data,
  experience,
  firstVisit,
  onPay,
  onApprove,
  onDecide,
  onReloaded,
  pending,
  documents,
  nudges,
  children,
  readOnly = false,
}: {
  data: PortalPayload;
  experience: "local" | "diaspora";
  firstVisit: string | null;
  onPay: (paymentId: string) => void;
  onApprove: (milestoneId: string) => void;
  onDecide: (decisionId: string, chosen: string) => void;
  /** Called when a write lands on the client side, so the portal can refetch. */
  onReloaded?: () => void;
  pending: string;
  documents: DocumentSummary[];
  /** Open decisions the client has not answered. */
  nudges: { decisionId: string; title: string; ageDays: number }[];
  readOnly?: boolean;
  /** "Open a project" and friends, supplied by the route. */
  children?: React.ReactNode;
}) {
  const [section, setSection] = useState<Section>("overview");
  const activityRef = useRef<HTMLDivElement>(null);
  const p = data.project;
  const measuredWork = usesMeasuredWorkCertification(p.track);
  const payablePayment = data.payments.find((payment) => payment.status === "certified") ?? null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);

  // The selected portal experience controls navigation; the profile timezone
  // still controls how dates and times are presented.
  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile({ data: undefined }),
  });
  const abroad = experience === "diaspora";
  const zone = clientZone(profile?.timezone ?? "", p.clientTz);

  const {
    data: selections,
    isLoading: selectionsLoading,
    error: selectionsError,
  } = useQuery({
    queryKey: ["my-selections", p.id],
    queryFn: () => listMySelections({ data: { projectId: p.id } }),
  });
  const selectionsWaiting = (selections ?? []).filter((s) => s.status === "open");
  const openSelections = selectionsWaiting.length;

  const { data: messages } = useQuery({
    queryKey: ["my-messages", p.id],
    queryFn: () => listMyMessages({ data: { projectId: p.id } }),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
  const unreadMessages = unreadFor(messages ?? [], "client");

  const {
    data: variations,
    isLoading: variationsLoading,
    error: variationsError,
  } = useQuery({
    queryKey: ["my-variations", p.id],
    queryFn: () => listMyVariations({ data: { projectId: p.id } }),
  });
  const changesWaiting = countAwaiting(variations ?? []);

  const {
    data: afterHandover,
    isLoading: afterHandoverLoading,
    error: afterHandoverError,
  } = useQuery({
    queryKey: ["my-after-handover", p.id],
    queryFn: () => listMyAfterHandover({ data: { projectId: p.id } }),
  });
  const repairsAwaitingClient = (afterHandover?.defects ?? []).filter((d) =>
    awaitingClient(d.status),
  );
  const awaitingFixCheck = repairsAwaitingClient.length;
  const checkingActions = selectionsLoading || variationsLoading || afterHandoverLoading;
  const actionCheckError = selectionsError || variationsError || afterHandoverError;
  const periodDaysLeft = daysLeft(afterHandover?.periodEnd ?? "", new Date());

  const b = p.budget;

  const openDecisions = data.decisions.filter((d) => d.state !== "decided");
  const datedDecisions = openDecisions.filter((decision) => decision.dueDate);
  const datedPayments = data.payments.filter(
    (payment) =>
      (payment.status === "due" || payment.status === "scheduled") &&
      payment.dueDate.trim().length > 0,
  );
  const payablePayments = data.payments.filter((x) => x.status === "certified");
  // Only stages the studio has marked ready can be approved from the overview.
  const awaitingApproval = data.milestones.filter(
    (m) => m.approvalReady === true && (m.status === "active" || m.status === "blocked"),
  );
  const newActivity = data.activity.filter((a) => firstVisit && a.at > firstVisit);
  const activityToShow = abroad && newActivity.length > 0 ? newActivity : data.activity.slice(0, 8);

  const moneySlices: Slice[] = [
    { name: "Payments received", value: b.paidToDate, color: "var(--color-maroon)" },
    {
      name: measuredWork ? "Certified work, ready to pay" : "Approved stages, ready to pay",
      value: b.currentlyCertified,
      color: "var(--color-gold)",
    },
    { name: "Held in retention", value: b.retentionHeld, color: "var(--color-burgundy)" },
    {
      name: "Not yet due",
      value: Math.max(0, p.contractValue - b.paidToDate - b.currentlyCertified - b.retentionHeld),
      color: "rgba(60,5,8,0.10)",
    },
  ];
  const moneyTotal = moneySlices.reduce((sum, d) => sum + d.value, 0);

  const collected = p.contractValue > 0 ? (b.paidToDate / p.contractValue) * 100 : 0;

  const projectTabs = [
    { id: "overview", label: "Overview", mobileLabel: "Home", icon: LayoutDashboard },
    {
      id: "milestones",
      label: "Progress",
      mobileLabel: "Progress",
      icon: ListChecks,
      badge: awaitingApproval.length || undefined,
    },
    {
      id: "decisions",
      label: "Decisions",
      mobileLabel: "Decide",
      icon: MessageSquareWarning,
      badge: openDecisions.length || undefined,
    },
    {
      id: "money",
      label: "Payments",
      mobileLabel: "Pay",
      icon: CreditCard,
      badge: payablePayments.length || undefined,
    },
    {
      id: "messages",
      label: "Messages",
      mobileLabel: "Messages",
      icon: MessageSquare,
      badge: unreadMessages || undefined,
    },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "approvals", label: "Permits", icon: FileCheck2 },
    {
      id: "selections",
      label: "Choices",
      icon: SlidersHorizontal,
      badge: openSelections || undefined,
    },
    {
      id: "changes",
      label: "Changes",
      icon: FileDiff,
      badge: changesWaiting || undefined,
    },
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "people", label: "Project team", icon: UsersRound },
    {
      id: "after-handover",
      label: "After handover",
      icon: Wrench,
      badge: awaitingFixCheck || undefined,
    },
    ...(abroad ? [{ id: "abroad", label: "Remote support", icon: Globe }] : []),
  ];

  const projectGroups = [
    {
      title: "Your project",
      items: projectTabs.filter((item) =>
        ["overview", "milestones", "messages", "calendar", "documents", "people"].includes(item.id),
      ),
    },
    {
      title: "Actions & records",
      items: projectTabs.filter((item) =>
        ["decisions", "money", "approvals", "selections", "changes", "after-handover"].includes(
          item.id,
        ),
      ),
    },
    ...(abroad
      ? [
          {
            title: "Support",
            items: projectTabs.filter((item) => item.id === "abroad"),
          },
        ]
      : []),
  ];

  return (
    <DashboardShell
      groups={[
        ...projectGroups,
        {
          title: "You",
          items: [{ id: "profile", label: "Profile", icon: UserRound }],
        },
      ]}
      mobileItems={projectTabs.filter((item) =>
        ["overview", "milestones", "decisions", "money", "messages"].includes(item.id),
      )}
      mobileNavMode="grid"
      active={section}
      onSelect={(id) => setSection(id as Section)}
      alerts={[
        ...openDecisions.map((d) => ({
          id: d.id,
          title: d.title,
          detail: "Waiting on your decision",
          onSelect: () => setSection("decisions"),
        })),
        ...(periodDaysLeft !== null && periodDaysLeft > 0 && periodDaysLeft <= 14
          ? [
              {
                id: "defect-period",
                title: `Defect period ends in ${periodDaysLeft} days`,
                detail: `Report anything before ${afterHandover?.periodEnd ?? ""}`,
                onSelect: () => setSection("after-handover" as Section),
              },
            ]
          : []),
      ]}
      user={{ name: p.clientLabel || "Your account", email: p.clientLabel }}
      readOnly={readOnly}
      toolbar={
        <div className="grid grid-cols-2 items-center gap-x-3 gap-y-2 sm:gap-y-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="col-span-2 row-start-1 min-w-0 text-center md:col-span-1 md:col-start-2">
            <h1 className="flex flex-wrap items-center justify-center gap-2 font-display text-lg leading-tight text-maroon">
              {p.title}
            </h1>
            <p className="text-[12px] text-muted">
              <span className="font-mono">{p.reference}</span> · {p.stage} · {p.targetLabel}{" "}
              handover
            </p>
          </div>
          <DashboardBackLink
            to={abroad ? "/diaspora" : "/"}
            className="col-start-1 row-start-2 justify-self-start md:col-start-1 md:row-start-1"
          >
            Back to {abroad ? "diaspora" : "Kenya"} site
          </DashboardBackLink>
          <div className="col-start-2 row-start-2 justify-self-end md:col-start-3 md:row-start-1">
            {children}
          </div>
        </div>
      }
    >
      {section !== "overview" ? (
        <div
          role="note"
          className="mb-5 rounded-xl border border-ink/10 bg-white px-4 py-3 text-[13px] leading-relaxed text-ink/65"
        >
          <span className="font-semibold text-maroon">How to use this section: </span>
          {SECTION_GUIDANCE[section]}
        </div>
      ) : null}

      {section === "overview" ? (
        <div className="space-y-5">
          {/* Two homes, one dashboard: which band opens the page is the whole
              point of Step 22 — the facts a distant client needs first are not
              the facts a client ten minutes away needs first. */}
          {abroad ? (
            <AbroadHomeBand
              project={p}
              zone={zone}
              payablePayment={payablePayment}
              readOnly={readOnly}
              away={{
                activity: newActivity.length,
                messages: unreadMessages,
                decisions: openDecisions.length,
              }}
              onGo={(s) => setSection(s as Section)}
              onGoActivity={() => {
                activityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                activityRef.current?.focus({ preventScroll: true });
              }}
              onGoMoney={() => setSection("money")}
            />
          ) : (
            <LocalHomeBand
              project={p}
              payablePayment={payablePayment}
              readOnly={readOnly}
              onGoMoney={() => setSection("money")}
              onGoMessages={() => setSection("messages")}
            />
          )}

          <Panel
            title="What needs your action"
            subtitle="Open decisions, choices, payment stages and items ready for your review."
          >
            {nudges.length > 0 ? (
              <p className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
                {nudges.length} decision{nudges.length === 1 ? "" : "s"} still open.
                {oldestNudge(nudges) > 0
                  ? ` The oldest has been waiting ${oldestNudge(nudges)} days.`
                  : ""}{" "}
                {abroad
                  ? "The team keeps working, but the decision still needs your answer."
                  : "Some work may be waiting on your answer; the team can keep other work moving."}
              </p>
            ) : null}
            <ul className="space-y-2">
              {actionCheckError ? (
                <li
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-relaxed text-red-800"
                >
                  We could not check every project action. Refresh this page or open Choices,
                  Changes and After handover to check those records.
                </li>
              ) : null}
              {checkingActions ? (
                <li
                  role="status"
                  className="rounded-xl border border-ink/10 px-4 py-3 text-[13px] text-ink/60"
                >
                  Checking for choices, contract changes and repair checks…
                </li>
              ) : null}
              {!actionCheckError &&
              !checkingActions &&
              openDecisions.length === 0 &&
              payablePayments.length === 0 &&
              awaitingApproval.length === 0 &&
              openSelections === 0 &&
              changesWaiting === 0 &&
              awaitingFixCheck === 0 ? (
                <li className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] leading-relaxed text-emerald-900">
                  Nothing is waiting on you. The project keeps moving either way.
                </li>
              ) : null}

              {openDecisions.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => setSection("decisions")}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-left transition-colors hover:border-amber-500"
                  >
                    <span className="min-w-0">
                      <span className="block text-[13px] text-maroon">{d.title}</span>
                      <span className="mt-0.5 block text-[11px] text-ink/55">
                        {abroad ? "Decision waiting from abroad" : "A decision is waiting on you"}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.1em] text-amber-900">
                      Decide
                    </span>
                  </button>
                </li>
              ))}

              {payablePayments.map((pay) => (
                <li
                  key={pay.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 p-3"
                >
                  <span className="min-w-0">
                    <span className="block text-[13px] text-maroon">{pay.label}</span>
                    <span className="mt-0.5 block text-[11px] text-ink/55">
                      {measuredWork
                        ? "Inspected work certified; ready for payment"
                        : "Agreed stage approved; ready for payment"}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-[13px] text-maroon">{kes(pay.amount)}</span>
                    <Button
                      size="sm"
                      disabled={pending === `pay-${pay.id}`}
                      onClick={() => onPay(pay.id)}
                    >
                      {pay.checkoutStatus === "pending"
                        ? "Continue securely"
                        : pay.checkoutStatus === "failed" || pay.checkoutStatus === "expired"
                          ? "Try again securely"
                          : "Pay securely"}
                    </Button>
                  </span>
                </li>
              ))}

              {awaitingApproval.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 p-3"
                >
                  <span className="min-w-0">
                    <span className="block text-[13px] text-maroon">{m.name}</span>
                    <span className="mt-0.5 block text-[11px] text-ink/55">
                      {m.status === "blocked"
                        ? "The studio marked this stage ready, but it is also blocked."
                        : "The studio marked this stage ready for your review."}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-[12px] text-ink/55">{m.progress}%</span>
                    <Button size="sm" variant="outline" onClick={() => setSection("milestones")}>
                      Review progress
                    </Button>
                  </span>
                </li>
              ))}

              {selectionsWaiting.map((selection) => (
                <li key={`selection-${selection.id}`}>
                  <button
                    type="button"
                    onClick={() => setSection("selections")}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-left transition-colors hover:border-amber-500"
                  >
                    <span className="min-w-0">
                      <span className="block text-[13px] text-maroon">{selection.title}</span>
                      <span className="mt-0.5 block text-[11px] text-ink/55">
                        Choose an option to let the studio finalize this selection
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.1em] text-amber-900">
                      Choose
                    </span>
                  </button>
                </li>
              ))}

              {changesWaiting > 0 ? (
                <li>
                  <button
                    type="button"
                    onClick={() => setSection("changes")}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-left transition-colors hover:border-amber-500"
                  >
                    <span className="min-w-0">
                      <span className="block text-[13px] text-maroon">
                        {changesWaiting} contract change{changesWaiting === 1 ? "" : "s"} to review
                      </span>
                      <span className="mt-0.5 block text-[11px] text-ink/55">
                        Check the cost and time impact before deciding
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.1em] text-amber-900">
                      Review
                    </span>
                  </button>
                </li>
              ) : null}

              {repairsAwaitingClient.map((defect) => (
                <li key={`defect-${defect.id}`}>
                  <button
                    type="button"
                    onClick={() => setSection("after-handover")}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-left transition-colors hover:border-amber-500"
                  >
                    <span className="min-w-0">
                      <span className="block text-[13px] text-maroon">{defect.title}</span>
                      <span className="mt-0.5 block text-[11px] text-ink/55">
                        The studio marked this repair fixed; please check it
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.1em] text-amber-900">
                      Check repair
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Dates to watch" subtitle="Decision reply dates and scheduled payment dates">
            {datedDecisions.length === 0 && datedPayments.length === 0 ? (
              <p className="text-[13px] text-ink/55">
                No explicit decision or payment dates are recorded. The studio will update this list
                when a date is set.
              </p>
            ) : (
              <ul className="space-y-2">
                {datedDecisions.map((decision) => (
                  <li key={`decision-${decision.id}`}>
                    <button
                      type="button"
                      onClick={() => setSection("decisions")}
                      className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/10 p-3 text-left hover:border-gold"
                    >
                      <span className="text-[13px] text-maroon">{decision.title}</span>
                      <span className="text-[12px] text-ink/55">
                        Reply by {formatDay(decision.dueDate ?? null) ?? decision.dueDate}
                      </span>
                    </button>
                  </li>
                ))}
                {datedPayments.map((payment) => (
                  <li key={`payment-${payment.id}`}>
                    <button
                      type="button"
                      onClick={() => setSection("money")}
                      className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/10 p-3 text-left hover:border-gold"
                    >
                      <span className="text-[13px] text-maroon">{payment.label}</span>
                      <span className="text-[12px] text-ink/55">
                        {payment.status === "due" ? "Due" : "Scheduled"} {payment.dueDate}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Overall completion"
              value={`${p.progress}%`}
              sub={`${p.stage} · day ${p.schedule.daysElapsed} of ${p.schedule.daysTotal}`}
              icon={ClipboardCheck}
            />
            <StatCard
              label="Contract value"
              value={kesShort(p.contractValue)}
              exact={kes(p.contractValue)}
              sub={`${collected.toFixed(0)}% collected so far`}
              icon={Banknote}
            />
            <StatCard
              label="Paid to date"
              value={kesShort(b.paidToDate)}
              exact={kes(b.paidToDate)}
              sub={
                b.projectedAtCompletion > 0
                  ? `Projection at completion ${kes(b.projectedAtCompletion)}`
                  : "No variation recorded"
              }
              icon={CheckCircle2}
              tone="good"
            />
            <StatCard
              label={payablePayments.length > 0 ? "Ready to pay" : "Committed, not paid"}
              value={
                payablePayments.length > 0
                  ? kesShort(b.currentlyCertified)
                  : kesShort(b.currentlyCertified + b.retentionHeld)
              }
              exact={kes(b.currentlyCertified + b.retentionHeld)}
              sub={
                payablePayments.length > 0
                  ? `${payablePayments.length} payment stage${payablePayments.length === 1 ? "" : "s"} ready for payment`
                  : `${kes(b.retentionHeld)} of it is retention, payable after defects`
              }
              icon={Hourglass}
              tone={payablePayments.length > 0 ? "warn" : "default"}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Where your money stands" subtitle="Against the priced contract">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,190px)_1fr] sm:items-center">
                <Gauge value={collected} label="collected" height={150} />
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
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
            <MilestonePanel
              milestones={data.milestones}
              onApprove={onApprove}
              pending={pending}
              onOpenAll={() => setSection("milestones")}
              allowApprove={false}
            />

            <Panel
              title="Who is responsible"
              subtitle="Named, with the registration number that governs their work"
            >
              <p className="text-[13px] leading-relaxed text-ink/65">{CONTRACTOR.note}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {PROFESSIONALS.map((pro) => (
                  <li key={pro.regNo} className="rounded-xl border border-ink/10 p-4">
                    <p className="font-display text-lg text-maroon">{pro.name}</p>
                    <p className="mt-0.5 text-[12px] text-burgundy">{pro.role}</p>
                    <p className="mt-2 font-mono text-[11px] text-ink/60">{pro.regNo}</p>
                    <a
                      href={pro.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-gold hover:text-maroon"
                    >
                      Verify at {new URL(pro.verifyUrl).hostname.replace(/^www\./, "")} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>

            <div
              ref={activityRef}
              tabIndex={-1}
              className="scroll-mt-6 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon focus-visible:ring-offset-2"
            >
              <Panel
                title="Recent activity"
                subtitle={
                  abroad && newActivity.length > 0
                    ? `All ${newActivity.length} updates since your last visit`
                    : undefined
                }
                bodyClassName="p-0"
              >
                <ActivityFeed items={activityToShow} />
              </Panel>
            </div>
          </div>
        </div>
      ) : null}

      {section === "approvals" ? <ApprovalsPanel projectId={p.id} /> : null}
      {section === "calendar" ? (
        <div className="space-y-5">
          <ClientCalendarPanel projectId={p.id} nextCall={p.nextCall} zone={zone} />
          {abroad ? (
            <WalkthroughPanel projectId={p.id} />
          ) : (
            <VisitPanel
              projectId={p.id}
              zone={zone}
              activeMilestoneName={data.milestones.find((m) => m.status === "active")?.name ?? null}
            />
          )}
        </div>
      ) : null}

      {section === "selections" ? (
        <SelectionsPanel projectId={p.id} onChanged={() => void onReloaded?.()} />
      ) : null}

      {section === "milestones" ? (
        <div className="space-y-5">
          <ProgrammePanel project={p} zone={zone} />
          <EvidencePanel projectId={p.id} />
          <MilestonePanel milestones={data.milestones} onApprove={onApprove} pending={pending} />
        </div>
      ) : null}

      {section === "money" ? (
        <div className="space-y-5">
          <Panel
            title="Project funds"
            subtitle="Each verified payment belongs to this project ledger"
          >
            <p className="text-[13px] leading-relaxed text-ink/65">
              {measuredWork
                ? "For construction and renovation, pay only against work inspected and certified under your agreement."
                : "Pay only after ATRO confirms the agreed deliverable or fee stage under your signed engagement."}{" "}
              Checkout opens securely with Paystack; the project is marked paid and a receipt is
              issued only after Paystack confirms the exact amount in KES.
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-ink/55">
              Paystack hosts the checkout; ATRO does not handle your card details in this portal.
              Keep the Paystack reference for your records. Payment date, reference, channel, and
              receipt are recorded here after verification.
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-ink/55">
              Paystack settles to the merchant bank account configured by ATRO. This project ledger
              records your project’s payments separately; it is not a separate bank or escrow
              account.
            </p>
          </Panel>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Your budget" subtitle="Open book — every line is inspectable">
              <dl className="space-y-3">
                {[
                  ["Contract value (BOQ priced)", kes(p.contractValue), false],
                  [
                    measuredWork ? "Work certified to date" : "Stages approved to date",
                    kes(b.certifiedToDate),
                    false,
                  ],
                  ["Paid to date", kes(b.paidToDate), false],
                  [
                    measuredWork
                      ? "Certified, awaiting payment"
                      : "Approved stages awaiting payment",
                    kes(b.currentlyCertified),
                    true,
                  ],
                  [`Retention held (${b.retentionPct}%)`, kes(b.retentionHeld), true],
                ].map(([k, v, highlight]) => (
                  <div
                    key={String(k)}
                    className="flex items-baseline justify-between gap-4 border-b border-ink/8 pb-3"
                  >
                    <dt className="text-[13px] text-ink/60">{k}</dt>
                    <dd className={cn("text-[14px]", highlight ? "text-burgundy" : "text-maroon")}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              {b.projectedAtCompletion > 0 ? (
                <div className="mt-5 rounded-2xl bg-maroon p-5 text-paper">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                    Projection at completion
                  </p>
                  <p className="mt-2 font-display text-2xl">{kes(b.projectedAtCompletion)}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-paper/70">
                    A projected{" "}
                    {(((b.projectedAtCompletion - p.boqValue) / p.boqValue) * 100).toFixed(1)}%
                    above contract. Every variation behind that figure is itemised in the decision
                    log — there are no unapproved variations on this project.
                  </p>
                </div>
              ) : null}
            </Panel>

            <Panel
              title="Payment ledger"
              subtitle="Pay for work, not promises"
              className="min-w-0"
              bodyClassName="p-0"
            >
              <PaymentTable
                payments={data.payments}
                onPay={onPay}
                pending={pending}
                measuredWork={measuredWork}
                readOnly={readOnly}
              />
            </Panel>
          </div>

        </div>
      ) : null}

      {section === "decisions" ? (
        <DecisionsPanel
          projectId={p.id}
          decisions={data.decisions}
          onDecide={onDecide}
          pending={pending}
        />
      ) : null}

      {section === "documents" ? (
        <VaultPanel
          projectId={p.id}
          documents={documents}
          projects={data.projects}
          experience={experience}
          measuredWork={measuredWork}
        />
      ) : null}

      {section === "changes" ? <VariationsPanel project={p} onChanged={onReloaded} /> : null}

      {section === "after-handover" ? (
        <AfterHandoverPanel projectId={p.id} onChanged={onReloaded} />
      ) : null}

      {section === "messages" ? (
        <MessagesPanel
          projectId={p.id}
          clientName={p.clientLabel}
          onChanged={() => void onReloaded?.()}
        />
      ) : null}

      {section === "profile" ? <ProfilePanel /> : null}

      {section === "people" ? (
        <>
          <ClientProjectTeamPanel
            projectId={p.id}
            disabled={p.isSample}
            onOpenMessages={() => setSection("messages")}
          />
          <ProjectCircleOwnerPanel projectId={p.id} experience={experience} disabled={p.isSample} />
        </>
      ) : null}

      {section === "abroad" ? (
        <AbroadPanel
          project={p}
          milestones={data.milestones}
          onOpenProfile={() => setSection("profile")}
          onOpenOverview={() => setSection("overview")}
        />
      ) : null}
    </DashboardShell>
  );
}

const oldestNudge = (nudges: { ageDays: number }[]) => Math.max(0, ...nudges.map((n) => n.ageDays));

function ProgrammePanel({ project, zone }: { project: PortalPayload["project"]; zone: string }) {
  const items: [string, string][] = [
    ["Client", project.clientLabel],
    ["Engagement", project.contractType],
    ["Plot", project.plot || "—"],
    ["Area", project.area || "—"],
    ["Started", project.startedLabel],
    ["Target handover", project.targetLabel],
    ["Stage", project.stage],
    ["Your city", project.clientCity || "—"],
  ];

  // "Your time" is a conversion, not a caption: computed from the stored
  // instant against the client's zone, hidden when their clock is EAT (the
  // line would only repeat the site's), and only falling back to the old
  // hand-typed text for projects that predate the instant being stored.
  const clock =
    project.nextCall.at && zone && !isHomeZone(zone) ? zonedClock(project.nextCall.at, zone) : null;
  const yourTime = clock
    ? `${clock.clock} ${clock.zone}`
    : !project.nextCall.at &&
        project.nextCall.localTimeForYou &&
        project.nextCall.localTimeForYou !== "To be scheduled"
      ? project.nextCall.localTimeForYou
      : "";

  return (
    <Panel
      title="Programme"
      subtitle={`Day ${project.schedule.daysElapsed} of ${project.schedule.daysTotal}`}
    >
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([k, v]) => (
          <div key={k}>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{k}</dt>
            <dd className="mt-1.5 text-[13px] leading-snug text-ink/75">{v}</dd>
          </div>
        ))}
      </dl>

      <div
        className={cn(
          "mt-5 rounded-2xl p-5",
          project.schedule.onTrack ? "bg-emerald-50" : "bg-amber-50",
        )}
      >
        <p
          className={cn(
            "text-[12px] font-bold uppercase tracking-[0.14em]",
            project.schedule.onTrack ? "text-emerald-800" : "text-amber-900",
          )}
        >
          Programme status
        </p>
        <p
          className={cn(
            "mt-2 text-[14px] leading-relaxed",
            project.schedule.onTrack ? "text-emerald-900" : "text-amber-900",
          )}
        >
          {project.schedule.onTrack ? "On track. " : "Needs attention. "}
          {project.schedule.note}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-ink/10 bg-cream p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">Next call</p>
        <p className="mt-1.5 text-[15px] text-maroon">{project.nextCall.when}</p>
        {yourTime ? (
          <p className="text-[12px] text-ink/50">
            {yourTime} for you — scheduled, not negotiated weekly
          </p>
        ) : null}
        {project.nextCall.agenda.length > 0 ? (
          <ul className="mt-4 space-y-2 border-t border-ink/10 pt-4">
            {project.nextCall.agenda.map((a) => (
              <li key={a} className="flex gap-2.5 text-[13px] text-ink/70">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                {a}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Panel>
  );
}

function MilestonePanel({
  milestones,
  onApprove,
  pending,
  onOpenAll,
  allowApprove = true,
}: {
  milestones: Milestone[];
  onApprove: (milestoneId: string) => void;
  pending: string;
  onOpenAll?: () => void;
  allowApprove?: boolean;
}) {
  return (
    <Panel
      title="Milestones"
      subtitle="Every stage, with the proof"
      actions={
        onOpenAll ? (
          <Button size="sm" variant="ghost" onClick={onOpenAll}>
            View progress
          </Button>
        ) : null
      }
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-ink/8">
        {milestones.map((m) => {
          // The studio decides when a stage is finished; the client only
          // signs off on one the studio has marked ready.
          const canApprove =
            m.approvalReady === true && (m.status === "active" || m.status === "blocked");
          const statusLabel =
            m.status === "complete"
              ? "Completed"
              : m.status === "active"
                ? "In progress"
                : m.status === "blocked"
                  ? "Blocked"
                  : "Not started";
          const statusClass =
            m.status === "complete"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : m.status === "active"
                ? "border-gold/50 bg-gold/10 text-maroon"
                : m.status === "blocked"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-ink/10 bg-ink/4 text-ink/55";
          const key = `ms-${m.id}`;
          return (
            <li key={m.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full font-display text-[15px]",
                  m.status === "complete" && "bg-emerald-600 text-white",
                  m.status === "active" && "bg-gold text-maroon",
                  m.status === "pending" && "bg-ink/8 text-ink/40",
                  m.status === "blocked" && "bg-red-600 text-white",
                )}
                aria-hidden
              >
                {m.status === "complete" ? "✓" : m.order}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] text-maroon">{m.name}</span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                      statusClass,
                    )}
                  >
                    {statusLabel}
                  </span>
                  {m.approvalReady ? (
                    <span className="rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-maroon">
                      Ready for your review
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-[11px] text-ink/45">
                  {m.stage} · {m.plannedStart} – {m.plannedEnd}
                  {m.evidence?.length ? ` · ${m.evidence.length} notes` : ""}
                </span>
              </span>

              <span className="flex w-24 shrink-0 items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                  <span
                    className={cn(
                      "block h-full rounded-full",
                      m.status === "complete"
                        ? "bg-emerald-600"
                        : "bg-gradient-to-r from-gold to-gold-light",
                    )}
                    style={{ width: `${m.progress}%` }}
                  />
                </span>
                <span className="text-[11px] text-ink/55">{m.progress}%</span>
              </span>

              {canApprove && allowApprove ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending === key}
                  onClick={() => onApprove(m.id)}
                >
                  Approve stage
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function PaymentTable({
  payments,
  onPay,
  pending,
  measuredWork,
  readOnly,
}: {
  payments: Payment[];
  onPay: (paymentId: string) => void;
  pending: string;
  measuredWork: boolean;
  readOnly: boolean;
}) {
  const [reviewPaymentId, setReviewPaymentId] = useState<string | null>(null);
  const paymentToReview = payments.find((payment) => payment.id === reviewPaymentId);

  return (
    <>
      {paymentToReview ? (
        <section
          aria-label="Review payment"
          className="m-3 rounded-xl border border-gold/50 bg-cream/60 p-4 sm:m-5"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-burgundy">
            Confirm stage and amount
          </p>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[14px] font-medium text-maroon">{paymentToReview.label}</p>
            <p className="text-[15px] font-semibold text-maroon">{kes(paymentToReview.amount)}</p>
          </div>
          {paymentToReview.certificate ? (
            <p className="mt-1 font-mono text-[11px] text-muted">
              {measuredWork ? "Certificate" : "Stage reference"} {paymentToReview.certificate}
            </p>
          ) : null}
          <p className="mt-3 text-[12px] leading-relaxed text-ink/65">
            Continue to Paystack’s secure checkout to choose an available payment method. This
            stage is recorded as paid only after ATRO verifies the exact KES amount with Paystack.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={pending === `pay-${paymentToReview.id}`}
              onClick={() => onPay(paymentToReview.id)}
            >
              {pending === `pay-${paymentToReview.id}` ? "Connecting…" : "Continue to Paystack"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending === `pay-${paymentToReview.id}`}
              onClick={() => setReviewPaymentId(null)}
            >
              Cancel
            </Button>
          </div>
        </section>
      ) : null}
      {payments.length === 0 ? (
        <p className="p-5 text-[13px] leading-relaxed text-ink/60">
          No payment stages have been recorded for this project yet. Approved stages will appear
          here with their amount and payment status.
        </p>
      ) : null}
      <ul className="space-y-3 p-3 sm:hidden">
        {payments.map((pay) => {
          const style = PAYMENT_STATUS[pay.status] ?? PAYMENT_STATUS.scheduled;
          const key = `pay-${pay.id}`;
          const checkoutPending = pay.checkoutStatus === "pending";
          return (
            <li key={pay.id} className="rounded-xl border border-ink/10 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-maroon">{pay.label}</span>
                  {pay.certificate ? (
                    <span className="font-mono text-[11px] text-muted">
                      {measuredWork ? "Certificate" : "Stage reference"} {pay.certificate}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[13px] font-medium text-maroon">
                  {kes(pay.amount)}
                </span>
              </div>
              <span
                className={cn(
                  "mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]",
                  style.cls,
                )}
              >
                {pay.status === "paid"
                  ? style.label
                  : checkoutPending
                    ? "Checkout started · unpaid"
                    : style.label}
              </span>
              {pay.status === "certified" && !readOnly ? (
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  disabled={pending === key}
                  variant={checkoutPending ? "outline" : "primary"}
                  onClick={() => setReviewPaymentId(pay.id)}
                >
                  {pending === key
                    ? "Connecting…"
                    : checkoutPending
                      ? "Review checkout"
                      : pay.checkoutStatus === "failed" || pay.checkoutStatus === "expired"
                        ? "Review & retry"
                        : "Pay now"}
                </Button>
              ) : null}
              {pay.status === "paid" ? (
                <p className="mt-2 text-[11px] text-ink/55">
                  {pay.paidDate ? `Paid ${paymentDateLabel(pay.paidDate)}` : "Payment recorded"}
                  {pay.method ? ` · ${pay.method}` : ""}
                </p>
              ) : checkoutPending ? (
                <p className="mt-2 text-[11px] text-amber-900">
                  Checkout started; this instalment is not paid until confirmed.
                </p>
              ) : pay.checkoutStatus === "failed" || pay.checkoutStatus === "expired" ? (
                <p className="mt-2 text-[11px] text-red-800">
                  The last attempt did not complete. This certified amount is still due.
                </p>
              ) : null}
              <PaymentAttemptHistory attempts={pay.attempts ?? []} />
            </li>
          );
        })}
      </ul>
      <div className={cn("overflow-x-auto", payments.length === 0 ? "hidden" : "hidden sm:block")}>
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/8 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
              <th scope="col" className="px-5 py-3 font-bold">
                Stage
              </th>
              <th scope="col" className="px-3 py-3 font-bold">
                Amount
              </th>
              <th scope="col" className="px-3 py-3 font-bold">
                Status
              </th>
              <th scope="col" className="px-5 py-3 font-bold" />
            </tr>
          </thead>
          <tbody>
            {payments.map((pay) => {
              const style = PAYMENT_STATUS[pay.status] ?? PAYMENT_STATUS.scheduled;
              const key = `pay-${pay.id}`;
              const checkoutPending = pay.checkoutStatus === "pending";
              return (
                <tr key={pay.id} className="border-b border-ink/6 last:border-0">
                  <td className="px-5 py-3">
                    <span className="block text-[13px] text-maroon">{pay.label}</span>
                    {pay.certificate ? (
                      <span className="font-mono text-[11px] text-muted">
                        {measuredWork ? "Certificate" : "Stage reference"} {pay.certificate}
                      </span>
                    ) : null}
                    {pay.status === "paid" ? (
                      <span className="mt-1 block text-[11px] text-ink/55">
                        {pay.paidDate ? `Paid ${paymentDateLabel(pay.paidDate)}` : "Payment recorded"}
                        {pay.method ? ` · ${pay.method}` : ""}
                      </span>
                    ) : checkoutPending ? (
                      <span className="mt-1 block text-[11px] text-amber-900">
                        Checkout started; payment is not yet confirmed.
                      </span>
                    ) : pay.checkoutStatus === "failed" || pay.checkoutStatus === "expired" ? (
                      <span className="mt-1 block text-[11px] text-red-800">
                        Last attempt did not complete; this amount is still due.
                      </span>
                    ) : null}
                    <PaymentAttemptHistory attempts={pay.attempts ?? []} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-[13px] text-ink/70">
                    {kes(pay.amount)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]",
                        style.cls,
                      )}
                    >
                      {pay.status === "paid"
                        ? style.label
                        : checkoutPending
                          ? "Checkout started · unpaid"
                          : style.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {pay.status === "certified" && !readOnly ? (
                      <Button
                        size="sm"
                        disabled={pending === key}
                        variant={checkoutPending ? "outline" : "primary"}
                        onClick={() => setReviewPaymentId(pay.id)}
                      >
                        {pending === key
                          ? "Connecting…"
                          : checkoutPending
                            ? "Review checkout"
                            : pay.checkoutStatus === "failed" || pay.checkoutStatus === "expired"
                              ? "Review & retry"
                              : "Pay now"}
                      </Button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function paymentDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeZone: "Africa/Nairobi",
  }).format(date);
}

function paymentDateTimeLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  }).format(date);
}

function PaymentAttemptHistory({
  attempts,
}: {
  attempts: NonNullable<Payment["attempts"]>;
}) {
  if (attempts.length === 0) return null;
  return (
    <details className="mt-3 rounded-lg border border-ink/8 bg-cream/40 px-3 py-2">
      <summary className="cursor-pointer text-[11px] font-medium text-maroon">
        Payment history ({attempts.length} {attempts.length === 1 ? "attempt" : "attempts"})
      </summary>
      <ol className="mt-2 space-y-3">
        {attempts.map((attempt) => (
          <li key={attempt.reference} className="border-t border-ink/8 pt-2 text-[11px]">
            <p className="font-medium text-ink/75">
              {attempt.status === "success"
                ? "Payment verified"
                : attempt.status === "pending"
                  ? "Checkout started · awaiting confirmation"
                  : `Checkout ${attempt.status}`}
            </p>
            <p className="mt-0.5 text-ink/55">
              {kes(attempt.amount)} · Started {paymentDateTimeLabel(attempt.createdAt)}
              {attempt.paidAt ? ` · Paid ${paymentDateTimeLabel(attempt.paidAt)}` : ""}
              {attempt.channel ? ` · ${attempt.channel}` : ""}
            </p>
            <p className="mt-0.5 break-all font-mono text-ink/55">
              Ref: {attempt.reference}
              {attempt.providerTransactionId
                ? ` · Transaction ${attempt.providerTransactionId}`
                : ""}
            </p>
          </li>
        ))}
      </ol>
    </details>
  );
}

function DecisionOptionImage({
  projectId,
  decisionId,
  optionIndex,
  visualId,
  caption,
  option,
}: {
  projectId: string;
  decisionId: string;
  optionIndex: number;
  visualId: string;
  caption: string;
  option: string;
}) {
  const query = useQuery({
    queryKey: ["decision-visual-url", visualId],
    queryFn: () =>
      getMyDecisionVisualUrl({
        data: { projectId, decisionId, optionIndex },
      }),
    staleTime: 240_000,
  });

  if (query.error) {
    return (
      <span role="alert" className="shrink-0 text-[11px] text-red-700">
        Image unavailable
      </span>
    );
  }
  if (!query.data) {
    return (
      <span
        aria-label="Loading option image"
        className="h-20 w-24 shrink-0 animate-pulse rounded-lg bg-ink/8 sm:h-24 sm:w-32"
      />
    );
  }
  return (
    <img
      src={query.data.url}
      alt={caption || `${option} option`}
      loading="lazy"
      className="h-20 w-24 shrink-0 rounded-lg border border-ink/10 object-cover sm:h-24 sm:w-32"
    />
  );
}

function DecisionsPanel({
  projectId,
  decisions,
  onDecide,
  pending,
}: {
  projectId: string;
  decisions: Decision[];
  onDecide: (decisionId: string, chosen: string) => void;
  /** Called when a write lands on the client side, so the portal can refetch. */
  onReloaded?: () => void;
  pending: string;
}) {
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState<Record<string, boolean>>({});
  const openDecisions = decisions.filter((decision) => decision.state !== "decided");
  const decisionHistory = decisions.filter((decision) => decision.state === "decided");

  if (decisions.length === 0) {
    return (
      <Panel title="Decisions" subtitle="Project choices and approvals">
        <p className="text-[13px] leading-relaxed text-ink/60">
          There are no project decisions yet. When the team needs your choice, the options, cost
          impact and reply date will appear here.
        </p>
      </Panel>
    );
  }

  const renderDecision = (decision: Decision) => {
    const key = `dec-${decision.id}`;
    const decided = decision.state === "decided";
    const selectedChoice = choice[decision.id] ?? "";
    const isConfirming = confirming[decision.id] === true;
    const impact = decision.costImpact;

    return (
      <Panel
        key={decision.id}
        title={decision.title}
        subtitle={
          decided
            ? `Recorded ${decision.date}`
            : `Raised ${decision.date}${
                decision.dueDate
                  ? ` · Reply by ${formatDay(decision.dueDate) ?? decision.dueDate}`
                  : ""
              }`
        }
        actions={
          decided ? (
            <Badge tone="live">Recorded</Badge>
          ) : (
            <Badge tone="gold">Needs your response</Badge>
          )
        }
      >
        {decision.detail ? (
          <p className="text-[13px] leading-relaxed text-ink/70">{decision.detail}</p>
        ) : null}

        <div
          className={cn(
            "mt-4 rounded-xl border p-4",
            impact > 0
              ? "border-amber-300 bg-amber-50"
              : impact < 0
                ? "border-emerald-200 bg-emerald-50"
                : "border-ink/10 bg-cream",
          )}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Estimated cost impact for this decision
          </p>
          <p className="mt-1 text-[14px] font-semibold text-maroon">
            {impact > 0
              ? `May add ${kes(impact)}`
              : impact < 0
                ? `May reduce cost by ${kes(Math.abs(impact))}`
                : "No additional cost recorded"}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink/55">
            This estimate is part of the decision record; it is not a payment request.
          </p>
        </div>

        <fieldset className="mt-5" disabled={decided || isConfirming}>
          <legend className="text-[12px] font-semibold text-ink/75">
            {decided ? "Options considered" : "Choose one option"}
          </legend>
          <ul className="mt-2 space-y-2">
            {decision.options.map((option, optionIndex) => {
              const isChosen = decided && decision.chosen === option;
              const isPicked = selectedChoice === option;
              const optionDetail = decision.optionDetails?.[optionIndex];
              const optionVisual = decision.optionVisuals?.find(
                (visual) => visual.optionIndex === optionIndex,
              );
              return (
                <li key={option}>
                  <button
                    type="button"
                    disabled={decided || isConfirming}
                    aria-pressed={isChosen || isPicked}
                    onClick={() =>
                      setChoice((previous) => ({ ...previous, [decision.id]: option }))
                    }
                    className={cn(
                      "flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border p-3 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                      isChosen
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : isPicked
                          ? "border-gold bg-gold/10 text-maroon"
                          : "border-ink/12 text-ink/70 hover:border-burgundy",
                      (decided || isConfirming) && "cursor-default opacity-90",
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block font-medium">{option}</span>
                        {optionDetail ? (
                          <span className="mt-1 block whitespace-normal text-[12px] leading-relaxed opacity-75">
                            {optionDetail}
                          </span>
                        ) : null}
                        {optionVisual?.caption ? (
                          <span className="mt-1 block whitespace-normal text-[11px] opacity-65">
                            {optionVisual.caption}
                          </span>
                        ) : null}
                      </span>
                      {optionVisual ? (
                        <DecisionOptionImage
                          projectId={projectId}
                          decisionId={decision.id}
                          optionIndex={optionIndex}
                          visualId={optionVisual.visualId}
                          caption={optionVisual.caption}
                          option={option}
                        />
                      ) : null}
                    </span>
                    <span className="shrink-0">
                      {isChosen ? (
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">
                          Chosen
                        </span>
                      ) : isPicked ? (
                        <span className="text-[11px] font-semibold text-maroon">Selected</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        {!decided && !isConfirming ? (
          <Button
            className="mt-4"
            disabled={pending === key || !selectedChoice}
            onClick={() => setConfirming((previous) => ({ ...previous, [decision.id]: true }))}
          >
            Review your answer
          </Button>
        ) : null}

        {!decided && isConfirming ? (
          <div className="mt-4 rounded-xl border border-gold/45 bg-gold/10 p-4">
            <p className="text-[13px] font-semibold text-maroon">Confirm your choice</p>
            <p className="mt-1 text-[13px] text-ink/70">
              You selected <strong>{selectedChoice}</strong>.
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-ink/60">
              Once recorded, this answer becomes part of the project decision log and cannot be
              changed here. If you need to discuss it first, cancel and message your project team.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                disabled={pending === key}
                onClick={() => onDecide(decision.id, selectedChoice)}
              >
                {pending === key ? "Recording…" : "Confirm and record"}
              </Button>
              <Button
                variant="outline"
                disabled={pending === key}
                onClick={() => setConfirming((previous) => ({ ...previous, [decision.id]: false }))}
              >
                Change answer
              </Button>
            </div>
          </div>
        ) : null}
      </Panel>
    );
  };

  return (
    <div className="space-y-6">
      {openDecisions.length > 0 ? (
        <section aria-labelledby="decisions-pending-title" className="space-y-4">
          <div>
            <h2 id="decisions-pending-title" className="font-display text-lg text-maroon">
              Needs your response
            </h2>
            <p className="mt-1 text-[12px] text-ink/55">
              {openDecisions.length} decision{openDecisions.length === 1 ? "" : "s"} waiting for
              you. Review the impact before recording your choice.
            </p>
          </div>
          {openDecisions.map(renderDecision)}
        </section>
      ) : (
        <Panel title="You’re up to date" subtitle="No decisions need your response">
          <p className="text-[13px] leading-relaxed text-ink/60">
            When the team needs a choice from you, it will appear here with its options, cost impact
            and reply date.
          </p>
        </Panel>
      )}

      {decisionHistory.length > 0 ? (
        <details className="group rounded-2xl border border-ink/10 bg-white shadow-card">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block font-display text-[15px] text-maroon">Decision history</span>
              <span className="mt-0.5 block text-[12px] text-muted">
                {decisionHistory.length} recorded decision
                {decisionHistory.length === 1 ? "" : "s"}
              </span>
            </span>
            <span className="text-[12px] font-semibold text-maroon group-open:hidden">Show</span>
            <span className="hidden text-[12px] font-semibold text-maroon group-open:inline">
              Hide
            </span>
          </summary>
          <div className="space-y-4 border-t border-ink/8 p-4 sm:p-5">
            {decisionHistory.map(renderDecision)}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="p-5 text-[13px] text-ink/55">Nothing posted yet.</p>;
  }

  return (
    <ul className="divide-y divide-ink/8">
      {items.map((a) => (
        <li key={a.id} className="px-5 py-4">
          <p className="flex items-center gap-2 text-[13px] text-maroon">
            <FileText className="size-3.5 shrink-0 text-gold" aria-hidden />
            {a.title}
          </p>
          {a.body ? <p className="mt-1 text-[12px] leading-relaxed text-ink/60">{a.body}</p> : null}
          <p className="mt-1 text-[11px] text-muted">
            {new Date(a.at).toLocaleDateString("en-KE", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}

function VaultPanel({
  projectId,
  documents,
  projects,
  experience,
  measuredWork,
}: {
  projectId: string;
  documents: DocumentSummary[];
  projects: ProjectSummary[];
  experience: "local" | "diaspora";
  measuredWork: boolean;
}) {
  return (
    <div className="space-y-5">
      <ClientProjectFilesPanel projectId={projectId} />
      <Panel
        title="Documents"
        subtitle="Your paperwork, ready to print"
        className="min-w-0"
        bodyClassName="p-0"
      >
        {documents.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="mx-auto size-6 text-ink/30" />
            <p className="mt-3 font-display text-lg text-maroon">No documents yet</p>
            <p className="mx-auto mt-2 max-w-md text-[13px] text-ink/55">
              {measuredWork
                ? "Your payment certificate and matching payment request appear here once ATRO confirms inspected work."
                : "Your payment request appears here once ATRO confirms an agreed fee stage or deliverable."}{" "}
              You can print it or save it as a PDF.
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-3 p-3 sm:hidden">
              {documents.map((doc) => (
                <li key={doc.id} className="rounded-xl border border-ink/10 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-maroon">
                        {KIND_LABEL[doc.kind]}
                      </span>
                      <span className="block font-mono text-[11px] text-muted">{doc.number}</span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                        doc.status === "void"
                          ? "border-red-200 bg-red-50 text-red-800"
                          : DOC_TONE[doc.kind],
                      )}
                    >
                      {doc.status === "void" ? "Void" : "Issued"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-ink/55">
                      {new Date(doc.issuedAt).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[12px] font-medium text-maroon">{kes(doc.total)}</span>
                  </div>
                  <Link
                    to="/portal/document/$id"
                    params={{ id: doc.id }}
                    search={{ experience }}
                    className="mt-3 inline-flex min-h-10 items-center text-[12px] font-medium text-burgundy underline decoration-gold decoration-2 underline-offset-4"
                  >
                    Open document
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/8 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                    <th scope="col" className="px-5 py-3 font-bold">
                      Document
                    </th>
                    <th scope="col" className="px-3 py-3 font-bold">
                      Issued
                    </th>
                    <th scope="col" className="px-3 py-3 font-bold">
                      Amount
                    </th>
                    <th scope="col" className="px-5 py-3 font-bold" />
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-ink/6 last:border-0">
                      <td className="px-5 py-3">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-[13px] text-maroon">{KIND_LABEL[doc.kind]}</span>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                              doc.status === "void"
                                ? "border-red-200 bg-red-50 text-red-800"
                                : DOC_TONE[doc.kind],
                            )}
                          >
                            {doc.status === "void" ? "Void" : "Issued"}
                          </span>
                        </span>
                        <span className="block font-mono text-[11px] text-muted">{doc.number}</span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-[13px] text-ink/70">
                        {new Date(doc.issuedAt).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-[13px] text-ink/70">
                        {kes(doc.total)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to="/portal/document/$id"
                          params={{ id: doc.id }}
                          search={{ experience }}
                          className="text-[12px] text-burgundy underline decoration-gold decoration-2 underline-offset-4"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      {projects.length > 1 ? (
        <Panel title="Your projects" subtitle="Every project you hold with ATRO">
          <ul className="grid gap-2 sm:grid-cols-2">
            {projects.map((proj) => (
              <li
                key={proj.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 p-3"
              >
                <span className="min-w-0">
                  <span className="block text-[13px] text-maroon">{proj.title}</span>
                  <span className="font-mono text-[11px] text-muted">{proj.reference}</span>
                </span>
                <span className="shrink-0 text-[12px] text-ink/55">{proj.progress}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
