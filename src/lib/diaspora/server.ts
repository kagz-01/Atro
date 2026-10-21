// ATRO — client portal data layer (server-only).
//
// Every function here is authorised with `authMiddleware` and every read AND
// write is scoped to `context.userId`. A signed-out caller gets a 401 from the
// middleware, never a partial dataset.

import { createServerFn } from "@tanstack/react-start";
import type { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { issueReceiptFor } from "@/lib/invoice-server";
import { leadProfile } from "@/lib/enquiry-lead";
import { notify } from "@/lib/notify";
import { toE164 } from "@/lib/phone";
import {
  DecisionActionInput,
  MilestoneActionInput,
  PaymentActionInput,
  ProjectInput,
  ProjectRefInput,
  paymentSchedule,
  programmeDays,
  stageWindows,
  trackById,
  type ProjectInput as ProjectBrief,
} from "@/lib/diaspora/portal-schema";
import {
  DECISIONS,
  MILESTONES,
  PAYMENTS,
  PORTAL_PROJECT,
  VAULT,
  WEEKLY_REPORT,
  type Decision,
  type Milestone,
  type Payment,
  type VaultDoc,
} from "@/lib/diaspora/portal";

/* ── shapes returned to the client (JSON-safe: no Date, no undefined) ── */

export type ActivityItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  at: string;
};

export type ProjectSummary = {
  id: string;
  reference: string;
  title: string;
  stage: string;
  progress: number;
  source: string;
  track: string;
  zone: string;
  isSample: boolean;
};

export type ProjectRecord = {
  id: string;
  reference: string;
  title: string;
  clientLabel: string;
  clientCity: string;
  clientTz: string;
  clientInitials: string;
  plot: string;
  area: string;
  contractType: string;
  startedLabel: string;
  targetLabel: string;
  stage: string;
  isSample: boolean;
  track: string;
  zone: string;
  contractValue: number;
  boqValue: number;
  budget: {
    certifiedToDate: number;
    paidToDate: number;
    currentlyCertified: number;
    retentionHeld: number;
    retentionPct: number;
    projectedAtCompletion: number;
  };
  schedule: {
    daysElapsed: number;
    daysTotal: number;
    daysRemaining: number;
    onTrack: boolean;
    varianceDays: number;
    note: string;
  };
  nextCall: {
    when: string;
    localTimeForYou: string;
    /**
     * The call as an instant, when the project has one — what "your time" is
     * computed from. Null on projects created before the moment was stored.
     */
    at: string | null;
    agenda: string[];
  };
  progress: number;
  createdAt: string;
};

export type WeeklyReportRecord = {
  week: string;
  period: string;
  preparedBy: string;
  summary: string;
  completed: string[];
  planned: string[];
  decisionsNeeded: string[];
  risks: string[];
  spend: { period: number; cumulative: number; againstBoq: string };
  photos: number;
  generated: boolean;
};

export type PortalPayload = {
  projects: ProjectSummary[];
  project: ProjectRecord;
  milestones: Milestone[];
  payments: Payment[];
  documents: VaultDoc[];
  decisions: Decision[];
  activity: ActivityItem[];
  weeklyReport: WeeklyReportRecord;
  /** `last_viewed_at` before this request — everything after it is "new". */
  previousVisit: string | null;
};

/* ── helpers ── */

function iso(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function str(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
}

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function arr(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => str(v));
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((v) => str(v)) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function objects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is Record<string, unknown> => !!v && typeof v === "object");
  }
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((v): v is Record<string, unknown> => !!v && typeof v === "object")
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

function todayLabel(): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

function shortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** The signed-in caller's project, or null when the id is not theirs. */
export async function ownedProject(sql: Sql, userId: string, projectId: string) {
  const rows = await sql<{ id: string }>`
    select id from portal_projects
    where id = ${projectId} and user_id = ${userId} and deleted_at is null limit 1
  `;
  return rows[0]?.id ?? null;
}

export async function logActivity(
  sql: Sql,
  projectId: string,
  kind: string,
  title: string,
  body = "",
) {
  await sql`
    insert into portal_activity (project_id, kind, title, body)
    values (${projectId}, ${kind}, ${title}, ${body})
  `;
}

/* ── row → domain mapping ── */

type ProjectRow = {
  id: string;
  reference: string;
  title: string;
  client_label: string;
  client_initials: string;
  client_city: string;
  client_tz: string | null;
  plot: string;
  area: string;
  contract_type: string;
  started_label: string;
  target_label: string;
  stage: string;
  source: string;
  track: string;
  zone: string;
  contract_value: number;
  boq_value: number;
  certified_to_date: number;
  paid_to_date: number;
  currently_certified: number;
  retention_held: number;
  retention_pct: number;
  projected_at_completion: number;
  days_elapsed: number;
  days_total: number;
  days_remaining: number;
  on_track: boolean;
  variance_days: number;
  programme_note: string;
  next_call_when: string;
  next_call_local: string;
  next_call_agenda: unknown;
  next_call_at: unknown;
  progress: number;
  last_viewed_at: unknown;
  created_at: unknown;
};

