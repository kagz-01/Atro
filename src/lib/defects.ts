/**
 * After handover: the defect period and the annual care fee.
 *
 * This is the part a diaspora client dreads most after the money is paid — the
 * build is finished, the final certificate is signed, and then a crack appears
 * in April. Three questions decide whether that becomes a complaint or a
 * relationship: when must it be reported, what happens after it is reported,
 * and who pays for the years that follow.
 *
 * So the rules here are deliberately explicit about the deadline and about
 * movement. A defect reported sixteen days ago that nobody has looked at is
 * shown as exactly that, because the honest version of that fact is worse for
 * the studio than for the client — silence is what turns a hairline crack into
 * a dispute.
 */

export const DEFECT_STATUSES = [
  { value: "reported", label: "Reported", tone: "waiting" },
  { value: "accepted", label: "Accepted", tone: "ok" },
  { value: "in_progress", label: "Being fixed", tone: "doing" },
  { value: "fixed", label: "Fixed — check it", tone: "doing" },
  { value: "verified", label: "Closed", tone: "done" },
  { value: "rejected", label: "Not covered", tone: "no" },
] as const;

export type DefectStatus = (typeof DEFECT_STATUSES)[number]["value"];

export const SEVERITIES = [
  { value: "minor", label: "Minor" },
  { value: "major", label: "Major" },
  { value: "urgent", label: "Urgent" },
] as const;
export type Severity = (typeof SEVERITIES)[number]["value"];

export type Defect = {
  id: string;
  projectId: string;
  ord: number;
  title: string;
  detail: string;
  /** The room or element: "Ensuite", "East elevation", "Roof". */
  area: string;
  severity: Severity;
  status: DefectStatus;
  reportedOn: string;
  acceptedOn: string;
  fixedOn: string;
  verifiedOn: string;
  /** Why it was not covered. Required whenever the status is `rejected`. */
  rejectReason: string;
  /** What the studio said about it — an answer, not a status. */
  note: string;
  reportedBy: "client" | "studio";
  updatedAt: string;
};

export type Retainer = {
  projectId: string;
  name: string;
  /** What the yearly fee covers, in the client's words. */
  covers: string;
  annualAmount: number;
  renewsOn: string;
  status: "active" | "lapsed" | "cancelled";
  lastPaidOn: string;
};

/** Transitions the record actually allows. Anything else is a lie in waiting. */
const ALLOWED: Record<DefectStatus, DefectStatus[]> = {
  reported: ["accepted", "rejected"],
  accepted: ["in_progress", "rejected"],
  in_progress: ["fixed", "accepted"],
  // "Fixed" hands the decision to the person who reported it: the studio does
  // not get to close its own homework.
  fixed: ["verified", "in_progress"],
  rejected: ["accepted"],
  verified: [],
};

export function canTransition(from: DefectStatus, to: DefectStatus): boolean {
  if (from === to) return false;
  return ALLOWED[from].includes(to);
}

/** Still on somebody's desk — closed only when the client confirms the fix. */
export function isOpen(status: DefectStatus): boolean {
  return status !== "verified" && status !== "rejected";
}

/** Waiting on the studio to respond or act. */
export function awaitingStudio(status: DefectStatus): boolean {
  return status === "reported" || status === "accepted" || status === "in_progress";
}

/** Waiting on the client — right now only "check the fix we did". */
export function awaitingClient(status: DefectStatus): boolean {
  return status === "fixed";
}

/**
 * Days left in the defect period, or null when no period has been set.
 *
 * Never negative: a period that ran out reads "closed", not "-40 days", which
 * is a number nobody can act on.
 */
export function daysLeft(periodEnd: string, today: Date): number | null {
  if (!periodEnd) return null;
  const end = new Date(`${periodEnd.slice(0, 10)}T23:59:59`);
  if (Number.isNaN(end.getTime())) return null;
  const ms = end.getTime() - today.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}

/** Whether a report filed on `reportedOn` fell inside the period. */
export function inPeriod(reportedOn: string, periodEnd: string): boolean {
  if (!periodEnd) return true;
  if (!reportedOn) return false;
  const end = new Date(`${periodEnd.slice(0, 10)}T23:59:59`).getTime();
  const reported = new Date(`${reportedOn.slice(0, 10)}T00:00:00`).getTime();
  if (Number.isNaN(end) || Number.isNaN(reported)) return true;
  return reported <= end;
}

