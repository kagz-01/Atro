// ATRO staff operations — the write side of the client platform.
//
// Everything here starts with `requireStaff()`, so an account that is not on the
// `client_role` allowlist cannot reach these functions at all: there is no
// client-supplied id that widens the blast radius. Unlike the client-side
// operations in `diaspora/server.ts`, these are deliberately NOT scoped by
// `user_id` — staff work across every client's project by design.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import type { StaffIdentity } from "@/lib/staff";
import { loadProjectById, logActivity, type PortalPayload } from "@/lib/diaspora/server";
import { channelStatus, notificationLog, notify, retryPending } from "@/lib/notify";
import { issueCertificateFor, issueStatementFor } from "@/lib/invoice-server";

/* ── input ── */

const UpdateMilestone = z.object({
  projectId: z.string().min(1),
  milestoneId: z.string().min(1),
  status: z.enum(["pending", "active", "blocked", "complete"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  note: z.string().trim().max(600).optional(),
});

const AddEvidence = z.object({
  projectId: z.string().min(1),
  milestoneId: z.string().min(1),
  date: z.string().trim().max(40).default(""),
  caption: z.string().trim().min(3).max(160),
  detail: z.string().trim().max(600).default(""),
});

const RaiseDecision = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(3).max(160),
  detail: z.string().trim().max(1200).default(""),
  options: z.array(z.string().trim().min(1).max(120)).min(2).max(6),
  costImpact: z.number().int().default(0),
});

const CertifyPayment = z.object({
  projectId: z.string().min(1),
  paymentId: z.string().min(1),
  certificate: z.string().trim().min(3).max(80),
});

const AddDocument = z.object({
  projectId: z.string().min(1),
  name: z.string().trim().min(3).max(160),
  category: z.enum(["Contract", "Approval", "Certificate", "Payment", "Drawing", "Report"]),
  reference: z.string().trim().max(80).default(""),
  state: z.enum(["verified", "signed", "awaiting"]).default("awaiting"),
});

const PostUpdate = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().max(2000).default(""),
  kind: z.enum(["report", "note", "milestone", "payment", "decision", "document"]).default("note"),
});

/**
 * Resolve the verified staff identity. The import is dynamic because the session
 * guard is server-only and this module is also imported by the browser (for the
 * RPC stubs) — a static import of a `*.server.*` file is rejected at build time.
 */
async function requireStaff(): Promise<StaffIdentity> {
  const { requireStaff: guard } = await import("@/lib/staff-session.server");
  return guard();
}

export type StaffProjectSummary = {
  id: string;
  userId: string;
  reference: string;
  title: string;
  clientLabel: string;
  clientCity: string;
  stage: string;
  progress: number;
  source: string;
  daysRemaining: number;
  onTrack: boolean;
  contractValue: number;
  paidToDate: number;
  currentlyCertified: number;
  openDecisions: number;
  blockedStages: number;
  lastActivityAt: string | null;
  lastViewedAt: string | null;
  createdAt: string;
};

/* ── reads ── */

/** What was sent, what was skipped and why — so a missing message is explainable. */
export const getDeliveryLog = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    return {
      channels: channelStatus(),
      log: await notificationLog(sql, data.projectId),
    };
  });

export const issueStatementForProject = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const issued = await issueStatementFor(sql, "ATRO", data.projectId);
    if (!issued) throw new Error("Could not issue the statement.");
    return issued;
  });

export const retryDeliveries = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const queued = await retryPending(sql, data.projectId);
    return { ok: true as const, queued };
  });

/** Read-only role lookup for the UI: a session exists, and is it staff? */
export const getMyStaffRole = createServerFn({ method: "GET" }).handler(async () => {
  const { currentStaff } = await import("@/lib/staff-session.server");
  const staff = await currentStaff();
  return { userId: staff?.userId ?? null, role: staff?.role ?? null };
});