function toSummary(row: ProjectRow): ProjectSummary {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    stage: row.stage,
    progress: num(row.progress),
    source: row.source,
    track: row.track,
    zone: row.zone,
    isSample: row.source === "sample",
  };
}

function toRecord(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    clientLabel: row.client_label,
    clientCity: row.client_city,
    clientTz: row.client_tz ?? "",
    clientInitials: row.client_initials,
    plot: row.plot,
    area: row.area,
    contractType: row.contract_type,
    startedLabel: row.started_label,
    targetLabel: row.target_label,
    stage: row.stage,
    isSample: row.source === "sample",
    track: row.track,
    zone: row.zone,
    contractValue: num(row.contract_value),
    boqValue: num(row.boq_value),
    budget: {
      certifiedToDate: num(row.certified_to_date),
      paidToDate: num(row.paid_to_date),
      currentlyCertified: num(row.currently_certified),
      retentionHeld: num(row.retention_held),
      retentionPct: num(row.retention_pct, 5),
      projectedAtCompletion: num(row.projected_at_completion),
    },
    schedule: {
      daysElapsed: num(row.days_elapsed),
      daysTotal: num(row.days_total),
      daysRemaining: num(row.days_remaining),
      onTrack: row.on_track !== false,
      varianceDays: num(row.variance_days),
      note: row.programme_note,
    },
    nextCall: {
      when: row.next_call_when,
      localTimeForYou: row.next_call_local,
      at: iso(row.next_call_at),
      agenda: arr(row.next_call_agenda),
    },
    progress: num(row.progress),
    createdAt: iso(row.created_at) ?? "",
  };
}

/* ── sample project seeding ── */

const SAMPLE_ACTIVITY: { kind: string; title: string; body: string; daysAgo: number }[] = [
  {
    kind: "report",
    title: "Weekly report issued — Week 07",
    body: "Frame to first floor ring beam. 34 photographs attached.",
    daysAgo: 2,
  },
  {
    kind: "decision",
    title: "Roof covering samples dispatched",
    body: "Physical samples with courier tracking — approval required before order.",
    daysAgo: 3,
  },
  {
    kind: "payment",
    title: "Certificate QS/2026/0417-06 issued",
    body: "KES 480,000 certified, awaiting your release.",
    daysAgo: 4,
  },
  {
    kind: "milestone",
    title: "Slab deck reinforcement verified",
    body: "Photographed before pour. Signed off by the structural engineer.",
    daysAgo: 6,
  },
  {
    kind: "document",
    title: "Structural drawings Rev C uploaded",
    body: "Approved by the engineer of record — now in the vault.",
    daysAgo: 9,
  },
  {
    kind: "note",
    title: "Site visit scheduled with your project manager",
    body: "Structured walk planned for your next trip to Nairobi.",
    daysAgo: 12,
  },
];