/**
 * A report nobody has looked at for two weeks.
 *
 * This is the number that keeps a studio honest: the client can see it, so the
 * portal is never the place bad news goes to hide.
 */
export function isStalled(defect: Defect, today: Date, days = 14): boolean {
  if (!awaitingStudio(defect.status)) return false;
  const from = new Date(defect.updatedAt || defect.reportedOn);
  if (Number.isNaN(from.getTime())) return false;
  return today.getTime() - from.getTime() > days * 86_400_000;
}

export type DefectSummary = {
  total: number;
  open: number;
  awaitingUs: number;
  awaitingClient: number;
  stalled: number;
  daysRemaining: number | null;
  periodEnd: string;
  /** The sentence under the heading — what is true right now. */
  headline: string;
};

export function summariseDefects(defects: Defect[], periodEnd: string, today: Date): DefectSummary {
  const open = defects.filter((d) => isOpen(d.status)).length;
  const waitingUs = defects.filter((d) => awaitingStudio(d.status)).length;
  const waitingClient = defects.filter((d) => awaitingClient(d.status)).length;
  const stalled = defects.filter((d) => isStalled(d, today)).length;
  const remaining = daysLeft(periodEnd, today);

  let headline: string;
  if (!periodEnd) {
    headline = "The studio has not set your defect period yet.";
  } else if (remaining === 0) {
    headline = `The defect period closed on ${fmtDate(periodEnd)}. Anything reported now is goodwill.`;
  } else if (open === 0) {
    headline = `Nothing open. ${remaining} days left to report defects.`;
  } else if (waitingClient > 0) {
    headline = `${waitingClient} fix${waitingClient === 1 ? "" : "es"} waiting for you to check. ${remaining} days left in the period.`;
  } else if (stalled > 0) {
    headline = `${stalled} report${stalled === 1 ? "" : "s"} with no response yet. ${remaining} days left in the period.`;
  } else {
    headline = `${open} open · ${remaining} days left in the defect period.`;
  }

  return {
    total: defects.length,
    open,
    awaitingUs: waitingUs,
    awaitingClient: waitingClient,
    stalled,
    daysRemaining: remaining,
    periodEnd,
    headline,
  };
}

/* ── the retainer ── */

export type RetainerState = "none" | "active" | "due_soon" | "lapsed";

/**
 * Where the yearly fee stands.
 *
 * "Due soon" exists because a fee that jumps from fine to overdue with no
 * warning is how a retainer lapses by accident — and a lapsed retainer means a
 * cracked parapet in year three has nobody answerable for it.
 */
export function retainerState(retainer: Retainer | null, today: Date): RetainerState {
  if (!retainer || retainer.status === "cancelled") return "none";
  const days = daysLeft(retainer.renewsOn, today);
  if (days === null) return retainer.status === "lapsed" ? "lapsed" : "active";
  if (days === 0) return "lapsed";
  if (days <= 30) return "due_soon";
  return "active";
}

export function daysToRenewal(retainer: Retainer | null, today: Date): number | null {
  if (!retainer) return null;
  return daysLeft(retainer.renewsOn, today);
}

/** What the retainer section says, in one line. */
export function retainerLine(retainer: Retainer | null, today: Date): string {
  const state = retainerState(retainer, today);
  if (state === "none" || !retainer) {
    return "No maintenance retainer on this project yet.";
  }
  const days = daysToRenewal(retainer, today);
  const on = fmtDate(retainer.renewsOn);
  if (state === "lapsed") return `Renewal was due on ${on}.`;
  if (state === "due_soon") return `Renews ${on} — ${days} day${days === 1 ? "" : "s"} left.`;
  return `Renews ${on} · ${days} days.`;
}

/** Dates the client compares against their own records. */
export function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export const STATUS_TONE_CLASS: Record<DefectStatus, string> = {
  reported: "border-amber-300 bg-amber-50 text-amber-900",
  accepted: "border-emerald-300 bg-emerald-50 text-emerald-900",
  in_progress: "border-sky-300 bg-sky-50 text-sky-900",
  fixed: "border-sky-300 bg-sky-50 text-sky-900",
  verified: "border-ink/15 bg-stone/100 text-ink/60",
  rejected: "border-red-300 bg-red-50 text-red-800",
};

export function statusLabel(status: DefectStatus): string {
  return DEFECT_STATUSES.find((s) => s.value === status)?.label ?? status;
}