export const getStaffProject = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }): Promise<PortalPayload> => {
    await requireStaff();
    return loadProjectById(await getSql(), data.projectId);
  });

export const listStaffProjects = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaff();
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`
    select p.id, p.user_id, p.reference, p.title, p.client_label, p.client_city,
      p.stage, p.progress, p.source, p.days_remaining, p.on_track, p.contract_value,
      p.paid_to_date, p.currently_certified, p.last_viewed_at, p.created_at,
      coalesce((select count(*) from portal_decisions d
        where d.project_id = p.id and d.state <> 'decided'), 0) as open_decisions,
      coalesce((select count(*) from portal_milestones m
        where m.project_id = p.id and m.status = 'blocked'), 0) as blocked_stages,
      (select max(a.at) from portal_activity a where a.project_id = p.id) as last_activity_at
    from portal_projects p
    order by
      (select max(a.at) from portal_activity a where a.project_id = p.id) desc nulls last,
      p.created_at desc
  `;

  return rows.map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    reference: String(row.reference),
    title: String(row.title),
    clientLabel: String(row.client_label ?? ""),
    clientCity: String(row.client_city ?? ""),
    stage: String(row.stage ?? ""),
    progress: Number(row.progress ?? 0),
    source: String(row.source ?? ""),
    daysRemaining: Number(row.days_remaining ?? 0),
    onTrack: row.on_track !== false,
    contractValue: Number(row.contract_value ?? 0),
    paidToDate: Number(row.paid_to_date ?? 0),
    currentlyCertified: Number(row.currently_certified ?? 0),
    openDecisions: Number(row.open_decisions ?? 0),
    blockedStages: Number(row.blocked_stages ?? 0),
    lastActivityAt: iso(row.last_activity_at),
    lastViewedAt: iso(row.last_viewed_at),
    createdAt: iso(row.created_at) ?? "",
  }));
});