async function seedSampleProject(sql: Sql, userId: string): Promise<string> {
  const p = PORTAL_PROJECT;
  const projectRows = await sql<{ id: string }>`
    insert into portal_projects (
      user_id, reference, title, client_label, client_initials, plot, area,
      contract_type, started_label, target_label, stage, source, track,
      service_slug, zone, contract_value, boq_value, certified_to_date,
      paid_to_date,
      currently_certified,
      retention_held, retention_pct, projected_at_completion, days_elapsed,
      days_total, days_remaining, on_track, variance_days, programme_note,
      next_call_when, next_call_local, next_call_agenda, progress, last_viewed_at
    ) values (
      ${userId}, ${p.reference}, ${p.title}, ${p.client}, ${p.clientInitials},
      ${p.plot}, ${p.area}, ${p.contractType}, ${p.started}, ${p.targetHandover},
      ${p.stage}, 'sample', 'construction', '', '', ${p.contractValue}, ${p.boqValue},
      ${p.budget.certifiedToDate}, ${p.budget.paidToDate},
      ${p.budget.currentlyCertified}, ${p.budget.retentionHeld},
      ${p.budget.retentionPct}, ${p.budget.projectedAtCompletion},
      ${p.schedule.daysElapsed}, ${p.schedule.daysTotal},
      ${p.schedule.daysRemaining}, ${p.schedule.onTrack},
      ${p.schedule.varianceDays}, ${p.schedule.note}, ${p.nextCall.when},
      ${p.nextCall.localTimeForYou}, ${JSON.stringify(p.nextCall.agenda)},
      ${p.overallProgress}, now()
    )
    returning id
  `;
  const projectId = projectRows[0]?.id;
  if (!projectId) throw new Error("Could not create the demonstration project");

  for (const m of MILESTONES) {
    await sql`
      insert into portal_milestones (
        project_id, ord, stage, name, status, progress, planned_start,
        planned_end, actual_end, summary, evidence, verified_by
      ) values (
        ${projectId}, ${m.order}, ${m.stage}, ${m.name}, ${m.status}, ${m.progress},
        ${m.plannedStart}, ${m.plannedEnd}, ${m.actualEnd ?? null}, ${m.summary},
        ${JSON.stringify(m.evidence ?? [])}, ${m.verifiedBy ?? null}
      )
    `;
  }

  for (let i = 0; i < PAYMENTS.length; i += 1) {
    const pay = PAYMENTS[i];
    await sql`
      insert into portal_payments (
        project_id, ord, label, stage, amount, status, due_date, paid_date,
        certificate, method, note
      ) values (
        ${projectId}, ${i + 1}, ${pay.label}, ${pay.stage}, ${pay.amount},
        ${pay.status}, ${pay.dueDate}, ${pay.paidDate ?? null},
        ${pay.certificate ?? null}, ${pay.method ?? null}, ${pay.note ?? null}
      )
    `;
  }

  for (let i = 0; i < VAULT.length; i += 1) {
    const doc = VAULT[i];
    await sql`
      insert into portal_documents (
        project_id, ord, name, category, issued, reference, size, state
      ) values (
        ${projectId}, ${i + 1}, ${doc.name}, ${doc.category}, ${doc.issued},
        ${doc.reference}, ${doc.size}, ${doc.state}
      )
    `;
  }

  for (let i = 0; i < DECISIONS.length; i += 1) {
    const d = DECISIONS[i];
    await sql`
      insert into portal_decisions (
        project_id, ord, date, title, detail, options, chosen, cost_impact, state
      ) values (
        ${projectId}, ${i + 1}, ${d.date}, ${d.title}, ${d.detail},
        ${JSON.stringify(d.options)}, ${d.chosen ?? null}, ${d.costImpact},
        ${d.state}
      )
    `;
  }

  for (const item of SAMPLE_ACTIVITY) {
    const at = new Date(Date.now() - item.daysAgo * 86_400_000);
    await sql`
      insert into portal_activity (project_id, kind, title, body, at)
      values (${projectId}, ${item.kind}, ${item.title}, ${item.body}, ${at.toISOString()})
    `;
  }

  await logActivity(
    sql,
    projectId,
    "note",
    "Demonstration project opened for you",
    "Replace it with your own project whenever you are ready — your live one carries your reference, your milestones and your certificates.",
  );

  return projectId;
}

/* ── project generation for a client-created project ── */

