/**
 * Variations — the priced change, approved before it is committed.
 *
 * Selections promise the client that a choice over the allowance "becomes a
 * variation to approve before it is committed". This module is that promise:
 * the only recorded way the contract sum moves, and it moves solely when the
 * client approves a price they have been shown.
 *
 * The rules that matter commercially:
 *
 *   1. **The contract moves only on client approval.** Raising, pricing or
 *      withdrawing a variation touches nothing but its own row. One statement
 *      on the server adds the amount to the project the moment approval lands,
 *      so there is no window where a variation reads approved but the sum has
 *      not moved.
 *   2. **Anybody can leave a proposed variation, nobody can resurrect one.**
 *      Once approved, declined or withdrawn it is settled — a second thought
 *      is a new variation, so the history of a contract is a chain of decisions
 *      rather than edits to an old one.
 *   3. **An amount and a time impact travel together.** Real changes cost money
 *      and days; a variation that records only one of them is a variation
 *      somebody will argue about later.
 */

/** Only a proposed variation can still be decided. */
export type VariationStatus = "proposed" | "approved" | "declined" | "withdrawn";

/** Where the change came from — a client choice, or the studio itself. */
export type VariationSource = "selection" | "studio";

export type Variation = {
  id: string;
  projectId: string;
  ord: number;
  title: string;
  /** What is being done — the scope, in the client's language. */
  detail: string;
  /** Why it is needed — the studio's justification, shown before the price. */
  reason: string;
  sourceKind: VariationSource;
  /** The selection it came from, when it came from a choice. */
  sourceId: string | null;
  /** Signed: positive adds to the contract, negative credits it. */
  amount: number;
  /** Signed agreed time impact in days; 0 when the programme does not move. */
  days: number;
  status: VariationStatus;
  proposedOn: string;
  decidedOn: string;
  /** The client's note on a decision, or the studio's reason for withdrawing. */
  decisionNote: string;
  decidedBy: "" | "client" | "studio";
  updatedAt: string;
};

export const VARIATION_STATUSES = [
  { value: "proposed", label: "Waiting on you", tone: "waiting" },
  { value: "approved", label: "Approved", tone: "ok" },
  { value: "declined", label: "Declined", tone: "no" },
  { value: "withdrawn", label: "Withdrawn", tone: "done" },
] as const;

export type VariationStatusValue = (typeof VARIATION_STATUSES)[number]["value"];

export const STATUS_TONE_CLASS: Record<VariationStatus, string> = {
  proposed: "border-amber-300 bg-amber-50 text-amber-900",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-900",
  declined: "border-ink/15 bg-stone/100 text-ink/60",
  withdrawn: "border-ink/10 bg-cream text-muted",
};

/**
 * A move that is actually available, and to whom.
 *
 * The client decides money — approve or decline — and nothing else. The studio
 * can only withdraw before the client has spoken. Every other move, including
 * reopening a settled change, is refused: a second thought is a new variation.
 */
export function canTransition(
  from: VariationStatus,
  to: VariationStatus,
  by: "client" | "studio",
): boolean {
  if (from !== "proposed") return false;
  if (by === "client") return to === "approved" || to === "declined";
  return to === "withdrawn";
}

/** True while the price sits with the client — the only live state. */
export function awaitingClient(v: Variation): boolean {
  return v.status === "proposed";
}

export function statusLabel(status: VariationStatus): string {
  return VARIATION_STATUSES.find((s) => s.value === status)?.label ?? status;
}

/* ── money and time ── */

const KES_FMT = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

export const kes = (n: number) => `KES ${KES_FMT.format(Math.abs(n))}`;

/** Signed, so a credit reads as a credit: "-KES 85,000", "+KES 275,000". */
export const signedKes = (n: number) =>
  n === 0 ? "KES 0" : n > 0 ? `+${kes(n)}` : `-${kes(n)}`;

export const amountLabel = (n: number) => (n === 0 ? "No cost change" : signedKes(n));

