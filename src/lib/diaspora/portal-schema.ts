// ATRO — client portal schema and planning rules.
//
// No imports and no I/O, so this module is unit-testable on its own and is the
// single definition of what a portal project may contain. `server.ts` imports it
// for the RPC validators and the planners below.

import { z } from "zod";

export const ProjectInput = z.object({
  title: z.string().trim().min(3).max(120),
  plot: z.string().trim().max(200).default(""),
  area: z.string().trim().max(60).default(""),
  contractValue: z.number().int().min(500_000).max(50_000_000_000),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clientCity: z.string().trim().max(80).default(""),
  clientTz: z.string().trim().max(60).default(""),
});

export type ProjectInput = z.infer<typeof ProjectInput>;

export const MilestoneActionInput = z.object({
  projectId: z.string().min(1),
  milestoneId: z.string().min(1),
});

export const PaymentActionInput = z.object({
  projectId: z.string().min(1),
  paymentId: z.string().min(1),
});

export const DecisionActionInput = z.object({
  projectId: z.string().min(1),
  decisionId: z.string().min(1),
  choice: z.string().min(1).max(200),
});

export const ProjectRefInput = z.object({ projectId: z.string().min(1) });

/* ── programme and payment planning ── */

/** Share of the programme each of the nine journey stages occupies (sums to 1). */
export const STAGE_WEIGHTS = [0.08, 0.1, 0.12, 0.1, 0.06, 0.28, 0.14, 0.08, 0.04];

export const PAYMENT_PLAN = [
  { pct: 10, label: "Mobilisation and design completion" },
  { pct: 10, label: "Substructure complete" },
  { pct: 15, label: "Superstructure — ground floor" },
  { pct: 15, label: "Superstructure — first floor" },
  { pct: 15, label: "Roof complete" },
  { pct: 15, label: "First fix — services" },
  { pct: 10, label: "Finishes and second fix" },
  { pct: 10, label: "Practical completion" },
] as const;

export type StageWindow = { start: string; end: string; spanDays: number };

/**
 * Spread the stage weights across a programme, returning each stage's window.
 * `toLabel` formats a Date, keeping this module free of locale concerns.
 */
export function planStages(
  start: Date,
  totalDays: number,
  count: number,
  toLabel: (d: Date) => string,
): StageWindow[] {
  const windows: StageWindow[] = [];
  let cursor = start.getTime();
  for (let i = 0; i < count; i += 1) {
    const weight = STAGE_WEIGHTS[i] ?? 1 / count;
    const spanDays = Math.max(7, Math.round(totalDays * weight));
    const end = cursor + spanDays * 86_400_000;
    windows.push({
      start: toLabel(new Date(cursor)),
      end: toLabel(new Date(end)),
      spanDays,
    });
    cursor = end;
  }
  return windows;
}

/** Tranches that sum exactly to the contract value — no rounding drift. */
export function planPayments(contractValue: number): {
  label: string;
  pct: number;
  amount: number;
}[] {
  return PAYMENT_PLAN.map((plan) => ({
    label: plan.label,
    pct: plan.pct,
    amount: Math.round((contractValue * plan.pct) / 100),
  }));
}

/** The payment schedule must always add back up to the contract value. */
export function paymentsTotal(contractValue: number): number {
  return planPayments(contractValue).reduce((sum, p) => sum + p.amount, 0);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.max(60, Math.round((to.getTime() - from.getTime()) / 86_400_000));
}