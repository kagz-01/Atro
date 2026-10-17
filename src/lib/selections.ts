/**
 * Selections — the priced choice a client makes against a budget line.
 *
 * Every portal in this market sells one thing above all else: an option with a
 * price, a deadline, and an allowance to measure it against. It exists because
 * "the client wanted the good tiles and nobody told them what it cost until
 * the end" is where a builder's margin goes.
 *
 * The rule this module enforces is the one that protects both sides: **a choice
 * never changes the contract.** It records what was chosen, what it costs, and
 * how far that sits from the allowance. If it is over, that is a conversation —
 * and a variation the studio prices deliberately — not a silent edit to the
 * contract sum.
 */

/** What a client can do with a selection right now. */
export type SelectionStatus = "open" | "chosen" | "closed";

export type SelectionOption = {
  id: string;
  label: string;
  description: string;
  supplier: string;
  /** What the option costs in total, not a delta — a total can be checked. */
  price: number;
  leadTime: string;
  recommended: boolean;
};

export type Selection = {
  id: string;
  ord: number;
  title: string;
  category: string;
  stage: string;
  /** Money set aside in the contract for this item. */
  allowance: number;
  /** ISO date, or "" when the studio has not fixed one. */
  deadline: string;
  status: SelectionStatus;
  note: string;
  options: SelectionOption[];
  chosenOptionId: string | null;
  chosenAt: string | null;
  chosenBy: string;
};

/**
 * How a choice sits against the allowance.
 *
 * `over` is the number that matters commercially: it is the margin conversation
 * the studio has to have, and it is deliberately not applied to the contract.
 */
export type AllowanceVerdict = {
  chosen: SelectionOption | null;
  price: number;
  allowance: number;
  /** price - allowance. Negative means the client chose under budget. */
  delta: number;
  state: "none" | "within" | "over" | "under";
  /** True when the studio still has to price this as a variation. */
  needsVariation: boolean;
};

export function allowanceVerdict(
  selection: Pick<Selection, "allowance" | "options" | "chosenOptionId">,
): AllowanceVerdict {
  const chosen = selection.options.find((o) => o.id === selection.chosenOptionId) ?? null;
  if (!chosen) {
    return {
      chosen: null,
      price: 0,
      allowance: selection.allowance,
      delta: 0,
      state: "none",
      needsVariation: false,
    };
  }
  const delta = chosen.price - selection.allowance;
  return {
    chosen,
    price: chosen.price,
    allowance: selection.allowance,
    delta,
    state: delta > 0 ? "over" : delta < 0 ? "under" : "within",
    // A choice exactly on the allowance needs nothing; anything above it does.
    needsVariation: delta > 0,
  };
}

/** Roll-up across a project's selections, for the client's budget picture. */
export type AllowanceSummary = {
  count: number;
  open: number;
  chosen: number;
  allowance: number;
  committed: number;
  /** Committed minus allowance: negative is a saving, positive is over. */
  variance: number;
  awaitingChoice: Selection[];
};

export function summariseAllowances(selections: Selection[]): AllowanceSummary {
  let allowance = 0;
  let committed = 0;
  let open = 0;
  let chosen = 0;
  for (const s of selections) {
    allowance += s.allowance;
    if (s.status === "open") {
      open += 1;
      continue;
    }
    chosen += 1;
    const verdict = allowanceVerdict(s);
    if (verdict.chosen) committed += verdict.price;
  }
  return {
    count: selections.length,
    open,
    chosen,
    allowance,
    committed,
    variance: committed - allowance,
    awaitingChoice: selections
      .filter((s) => s.status === "open")
      .sort((a, b) => a.ord - b.ord),
  };
}

/**
 * Whether a client can still choose.
 *
 * A deadline is the studio's commitment, not a suggestion: an option that has to
 * be ordered today cannot be chosen on Friday. Expired selections close rather
 * than disappear, because "we never saw it" is not a record.
 */
/**
 * A deadline stored as a bare `YYYY-MM-DD` means the end of that day, not its
 * start. A choice made at four in the afternoon on the day the option has to be
 * ordered is still in time, and refusing it would be the portal being pedantic
 * in the client's face on the one day it matters.
 */
function deadlineInstant(deadline: string): Date | null {
  if (!deadline) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(deadline.trim());
  const at = new Date(dateOnly ? `${deadline.trim()}T23:59:59.999Z` : deadline);
  return Number.isNaN(at.getTime()) ? null : at;
}

/** `YYYY-MM-DD` for a date, ignoring the time of day. */
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function canChoose(
  selection: Pick<Selection, "status" | "deadline">,
  now: Date,
): { ok: true } | { ok: false; reason: string } {
  if (selection.status === "chosen") {
    return { ok: false, reason: "You have already chosen for this one." };
  }
  if (selection.status === "closed") {
    return { ok: false, reason: "The studio has closed this selection." };
  }
  if (selection.deadline) {
    const at = deadlineInstant(selection.deadline);
    if (at && at.getTime() < now.getTime()) {
      return {
        ok: false,
        reason: `The deadline for this choice was ${selection.deadline}. Ask the studio to reopen it.`,
      };
    }
  }
  return { ok: true };
}

/**
 * Calendar days left, counted between dates so a deadline falling today reads as
 * zero rather than negative. Negative once it has passed.
 */
export function daysUntil(deadline: string, now: Date): number | null {
  if (!deadline) return null;
  const at = deadlineInstant(deadline);
  if (!at) return null;
  const MS_DAY = 86_400_000;
  return Math.round(
    (Date.parse(`${dayKey(at)}T00:00:00Z`) - Date.parse(`${dayKey(now)}T00:00:00Z`)) /
      MS_DAY,
  );
}

export const KES = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
export const kes = (n: number) => `KES ${KES.format(n)}`;

export const kesShort = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `KES ${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `KES ${Math.round(n / 1_000)}k`;
  return `KES ${KES.format(n)}`;
};

/** Phrasing the client can read without knowing what an allowance is. */
export function verdictLine(verdict: AllowanceVerdict): string {
  if (verdict.state === "none") return "";
  if (verdict.state === "within") return "Exactly the allowance — no change to the contract.";
  if (verdict.state === "under") {
    return `${kes(-verdict.delta)} of the allowance is not being spent. The studio will confirm what happens to it.`;
  }
  return `${kes(verdict.delta)} over the allowance. The studio will send it to you as a variation to approve before it is committed.`;
}