function iso(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/* ── writes ── */

/** Progress and stage recomputed from the milestone rows, never set by hand. */
async function recomputeProgress(sql: Sql, projectId: string) {
  const stats = await sql<{ done: number; total: number }>`
    select count(*) filter (where status = 'complete') as done, count(*) as total
    from portal_milestones where project_id = ${projectId}
  `;
  const done = Number(stats[0]?.done ?? 0);
  const total = Math.max(1, Number(stats[0]?.total ?? 0));
  const progress = Math.round((done / total) * 100);

  const stageRow = await sql<{ name: string }>`
    select name from portal_milestones
    where project_id = ${projectId} and status <> 'complete'
    order by ord limit 1
  `;

  await sql`
    update portal_projects
    set progress = ${progress}, stage = ${stageRow[0]?.name ?? "Handover"}, updated_at = now()
    where id = ${projectId}
  `;

  return { progress, stage: stageRow[0]?.name ?? "Handover" };
}

export async function updateMilestoneFor(
  sql: Sql,
  staff: { email: string; userId: string },
  data: z.infer<typeof UpdateMilestone>,
) {
  const current = await sql<{ name: string; status: string; progress: number }>`
      select name, status, progress from portal_milestones
      where id = ${data.milestoneId} and project_id = ${data.projectId} limit 1
    `;
  const milestone = current[0];
  if (!milestone) throw new Error("Milestone not found on that project.");

  const status = data.status ?? milestone.status;
  const progress = status === "complete" ? 100 : (data.progress ?? milestone.progress ?? 0);

  await sql`
      update portal_milestones
      set status = ${status}, progress = ${Math.max(0, Math.min(100, progress))},
          actual_end = case when ${status} = 'complete' then coalesce(actual_end, ${todayLabel()})
                            else actual_end end
      where id = ${data.milestoneId} and project_id = ${data.projectId}
    `;

  // Completing a stage opens the next one, so the client sees forward motion.
  if (status === "complete") {
    const next = await sql<{ id: string }>`
        select id from portal_milestones
        where project_id = ${data.projectId} and status = 'pending'
        order by ord limit 1
      `;
    if (next[0]) {
      await sql`
          update portal_milestones set status = 'active'
          where id = ${next[0].id} and project_id = ${data.projectId}
        `;
    }
  }

  const result = await recomputeProgress(sql, data.projectId);
  const title = `${milestone.name} — ${statusLabel(status)}`;
  const body = data.note?.trim() || `Updated by ${staff.email}.`;
  await logActivity(sql, data.projectId, "milestone", title, body);
  await notify({
    projectId: data.projectId,
    kind: "milestone",
    title,
    body: `${body} Your project is now ${result.progress}% complete.`,
  });

  return { ok: true as const, ...result };
}

function statusLabel(status: string): string {
  if (status === "complete") return "marked complete";
  if (status === "blocked") return "flagged blocked";
  if (status === "active") return "started";
  return "reset to not started";
}

function todayLabel(): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export async function addMilestoneEvidenceFor(
  sql: Sql,
  staff: { email: string; userId: string },
  data: z.infer<typeof AddEvidence>,
) {
  const rows = await sql<{ id: string; name: string; evidence: unknown }>`
      select id, name, evidence from portal_milestones
      where id = ${data.milestoneId} and project_id = ${data.projectId} limit 1
    `;
  const milestone = rows[0];
  if (!milestone) throw new Error("Milestone not found on that project.");

  const existing = Array.isArray(milestone.evidence) ? milestone.evidence : [];
  const next = [
    ...existing,
    {
      date: data.date || todayLabel(),
      caption: data.caption,
      detail: data.detail || `Logged by ${staff.email}.`,
    },
  ];

  await sql`
      update portal_milestones set evidence = ${JSON.stringify(next)}
      where id = ${data.milestoneId} and project_id = ${data.projectId}
    `;

  await logActivity(sql, data.projectId, "milestone", `Evidence added to ${milestone.name}`, data.caption);
  await notify({
    projectId: data.projectId,
    kind: "milestone",
    title: `New site record: ${milestone.name}`,
    body: data.detail || data.caption,
  });

  return { ok: true as const, count: next.length };
}

export async function raiseDecisionFor(
  sql: Sql,
  staff: { email: string; userId: string },
  data: z.infer<typeof RaiseDecision>,
) {
  const next = await sql<{ n: number }>`
      select coalesce(max(ord), 0) + 1 as n from portal_decisions where project_id = ${data.projectId}
    `;
  const ord = Number(next[0]?.n ?? 1);

  await sql`
      insert into portal_decisions (project_id, ord, date, title, detail, options, cost_impact, state)
      values (${data.projectId}, ${ord}, ${todayLabel()}, ${data.title}, ${data.detail},
              ${JSON.stringify(data.options)}, ${data.costImpact}, 'awaiting-client')
    `;

  const choices = data.options.map((o) => `• ${o}`).join(" ");
  await logActivity(sql, data.projectId, "decision", `Your decision needed: ${data.title}`, choices);
  await notify({
    projectId: data.projectId,
    kind: "decision",
    title: `Your decision needed: ${data.title}`,
    body: data.detail ? `${data.detail}\n\nOptions:\n${choices}` : `Options:\n${choices}`,
  });

  return { ok: true as const, raisedBy: staff.email };
}

export async function certifyPaymentFor(
  sql: Sql,
  staff: { email: string; userId: string },
  data: z.infer<typeof CertifyPayment>,
) {

  const rows = await sql<{ label: string; amount: number; status: string }>`
      select label, amount, status from portal_payments
      where id = ${data.paymentId} and project_id = ${data.projectId} limit 1
    `;
  const payment = rows[0];
  if (!payment) throw new Error("Payment not found on that project.");
  if (payment.status === "paid") throw new Error("That payment is already released.");

  const amount = Number(payment.amount ?? 0);
  const wasCertified = payment.status === "certified";

  await sql`
      update portal_payments set status = 'certified', certificate = ${data.certificate}
      where id = ${data.paymentId} and project_id = ${data.projectId}
    `;

  // Move the money only on the first certification, so re-issuing a
  // certificate cannot inflate the totals.
  if (!wasCertified) {
    await sql`
        update portal_projects
        set certified_to_date = certified_to_date + ${amount},
            currently_certified = currently_certified + ${amount},
            updated_at = now()
        where id = ${data.projectId}
      `;
  }

  await logActivity(
    sql,
    data.projectId,
    "payment",
    `Certificate issued: ${payment.label}`,
    `${data.certificate} — KES ${amount.toLocaleString("en-KE")} certified and awaiting the client's release.`,
  );
  await notify({
    projectId: data.projectId,
    kind: "payment",
    title: `Certified for release: ${payment.label}`,
    body: `KES ${amount.toLocaleString("en-KE")} under certificate ${data.certificate}. Release it from your portal.`,
  });

  // The paperwork follows the money: the certificate is what authorises release.
  const document = await issueCertificateFor(sql, staff.email, {
    projectId: data.projectId,
    paymentId: data.paymentId,
    label: payment.label,
    certificate: data.certificate,
    amount,
  });

  return { ok: true as const, amount, documentNumber: document?.number ?? null };
}

export async function addDocumentFor(
  sql: Sql,
  staff: { email: string; userId: string },
  data: z.infer<typeof AddDocument>,
) {
  void staff;

  const next = await sql<{ n: number }>`
      select coalesce(max(ord), 0) + 1 as n from portal_documents where project_id = ${data.projectId}
    `;

  await sql`
      insert into portal_documents (project_id, ord, name, category, issued, reference, size, state)
      values (${data.projectId}, ${Number(next[0]?.n ?? 1)}, ${data.name}, ${data.category},
              ${todayLabel()}, ${data.reference}, '—', ${data.state})
    `;

  await logActivity(sql, data.projectId, "document", `Document added: ${data.name}`, data.category);

  return { ok: true as const };
}

export async function postUpdateFor(
  sql: Sql,
  staff: { email: string; userId: string },
  data: z.infer<typeof PostUpdate>,
) {
  await logActivity(sql, data.projectId, data.kind, data.title, data.body);
  await sql`
    insert into staff_note (project_id, author_id, author_label, body)
    values (${data.projectId}, ${staff.userId}, ${staff.email}, ${data.body || data.title})
  `;
  await notify({ projectId: data.projectId, kind: "update", title: data.title, body: data.body });
  return { ok: true as const };
}

/* ── server functions ──
 * Each one resolves the verified staff identity and then calls the operation, so
 * the authorisation check can never be skipped by a new call site. */

export const updateMilestone = createServerFn({ method: "POST" })
  .validator(UpdateMilestone)
  .handler(async ({ data }) => updateMilestoneFor(await getSql(), await requireStaff(), data));

export const addMilestoneEvidence = createServerFn({ method: "POST" })
  .validator(AddEvidence)
  .handler(async ({ data }) => addMilestoneEvidenceFor(await getSql(), await requireStaff(), data));

export const raiseDecision = createServerFn({ method: "POST" })
  .validator(RaiseDecision)
  .handler(async ({ data }) => raiseDecisionFor(await getSql(), await requireStaff(), data));

export const certifyPayment = createServerFn({ method: "POST" })
  .validator(CertifyPayment)
  .handler(async ({ data }) => certifyPaymentFor(await getSql(), await requireStaff(), data));

export const addDocument = createServerFn({ method: "POST" })
  .validator(AddDocument)
  .handler(async ({ data }) => addDocumentFor(await getSql(), await requireStaff(), data));

export const postUpdate = createServerFn({ method: "POST" })
  .validator(PostUpdate)
  .handler(async ({ data }) => postUpdateFor(await getSql(), await requireStaff(), data));