const NEW_PROJECT_DECISIONS = [
  {
    title: "Roof covering",
    detail:
      "Three options within the priced BOQ allowance. Samples can be dispatched to your address before any order is placed.",
    options: ["Stone-coated tile", "Concrete roof tile", "Metal sheet (profiled)"],
    costImpact: 0,
  },
  {
    title: "Internal wall finish",
    detail:
      "Two routes inside the allowance; the upgrade is priced as a variation so you see it before it lands on the ledger.",
    options: ["Emulsion on plaster (in allowance)", "Textured coating (+KES 180,000)"],
    costImpact: 0,
  },
];

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export async function generateProject(
  sql: Sql,
  userId: string,
  input: ProjectBrief,
  referenceOverride?: string,
  claimedEmail = "",
  clientName = "",
): Promise<string> {
  const start = new Date(`${input.startDate}T00:00:00Z`);
  const target = new Date(`${input.targetDate}T00:00:00Z`);
  const track = trackById(input.track);
  const totalDays = programmeDays(start, target);
  const today = new Date();
  const daysElapsed = Math.min(
    totalDays,
    Math.max(0, Math.round((today.getTime() - start.getTime()) / 86_400_000)),
  );
  const reference =
    referenceOverride ??
    `ATR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  // An unowned project waits for its client: no "You" label, their name instead.
  const clientLabel = claimedEmail
    ? clientName || claimedEmail
    : input.clientCity
      ? `You — ${input.clientCity}`
      : "You — your account";

  const projectRows = await sql<{ id: string }>`
    insert into portal_projects (
      user_id, reference, title, client_label, client_initials, plot, area,
      contract_type, started_label, target_label, stage, source, track,
      service_slug, zone, client_city, client_tz, client_phone, claimed_email,
      contract_value, days_elapsed, days_total, days_remaining, programme_note,
      next_call_when, next_call_local, next_call_agenda, progress, last_viewed_at
    ) values (
      ${userId}, ${reference}, ${input.title}, ${clientLabel}, ${clientLabel.slice(0, 2).toUpperCase()},
      ${input.plot || "Site reference pending"}, ${input.area || "—"},
      ${track.id === "construction" ? "Design and build" : track.label},
      ${shortDate(start)}, ${shortDate(target)},
      ${track.stages[0]?.name ?? "Mobilisation"}, 'created', ${track.id},
      ${input.serviceSlug}, ${input.zone}, ${input.clientCity},
      ${input.clientTz || null},
      ${input.clientPhone ? (toE164(input.clientPhone) ?? input.clientPhone) : ""},
      ${claimedEmail}, ${input.contractValue},
      ${daysElapsed}, ${totalDays},
      ${Math.max(0, totalDays - daysElapsed)},
      'Programme issued at contract signing. Milestone dates are planned, not promised — each one moves only when you approve it.',
      'To be scheduled', 'To be scheduled', ${"[]"}, 0, now()
    )
    returning id
  `;
  const projectId = projectRows[0]?.id;
  if (!projectId) throw new Error("Could not create the project");

  const windows = stageWindows(track, start, totalDays, shortDate);

  for (let i = 0; i < track.stages.length; i += 1) {
    const stage = track.stages[i];
    const window = windows[i];
    if (!stage || !window) break;
    await sql`
      insert into portal_milestones (
        project_id, ord, stage, name, status, progress, planned_start, planned_end, summary
      ) values (
        ${projectId}, ${i + 1}, ${track.label}, ${stage.name},
        ${i === 0 ? "active" : "pending"}, 0, ${window.start}, ${window.end},
        ${stage.summary}
      )
    `;
  }

  const tranches = paymentSchedule(track, input.contractValue);
  for (let i = 0; i < tranches.length; i += 1) {
    const tranche = tranches[i];
    if (!tranche) break;
    const due = addDays(start, Math.round((totalDays * (i + 1)) / tranches.length));
    await sql`
      insert into portal_payments (
        project_id, ord, label, stage, amount, status, due_date, note
      ) values (
        ${projectId}, ${i + 1}, ${tranche.label}, ${track.stages[i]?.name ?? track.label},
        ${tranche.amount}, 'scheduled', ${shortDate(due)},
        ${`${tranche.pct}% of contract value — released against a certificate.`}
      )
    `;
  }

  const openingDocs: { name: string; category: string; state: string; reference: string }[] = [
    { name: "Client agreement — draft", category: "Contract", state: "awaiting", reference },
    track.id === "construction" || track.id === "design"
      ? { name: "Measured BOQ — priced", category: "Payment", state: "awaiting", reference: `${reference}-BOQ` }
      : { name: "Scope of works — draft", category: "Contract", state: "awaiting", reference: `${reference}-SOW` },
  ];
  for (let i = 0; i < openingDocs.length; i += 1) {
    const doc = openingDocs[i];
    await sql`
      insert into portal_documents (project_id, ord, name, category, issued, reference, size, state)
      values (${projectId}, ${i + 1}, ${doc.name}, ${doc.category}, ${todayLabel()}, ${doc.reference}, '—', ${doc.state})
    `;
  }

  for (let i = 0; i < NEW_PROJECT_DECISIONS.length; i += 1) {
    const d = NEW_PROJECT_DECISIONS[i];
    await sql`
      insert into portal_decisions (project_id, ord, date, title, detail, options, chosen, cost_impact, state)
      values (
        ${projectId}, ${i + 1}, ${todayLabel()}, ${d.title}, ${d.detail},
        ${JSON.stringify(d.options)}, null, ${d.costImpact}, 'awaiting-client'
      )
    `;
  }

  await logActivity(
    sql,
    projectId,
    "note",
    "Project created",
    `Programme runs ${shortDate(start)} to ${shortDate(target)} · ${totalDays} days · contract value KES ${input.contractValue.toLocaleString("en-KE")}.`,
  );

  return projectId;
}

/* ── the payload ── */

const PROJECT_SELECT = `
  id, reference, title, client_label, client_initials, client_city, client_tz, plot, area,
  contract_type, started_label, target_label, stage, source, track, zone,
  contract_value,
  boq_value, certified_to_date, paid_to_date, currently_certified,
  retention_held, retention_pct, projected_at_completion, days_elapsed,
  days_total, days_remaining, on_track, variance_days, programme_note,
  next_call_when, next_call_local, next_call_agenda, next_call_at, progress,
  last_viewed_at, created_at`;

/**
 * PROJECT_SELECT is a module constant of column identifiers — never input — so
 * it is interpolated into the statement text while the values stay bound as
 * parameters.
 */
function selectOwnedProjects(sql: Sql, userId: string) {
  return sql.query<ProjectRow>(
    `select ${PROJECT_SELECT} from portal_projects where user_id = $1 and deleted_at is null order by created_at desc`,
    [userId],
  );
}

function selectProjectById(sql: Sql, projectId: string) {
  return sql.query<ProjectRow>(
    `select ${PROJECT_SELECT} from portal_projects where id = $1 limit 1`,
    [projectId],
  );
}

/**
 * Assemble the payload for ONE project from its row.
 *
 * Takes the row rather than a user id so the client path (scoped by owner) and
 * the staff path (scoped by `requireStaff`) share one assembler and cannot
 * drift. `markViewed` is false for staff, because a studio member opening a
 * project is not the client opening it.
 */
async function buildProjectPayload(
  sql: Sql,
  row: ProjectRow,
  markViewed: boolean,
  /** Owner of the project, used to fall back to their profile. */
  userId: string,
): Promise<PortalPayload> {

  const projectId = row.id;

  const previousVisit = iso(row.last_viewed_at);

  // Sequential, not Promise.all: PGLite is a single embedded connection and
  // interleaved statements there can resolve their results out of order.
  const milestoneRows = await sql<{
    id: string;
    ord: number;
    stage: string;
    name: string;
    status: string;
    progress: number;
    planned_start: string;
    planned_end: string;
    actual_end: string | null;
    summary: string;
    evidence: unknown;
    verified_by: string | null;
    approval_ready: boolean;
  }>`select 
    id, ord, stage, name, status, progress, planned_start,
      planned_end, actual_end, summary, evidence, verified_by, approval_ready
    from portal_milestones where project_id = ${projectId} order by ord`;
  const paymentRows = await sql<{
    id: string;
    ord: number;
    label: string;
    stage: string;
    amount: number;
    status: string;
    due_date: string;
    paid_date: string | null;
    certificate: string | null;
    method: string | null;
    note: string | null;
  }>`select 
    id, ord, label, stage, amount, status, due_date,
      paid_date, certificate, method, note from portal_payments where project_id = ${projectId} order by ord`;
  const documentRows = await sql<{
    id: string;
    ord: number;
    name: string;
    category: string;
    issued: string;
    reference: string;
    size: string;
    state: string;
  }>`select 
    id, ord, name, category, issued, reference, size, state from portal_documents where project_id = ${projectId} order by ord`;
  const decisionRows = await sql<{
    id: string;
    ord: number;
    date: string;
    title: string;
    detail: string;
    options: unknown;
    chosen: string | null;
    cost_impact: number;
    state: string;
  }>`select 
    id, ord, date, title, detail, options, chosen,
      cost_impact, state from portal_decisions where project_id = ${projectId} order by ord`;
  const activityRows = await sql<{
    id: string;
    kind: string;
    title: string;
    body: string;
    at: unknown;
  }>`select 
    id, kind, title, body, at from portal_activity where project_id = ${projectId} order by at desc limit 40`;

  if (markViewed) {
    await sql`
      update portal_projects set last_viewed_at = now(), updated_at = now()
      where id = ${projectId}
    `;
  }

  const milestones: Milestone[] = milestoneRows.map((m, i) => ({
    id: m.id,
    order: num(m.ord, i + 1),
    stage: m.stage,
    name: m.name,
    status: m.status as Milestone["status"],
    progress: num(m.progress),
    plannedStart: m.planned_start,
    plannedEnd: m.planned_end,
    actualEnd: m.actual_end ?? undefined,
    summary: m.summary,
    evidence: objects(m.evidence).map((e) => ({
      date: str(e.date),
      caption: str(e.caption),
      detail: str(e.detail),
    })),
    verifiedBy: m.verified_by ?? undefined,
    approvalReady: m.approval_ready === true,
  }));

  const payments: Payment[] = paymentRows.map((p) => ({
    id: p.id,
    label: p.label,
    stage: p.stage,
    amount: num(p.amount),
    status: p.status as Payment["status"],
    dueDate: p.due_date,
    paidDate: p.paid_date ?? undefined,
    certificate: p.certificate ?? undefined,
    method: p.method ?? undefined,
    note: p.note ?? undefined,
  }));

  const documents: VaultDoc[] = documentRows.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category as VaultDoc["category"],
    issued: d.issued,
    reference: d.reference,
    size: d.size,
    state: d.state as VaultDoc["state"],
  }));

  const decisions: Decision[] = decisionRows.map((d) => ({
    id: d.id,
    date: d.date,
    title: d.title,
    detail: d.detail,
    options: arr(d.options),
    chosen: d.chosen ?? undefined,
    costImpact: num(d.cost_impact),
    state: d.state as Decision["state"],
  }));

  const activity: ActivityItem[] = activityRows.map((a) => ({
    id: a.id,
    kind: a.kind,
    title: a.title,
    body: a.body,
    at: iso(a.at) ?? "",
  }));

  const generated = row.source !== "sample";
  const weeklyReport: WeeklyReportRecord = generated
    ? {
        week: `Week ${String(Math.max(1, Math.ceil(num(row.days_elapsed) / 7))).padStart(2, "0")}`,
        period: `${row.started_label} onwards`,
        preparedBy: "ATRO site team",
        summary:
          "Your first written report is issued the Friday after site work begins — what was done, what is planned, what needs your decision, with photographs.",
        completed: [],
        planned: ["Site establishment and setting out", "Statutory registrations in progress"],
        decisionsNeeded: decisions
          .filter((d) => d.state === "awaiting-client")
          .map((d) => d.title),
        risks: [],
        spend: {
          period: 0,
          cumulative: num(row.paid_to_date),
          againstBoq: "No certification yet — spend begins with the first certificate.",
        },
        photos: 0,
        generated: true,
      }
    : {
        week: WEEKLY_REPORT.week,
        period: WEEKLY_REPORT.period,
        preparedBy: WEEKLY_REPORT.preparedBy,
        summary: WEEKLY_REPORT.summary,
        completed: [...WEEKLY_REPORT.completed],
        planned: [...WEEKLY_REPORT.planned],
        decisionsNeeded: [...WEEKLY_REPORT.decisionsNeeded],
        risks: [...WEEKLY_REPORT.risks],
        spend: {
          period: WEEKLY_REPORT.spend.period,
          cumulative: WEEKLY_REPORT.spend.cumulative,
          againstBoq: WEEKLY_REPORT.spend.againstBoq,
        },
        photos: WEEKLY_REPORT.photos,
        generated: false,
      };

  // A project carries its own copy of who the client is, because a project
  // opened for someone before they had a profile has to render on its own. Now
  // that a profile exists, an empty copy falls back to it — so a client who adds
  // their name once is not still anonymous on a project they opened earlier.
  const record = toRecord(row);
  // The staff path passes no owner, so a project opened before a profile existed
  // is shown exactly as it was typed rather than back-filled behind the studio's
  // back.
  if (userId && (!record.clientLabel || !record.clientCity)) {
    const [p] = await sql<{ display_name: string; city: string }>`
      select display_name, city from client_profile where user_id = ${userId}
    `;
    if (p) {
      record.clientLabel ||= p.display_name;
      record.clientCity ||= p.city;
      record.clientInitials ||= p.display_name.slice(0, 2).toUpperCase();
    }
  }

  return {
    projects: [toSummary(row)],
    project: record,
    milestones,
    payments,
    documents,
    decisions,
    activity,
    weeklyReport,
    previousVisit,
  };
}

/* ── validators re-exported so the RPC layer and the tests share one source ── */

export { ProjectInput, MilestoneActionInput, PaymentActionInput, DecisionActionInput, ProjectRefInput };
export type { ProjectBrief };

/** Normalise an email for comparison; providers differ on case and nothing else. */
function normalise(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

/**
 * Take ownership of any project the studio opened for this person before they
 * had an account. This is what makes an enquiry convertible: the work is set
 * up first, and the client finds it waiting the first time they sign in.
 *
 * The match is on the verified session — the email sign-in proved, or the phone
 * number OTP proved — never on a lookup of our own `user` table. That table is
 * Better Auth's (migrations/0001_auth.sql) and nothing in this codebase writes
 * it, so reading it back returned nobody: every provisioned project sat
 * unclaimed forever, most of all for the phone sign-ins that /login actually
 * offers. The enquiry's number is stored E.164 (enquiry-server.ts) and so is
 * the session's, so the two meet as written.
 *
 * Returns the claimed project ids — one is the normal case — so the caller can
 * seed the person's profile from the lead's own enquiry.
 */
export async function claimProvisionedProjects(
  sql: Sql,
  userId: string,
  session: { email: string; phone: string | null },
): Promise<string[]> {
  const email = normalise(session.email);
  const phone = (session.phone ?? "").trim();
  if (!email && !phone) return [];

  const claimed = await sql<{ id: string }>`
    update portal_projects set user_id = ${userId}
    where user_id = ''
      and (
        (${email} <> '' and lower(claimed_email) = ${email})
        or (${phone} <> '' and client_phone = ${phone})
      )
    returning id
  `;
  const ids = claimed.map((row) => row.id);
  if (ids.length) await seedClaimedProfile(sql, userId, ids);
  return ids;
}

/**
 * The person behind a claim gets the profile their enquiry already described —
 * typed `diaspora` and carrying the zone, so the Abroad view, the "your clock"
 * call quotes and the consent log exist on the first load rather than after a
 * trip through Settings. Only ever fills a hole: a profile the client has
 * already shaped is theirs to keep.
 *
 * Consent columns are left to their table defaults (email and WhatsApp on, SMS
 * off) — the record of what the studio may use, not a permission grab.
 */
async function seedClaimedProfile(sql: Sql, userId: string, projectIds: string[]) {
  const existing = await sql<{ user_id: string }>`
    select user_id from client_profile where user_id = ${userId} limit 1
  `;
  if (existing[0]) return;

  // A claim is almost always a single project; walk the ids rather than bend an
  // array parameter across the uuid/text boundary.
  for (const projectId of projectIds) {
    const rows = await sql<{
      name: string;
      email: string;
      phone: string;
      diaspora: boolean;
      diaspora_country: string;
      diaspora_timezone: string;
    }>`
      select name, email, phone, diaspora, diaspora_country, diaspora_timezone
      from enquiries where project_id = ${projectId} limit 1
    `;
    const lead = rows[0];
    if (!lead) continue;
    const profile = leadProfile({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      diaspora: lead.diaspora,
      country: lead.diaspora_country,
      timezone: lead.diaspora_timezone,
    });
    if (!profile.displayName) continue;
    await sql`
      insert into client_profile (
        user_id, display_name, initials, phone, email, country, timezone, client_type
      ) values (
        ${userId}, ${profile.displayName}, ${profile.initials}, ${profile.phone},
        ${profile.email}, ${profile.country}, ${profile.timezone}, ${profile.clientType}
      )
      on conflict (user_id) do nothing
    `;
    return;
  }
}

/** The signed-in owner's newest project; seeds the sample on first read. */
export async function loadPortal(
  sql: Sql,
  userId: string,
  session: { email: string; phone: string | null },
): Promise<PortalPayload> {
  await claimProvisionedProjects(sql, userId, session);
  let rows = await selectOwnedProjects(sql, userId);
  if (rows.length === 0) {
    await seedSampleProject(sql, userId);
    rows = await selectOwnedProjects(sql, userId);
  }
  const row = rows[0];
  if (!row) throw new Error("No project available for this account.");
  return buildProjectPayload(sql, row, true, userId);
}

/** Any single project, for staff. Callers must gate with `requireStaff()` first. */
export async function loadProjectById(sql: Sql, projectId: string): Promise<PortalPayload> {
  const rows = await selectProjectById(sql, projectId);
  const row = rows[0];
  if (!row) throw new Error("Project not found.");
  return buildProjectPayload(sql, row, false, "");
}

export async function createProjectFor(
  sql: Sql,
  userId: string,
  input: ProjectBrief,
): Promise<{ projectId: string }> {
  // Parse here, not only in the RPC wrapper: an operation must enforce its own
  // limits, so no caller can write a row the UI would refuse to create.
  const data = ProjectInput.parse(input);
  if (new Date(data.targetDate) <= new Date(data.startDate)) {
    throw new Error("The target handover must be after the start date.");
  }
  return { projectId: await generateProject(sql, userId, data) };
}

export async function approveMilestoneFor(
  sql: Sql,
  userId: string,
  data: z.infer<typeof MilestoneActionInput>,
): Promise<{ ok: true; progress: number }> {
  const projectId = await ownedProject(sql, userId, data.projectId);
  if (!projectId) throw new Error("Project not found.");

  const target = await sql<{ name: string; status: string; approval_ready: boolean }>`
    select name, status, approval_ready from portal_milestones
    where id = ${data.milestoneId} and project_id = ${projectId} limit 1
  `;
  const milestone = target[0];
  if (!milestone) throw new Error("Milestone not found.");
  if (milestone.status === "complete") throw new Error("That milestone is already approved.");
  // The studio decides when a stage is finished, not the client. Without this
  // gate a client could mark any stage complete on their own — including one
  // the studio had not started — and the progress bar would report work that
  // was never done.
  if (!milestone.approval_ready) {
    throw new Error("The studio has not marked this stage ready for your approval yet.");
  }

  await sql`
    update portal_milestones
    set status = 'complete', progress = 100, actual_end = ${todayLabel()},
        approved_at = now(), approved_by = ${userId}, approval_ready = false
    where id = ${data.milestoneId} and project_id = ${projectId}
  `;

  const next = await sql<{ id: string }>`
    select id from portal_milestones
    where project_id = ${projectId} and status = 'pending'
    order by ord limit 1
  `;
  if (next[0]) {
    await sql`
      update portal_milestones set status = 'active', progress = 0
      where id = ${next[0].id} and project_id = ${projectId}
    `;
  }

  const stats = await sql<{ done: number; total: number }>`
    select count(*) filter (where status = 'complete') as done, count(*) as total
    from portal_milestones where project_id = ${projectId}
  `;
  const progress = Math.round((num(stats[0]?.done) / Math.max(1, num(stats[0]?.total))) * 100);

  const stageRow = await sql<{ name: string }>`
    select name from portal_milestones
    where project_id = ${projectId} and status <> 'complete'
    order by ord limit 1
  `;

  await sql`
    update portal_projects
    set progress = ${progress}, stage = ${stageRow[0]?.name ?? "Handover"}, updated_at = now()
    where id = ${projectId} and user_id = ${userId}
  `;

  await logActivity(
    sql,
    projectId,
    "milestone",
    `Milestone approved: ${milestone.name}`,
    `Marked complete from your portal. Progress is now ${progress}%.`,
  );

  // The client signing off a stage is the studio's cue to move to the next one
  // (and, on the final stage, to release retention). Telling the studio here
  // means the console's next action is never a surprise discovered by accident.
  await notify({
    projectId,
    kind: "milestone",
    title: `Milestone approved: ${milestone.name}`,
    body: `The client signed off. Progress is now ${progress}%.`,
    audience: "studio",
  });

  return { ok: true, progress };
}

export async function releasePaymentFor(
  sql: Sql,
  userId: string,
  data: z.infer<typeof PaymentActionInput>,
): Promise<{ ok: true; paidToDate: number; receiptNumber: string | null }> {
  const projectId = await ownedProject(sql, userId, data.projectId);
  if (!projectId) throw new Error("Project not found.");

  const rows = await sql<{
    label: string;
    amount: number;
    status: string;
    certificate: string | null;
  }>`
    select label, amount, status, certificate from portal_payments
    where id = ${data.paymentId} and project_id = ${projectId} limit 1
  `;
  const payment = rows[0];
  if (!payment) throw new Error("Payment not found.");
  if (payment.status === "paid") throw new Error("That payment is already released.");
  if (payment.status !== "certified") {
    throw new Error("Only certified payments can be released.");
  }

  const amount = num(payment.amount);
  await sql`
    update portal_payments
    set status = 'paid', paid_date = ${todayLabel()},
        method = 'Bank transfer — released from portal'
    where id = ${data.paymentId} and project_id = ${projectId}
  `;

  await sql`
    update portal_projects
    set paid_to_date = paid_to_date + ${amount},
        currently_certified = greatest(0, currently_certified - ${amount}),
        updated_at = now()
    where id = ${projectId} and user_id = ${userId}
  `;

  await logActivity(
    sql,
    projectId,
    "payment",
    `Payment released: ${payment.label}`,
    `KES ${amount.toLocaleString("en-KE")} released against the certificate.`,
  );

  const receipt = await issueReceiptFor(sql, {
    projectId,
    paymentId: data.paymentId,
    label: payment.label,
    certificate: payment.certificate ?? "certificate on file",
    amount,
  });

  await notify({
    projectId,
    kind: "payment",
    title: `Payment received: ${payment.label}`,
    body: `KES ${amount.toLocaleString("en-KE")} received. Your receipt is ready to keep or forward to your bank.`,
    documentUrl: receipt ? `/portal/document/${receipt.id}` : undefined,
  });

  // Money in is the studio's news too. The client's copy above is the receipt;
  // this is the ledger catching up with whoever runs the accounts.
  await notify({
    projectId,
    kind: "payment",
    title: `Payment received: ${payment.label}`,
    body: `KES ${amount.toLocaleString("en-KE")} released by the client against ${payment.certificate ?? "the certificate"}.`,
    audience: "studio",
  });

  return { ok: true, paidToDate: amount, receiptNumber: receipt?.number ?? null };
}

export async function recordDecisionFor(
  sql: Sql,
  userId: string,
  data: z.infer<typeof DecisionActionInput>,
): Promise<{ ok: true }> {
  const projectId = await ownedProject(sql, userId, data.projectId);
  if (!projectId) throw new Error("Project not found.");

  const rows = await sql<{ title: string; options: unknown; state: string }>`
    select title, options, state from portal_decisions
    where id = ${data.decisionId} and project_id = ${projectId} limit 1
  `;
  const decision = rows[0];
  if (!decision) throw new Error("Decision not found.");
  if (decision.state === "decided") throw new Error("That decision is already recorded.");
  if (!arr(decision.options).includes(data.choice)) {
    throw new Error("Choose one of the listed options.");
  }

  await sql`
    update portal_decisions
    set chosen = ${data.choice}, state = 'decided', decided_at = now()
    where id = ${data.decisionId} and project_id = ${projectId}
  `;

  await logActivity(
    sql,
    projectId,
    "decision",
    `Decision recorded: ${decision.title}`,
    `You chose “${data.choice}”. It is now in the decision log with today's date.`,
  );

  // The studio asked the question; they need the answer. This is the client
  // answering it, so the audience is the studio — the same reason the
  // variation and message paths are explicit about theirs.
  await notify({
    projectId,
    kind: "decision",
    title: `Decision recorded: ${decision.title}`,
    body: `The client chose “${data.choice}”.`,
    audience: "studio",
  });

  return { ok: true };
}

