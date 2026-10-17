/**
 * Approvals: the paperwork that stands between a plot and a building.
 *
 * Planning consent, environmental impact, the contractor's registration, the
 * county permit, water and power. To a client building from another country
 * this is the single largest source of dread, because it is the part they
 * cannot do themselves and cannot see happening. Every competitor in this
 * market sells "approvals handled" as a line item.
 *
 * So the tracker is not a checklist for the studio's own use — it is the client
 * watching the thing that would otherwise be invisible, and the studio charging
 * for it. Fees are tracked because they are real money that leaks out of a build
 * budget (permits alone run from KES 50,000 to 300,000), and because an
 * approval handled for a fee is a billable line.
 *
 * Pure functions, so the rules can be tested without a database.
 */

export type ApprovalKind =
  | "ncc"
  | "nema"
  | "nca"
  | "county"
  | "utilities"
  | "other";

export type ApprovalStatus =
  | "not_started"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "not_required";

export type Approval = {
  id: string;
  ord: number;
  kind: ApprovalKind;
  title: string;
  authority: string;
  reference: string;
  status: ApprovalStatus;
  submittedOn: string;
  decidedOn: string;
  /** What it cost the client, and what has been paid of it. */
  feeAmount: number;
  feePaid: number;
  /** True when this holds up the next stage of the build. */
  blocking: boolean;
  /** When the studio last chased the authority. */
  chasedOn: string;
  chaseNote: string;
  note: string;
  /** When the row last changed — how "stalled" is judged. */
  updatedAt: string;
};

export const APPROVAL_KINDS: { value: ApprovalKind; label: string; short: string }[] = [
  { value: "ncc", label: "Planning consent (NCC)", short: "Planning" },
  { value: "nema", label: "Environment (NEMA)", short: "Environment" },
  { value: "nca", label: "Contractor registration (NCA)", short: "Registration" },
  { value: "county", label: "County permit and fees", short: "County" },
  { value: "utilities", label: "Water, power and sewer", short: "Utilities" },
  { value: "other", label: "Other approval", short: "Other" },
];

export const APPROVAL_STATUS: {
  value: ApprovalStatus;
  label: string;
  tone: "neutral" | "progress" | "good" | "bad" | "muted";
}[] = [
  { value: "not_started", label: "Not started", tone: "neutral" },
  { value: "submitted", label: "Submitted", tone: "progress" },
  { value: "under_review", label: "Under review", tone: "progress" },
  { value: "approved", label: "Approved", tone: "good" },
  { value: "rejected", label: "Refused", tone: "bad" },
  { value: "not_required", label: "Not required", tone: "muted" },
];

/** How long an approval may sit before it counts as stalled. */
export const STALLED_AFTER_DAYS = 21;

/** How long before a chase is worth repeating. */
export const CHASE_EVERY_DAYS = 7;

const MS_DAY = 86_400_000;

export function daysSince(iso: string, now: Date): number | null {
  if (!iso) return null;
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return null;
  return Math.floor((now.getTime() - at.getTime()) / MS_DAY);
}

/** Approved or explicitly not needed — either way, it is out of the way. */
export function isSettled(status: ApprovalStatus): boolean {
  return status === "approved" || status === "not_required";
}

/** True when this approval is holding up the next stage of the build. */
export function blocksTheProject(approval: Approval): boolean {
  return approval.blocking && !isSettled(approval.status);
}

/** Sitting with an authority for too long, with nothing moving. */
export function isStalled(
  approval: Approval,
  now: Date,
  stalledAfterDays = STALLED_AFTER_DAYS,
): boolean {
  if (isSettled(approval.status)) return false;
  if (approval.status !== "submitted" && approval.status !== "under_review") return false;
  const idle = daysSince(approval.updatedAt, now);
  return idle !== null && idle >= stalledAfterDays;
}

/** Worth chasing: stalled, and not chased recently. */
export function needsChase(approval: Approval, now: Date): boolean {
  if (!isStalled(approval, now)) return false;
  const sinceChase = daysSince(approval.chasedOn, now);
  return sinceChase === null || sinceChase >= CHASE_EVERY_DAYS;
}

/** Money still owed on this approval. */
export function feeOutstanding(approval: Approval): number {
  return Math.max(0, approval.feeAmount - approval.feePaid);
}

export type ApprovalsSummary = {
  count: number;
  settled: number;
  inFlight: number;
  blocking: number;
  stalled: number;
  toChase: number;
  feesTotal: number;
  feesPaid: number;
  feesOutstanding: number;
  /** The one line the client actually wants: what is holding the build. */
  holding: string[];
};

export function summariseApprovals(
  approvals: Approval[],
  now: Date,
): ApprovalsSummary {
  let settled = 0;
  let inFlight = 0;
  let blocking = 0;
  let stalled = 0;
  let toChase = 0;
  let feesTotal = 0;
  let feesPaid = 0;
  const holding: string[] = [];

  for (const a of approvals) {
    feesTotal += a.feeAmount;
    feesPaid += Math.min(a.feeAmount, a.feePaid);
    if (isSettled(a.status)) {
      settled += 1;
      continue;
    }
    inFlight += 1;
    if (blocksTheProject(a)) {
      blocking += 1;
      holding.push(a.title);
    }
    if (isStalled(a, now)) stalled += 1;
    if (needsChase(a, now)) toChase += 1;
  }

  return {
    count: approvals.length,
    settled,
    inFlight,
    blocking,
    stalled,
    toChase,
    feesTotal,
    feesPaid,
    feesOutstanding: Math.max(0, feesTotal - feesPaid),
    holding,
  };
}

/** The sentence a client reads at the top of the tab. */
export function approvalsHeadline(summary: ApprovalsSummary): string {
  if (summary.count === 0) {
    return "Nothing is being chased at the moment.";
  }
  if (summary.blocking > 0) {
    const list = summary.holding.slice(0, 2).join(" and ");
    const more = summary.holding.length > 2 ? `, and ${summary.holding.length - 2} more` : "";
    return `${summary.blocking} approval${summary.blocking === 1 ? "" : "s"} ${summary.blocking === 1 ? "is" : "are"} holding the build: ${list}${more}.`;
  }
  if (summary.inFlight === 0) {
    return "Every approval is in hand.";
  }
  return `${summary.inFlight} approval${summary.inFlight === 1 ? "" : "s"} with the authorities. Nothing is holding the build.`;
}

export const STATUS_TONE_CLASS: Record<ApprovalStatus, string> = {
  not_started: "border-ink/15 bg-stone/100 text-ink/60",
  submitted: "border-sky-300 bg-sky-50 text-sky-900",
  under_review: "border-amber-300 bg-amber-50 text-amber-900",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-900",
  rejected: "border-red-300 bg-red-50 text-red-800",
  not_required: "border-ink/10 bg-cream text-muted",
};

export const KES = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
export const kes = (n: number) => `KES ${KES.format(n)}`;

export const kesShort = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `KES ${Math.round(n / 1_000)}k`;
  return `KES ${KES.format(n)}`;
};
