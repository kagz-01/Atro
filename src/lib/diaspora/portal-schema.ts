// ATRO — client portal schema and planning rules.
//
// No imports and no I/O, so this module is unit-testable on its own and is the
// single definition of what a portal project may contain. `server.ts` imports it
// for the RPC validators and the planners below.

import { z } from "zod";
import { TRACK_IDS } from "./tracks.ts";

export const ProjectInput = z.object({
  title: z.string().trim().min(3).max(120),
  plot: z.string().trim().max(200).default(""),
  area: z.string().trim().max(60).default(""),
  contractValue: z.number().int().min(500_000).max(50_000_000_000),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clientCity: z.string().trim().max(80).default(""),
  clientTz: z.string().trim().max(60).default(""),
  track: z.enum(TRACK_IDS as [string, ...string[]]).default("construction"),
  serviceSlug: z.string().trim().max(80).default(""),
  zone: z.string().trim().max(60).default(""),
  clientPhone: z
    .string()
    .trim()
    .regex(/^\+[\d\s-]{7,20}$/, "Include the country code, e.g. +254 7XX XXX XXX")
    .max(24)
    .or(z.literal(""))
    .default(""),
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

/**
 * Everything below delegates to `tracks.ts`, so a track is defined once and both
 * the planners and the portal form read the same shape. These re-exports exist so
 * existing callers keep working while the track becomes the source of truth.
 */

export { TRACK_IDS } from "./tracks.ts";

export type ProjectBrief = z.infer<typeof ProjectInput>;

export {
  type StageWindow,
  type Track,
  type TrackId,
  TRACKS,
  TRACK_LIST,
  trackById,
  isTrackId,
  normalisedWeights,
  stageWindows,
  paymentSchedule,
  paymentsTotal,
  programmeDays,
} from "./tracks.ts";