export async function deleteProjectFor(
  sql: Sql,
  userId: string,
  data: z.infer<typeof ProjectRefInput>,
): Promise<{ ok: true }> {
  const projectId = await ownedProject(sql, userId, data.projectId);
  if (!projectId) throw new Error("Project not found.");
  // Archive, not erase. A hard delete cascaded through every message,
  // certificate and photograph attached to the project — the studio lost its
  // record of work actually done. Soft-deleting keeps the row for the studio's
  // books and simply takes it out of the client's view.
  await sql`
    update portal_projects set deleted_at = now()
    where id = ${projectId} and user_id = ${userId}
  `;
  return { ok: true };
}

/* ── server functions: resolve the verified user, then call the operation ── */

export const getPortal = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) =>
    loadPortal(await getSql(), context.userId, {
      email: context.email,
      phone: context.phone,
    }),
  );

export const createPortalProject = createServerFn({ method: "POST" })
  .validator(ProjectInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => createProjectFor(await getSql(), context.userId, data));

export const approveMilestone = createServerFn({ method: "POST" })
  .validator(MilestoneActionInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) =>
    approveMilestoneFor(await getSql(), context.userId, data),
  );

export const releasePayment = createServerFn({ method: "POST" })
  .validator(PaymentActionInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => releasePaymentFor(await getSql(), context.userId, data));

export const recordDecision = createServerFn({ method: "POST" })
  .validator(DecisionActionInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => recordDecisionFor(await getSql(), context.userId, data));

export const deletePortalProject = createServerFn({ method: "POST" })
  .validator(ProjectRefInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => deleteProjectFor(await getSql(), context.userId, data));