export const daysLabel = (n: number) =>
  n === 0 ? "" : `${n > 0 ? "+" : ""}${n} day${Math.abs(n) === 1 ? "" : "s"}`;

export function sumAmount(vs: Variation[], status?: VariationStatus): number {
  return vs.reduce((t, v) => (status && v.status !== status ? t : t + v.amount), 0);
}

/** What approved changes have added to (or credited) the contract so far. */
export const approvedDelta = (vs: Variation[]) => sumAmount(vs, "approved");

/** Prices with the client right now — money in flight. */
export const inFlight = (vs: Variation[]) => sumAmount(vs, "proposed");

/** Agreed time impact of approved changes, in days. */
export const approvedDays = (vs: Variation[]) =>
  vs.reduce((t, v) => (v.status === "approved" ? t + v.days : t), 0);

/**
 * What the contract said before any approved change.
 *
 * The project row carries the amended sum — approval is what moved it — so the
 * original is derived by taking approved changes back out. Deriving rather than
 * storing means the two can never drift apart.
 */
export const originalContract = (currentContract: number, vs: Variation[]) =>
  currentContract - approvedDelta(vs);

export function countAwaiting(vs: Variation[]): number {
  return vs.filter(awaitingClient).length;
}

/* ── input checking ── */

/**
 * A title has to say what is changing.
 *
 * "Extra work" is a category, not a variation — and a priced change the client
 * cannot recognise is one they will decline out of caution.
 */
export function validateVariation(input: {
  title: string;
  amount: number;
  days: number;
}):
  | { ok: true; title: string }
  | { ok: false; reason: string } {
  const title = input.title.replace(/\s+/g, " ").trim();
  if (title.length < 5) {
    return {
      ok: false,
      reason: "Say what is changing — “bigger roof overhang to the east terrace”, not “extra”.",
    };
  }
  if (title.length > 160) return { ok: false, reason: "Keep the title under 160 characters." };
  if (input.amount === 0 && input.days === 0) {
    return {
      ok: false,
      reason: "Give it a price or a time impact — a change with neither has nothing to approve.",
    };
  }
  if (!Number.isFinite(input.amount) || Math.abs(input.amount) > 500_000_000) {
    return { ok: false, reason: "That price is outside anything this contract could carry." };
  }
  if (!Number.isInteger(input.days) || Math.abs(input.days) > 365) {
    return { ok: false, reason: "Time impact must be whole days within a year either way." };
  }
  return { ok: true, title };
}

/* ── roll-ups ── */

export type VariationSummary = {
  total: number;
  proposed: number;
  approved: number;
  declined: number;
  withdrawn: number;
  /** How many are with the client — the client's badge and the studio's bell. */
  awaiting: number;
  inFlight: number;
  approvedDelta: number;
  approvedDays: number;
  headline: string;
};

export function summariseVariations(vs: Variation[]): VariationSummary {
  const proposed = vs.filter((v) => v.status === "proposed");
  const approved = vs.filter((v) => v.status === "approved");
  const declined = vs.filter((v) => v.status === "declined");
  const withdrawn = vs.filter((v) => v.status === "withdrawn");
  const waiting = inFlight(proposed);

  let headline: string;
  if (proposed.length === 0) {
    headline = "Nothing waiting for your approval.";
  } else if (proposed.length === 1) {
    headline = `A change worth ${kes(waiting)} is waiting for your approval.`;
  } else {
    headline = `${proposed.length} changes worth ${kes(waiting)} are waiting for your approval.`;
  }

  return {
    total: vs.length,
    proposed: proposed.length,
    approved: approved.length,
    declined: declined.length,
    withdrawn: withdrawn.length,
    awaiting: proposed.length,
    inFlight: waiting,
    approvedDelta: approved.reduce((t, v) => t + v.amount, 0),
    approvedDays: approved.reduce((t, v) => t + v.days, 0),
    headline,
  };
}

export const sourceLabel = (kind: VariationSource) =>
  kind === "selection" ? "From your choice" : "Raised by the studio";

export function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}