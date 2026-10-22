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
import { normaliseEmail, type StaffIdentity } from "@/lib/staff";
import {
  trackById,
  TRACK_IDS,
  type ProjectBrief,
} from "@/lib/diaspora/portal-schema";
import { generateProject } from "@/lib/diaspora/server";
import { loadProjectById, logActivity, type PortalPayload } from "@/lib/diaspora/server";
import { leadLocality } from "@/lib/enquiry-lead";
import { channelStatus, drainDue, notificationLog, notify, releaseHeld, retryPending } from "@/lib/notify";
import { issueCertificateFor, issueStatementFor } from "@/lib/invoice-server";

/* ── input ── */

const UpdateMilestone = z.object({
  projectId: z.string().min(1),
  milestoneId: z.string().min(1),
  status: z.enum(["pending", "active", "blocked", "complete"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  note: z.string().trim().max(600).optional(),
  /**
   * Mark the stage ready for the client to approve. The portal's Approve
   * button only appears once this is set — the studio, not the client,
   * decides when work is finished enough to be signed off.
   */
  approvalReady: z.boolean().optional(),
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

/** The money moves: certify, release retention, issue a statement. */
async function requireAdmin(
  op: "certify-payment" | "release-retention" | "issue-statement",
): Promise<StaffIdentity> {
  const { requireAdmin: guard } = await import("@/lib/staff-session.server");
  return guard(op);
}

export type StaffProjectSummary = {
  id: string;
  userId: string;
  reference: string;
  title: string;
  clientLabel: string;
  clientCity: string;
  /** The client's own "I live abroad" flag, from their profile; '' when unset. */
  clientType: string;
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
    // Opening the log is one of the arrivals that runs the drain: what the
    // client's morning has released is attempted before it is read.
    await drainDue(sql);
    return {
      channels: channelStatus(),
      log: await notificationLog(sql, data.projectId),
    };
  });

export const issueStatementForProject = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireAdmin("issue-statement");
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
    // The retry only means something if the drain runs: that is what attempts
    // the rows the retry just made due.
    await drainDue(sql, data.projectId);
    return { ok: true as const, queued };
  });

/** Send this project's held rows now — the client is awake and asked for it. */
export const releaseHeldDeliveries = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const sent = await releaseHeld(sql, data.projectId);
    return { ok: true as const, sent };
  });

/** Read-only role lookup for the UI: a session exists, and is it staff? */
export const getMyStaffRole = createServerFn({ method: "GET" }).handler(async () => {
  const { currentIdentity, currentStaff } = await import("@/lib/staff-session.server");
  const [staff, identity] = await Promise.all([currentStaff(), currentIdentity()]);
  // The email matters: it is what tells the console apart between "not signed
  // in" and "signed in, not on the allowlist" — the second is the only state a
  // person can act on from there.
  const email = staff?.email ?? identity?.email ?? null;

  // A pending invitation is the only thing that changes what the console does
  // with a signed-in non-staff account (the accept card replaces the request
  // card), so it is fetched exactly there — staff never need it.
  let invite: { invitedBy: string; note: string; createdAt: string } | null = null;
  if (!staff && email) {
    const sql = await getSql();
    const rows = await sql<{ note: string; invited_by: string; created_at: unknown }>`
      select note, invited_by, created_at from staff_invite
      where lower(email) = ${email} and status = 'pending'
      limit 1
    `;
    if (rows[0]) {
      invite = {
        invitedBy: rows[0].invited_by,
        note: rows[0].note,
        createdAt: new Date(String(rows[0].created_at)).toISOString(),
      };
    }
  }

  return {
    userId: staff?.userId ?? identity?.userId ?? null,
    email,
    role: staff?.role ?? null,
    invite,
  };
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
      coalesce(nullif(c.client_type, ''), '') as client_type,
      coalesce((select count(*) from portal_decisions d
        where d.project_id = p.id and d.state <> 'decided'), 0) as open_decisions,
      coalesce((select count(*) from portal_milestones m
        where m.project_id = p.id and m.status = 'blocked'), 0) as blocked_stages,
      (select max(a.at) from portal_activity a where a.project_id = p.id) as last_activity_at
    from portal_projects p
    left join client_profile c on c.user_id = p.user_id
    where p.deleted_at is null
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
    clientType: String(row.client_type ?? ""),
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
  const current = await sql<{ name: string; status: string; progress: number; approval_ready: boolean }>`
      select name, status, progress, approval_ready from portal_milestones
      where id = ${data.milestoneId} and project_id = ${data.projectId} limit 1
    `;
  const milestone = current[0];
  if (!milestone) throw new Error("Milestone not found on that project.");

  const status = data.status ?? milestone.status;
  const progress = status === "complete" ? 100 : (data.progress ?? milestone.progress ?? 0);
  // Completing a stage clears the flag: it is already approved, so there is
  // nothing left for the client to approve.
  const approvalReady = status === "complete" ? false : (data.approvalReady ?? milestone.approval_ready);

  await sql`
      update portal_milestones
      set status = ${status}, progress = ${Math.max(0, Math.min(100, progress))},
          approval_ready = ${approvalReady},
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
  // The paperwork follows the money: the certificate is what authorises release,
  // so it is issued first and the message can link straight to it.
  const document = await issueCertificateFor(sql, staff.email, {
    projectId: data.projectId,
    paymentId: data.paymentId,
    label: payment.label,
    certificate: data.certificate,
    amount,
  });

  await notify({
    projectId: data.projectId,
    kind: "payment",
    title: `Certified for release: ${payment.label}`,
    body: `KES ${amount.toLocaleString("en-KE")} under certificate ${data.certificate}. Release it from your portal.`,
    documentUrl: document ? `/portal/document/${document.id}` : undefined,
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
  .handler(async ({ data }) =>
    certifyPaymentFor(await getSql(), await requireAdmin("certify-payment"), data),
  );

export const addDocument = createServerFn({ method: "POST" })
  .validator(AddDocument)
  .handler(async ({ data }) => addDocumentFor(await getSql(), await requireStaff(), data));

export const postUpdate = createServerFn({ method: "POST" })
  .validator(PostUpdate)
  .handler(async ({ data }) => postUpdateFor(await getSql(), await requireStaff(), data));

/* ── turning an enquiry into real work ── */

const OpenFromEnquiry = z.object({
  enquiryId: z.string().min(1),
  title: z.string().trim().min(3).max(120),
  track: z.enum(TRACK_IDS as [string, ...string[]]).default("construction"),
  contractValue: z.number().int().min(500_000).max(50_000_000_000),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  zone: z.string().trim().max(60).default(""),
  area: z.string().trim().max(60).default(""),
  plot: z.string().trim().max(200).default(""),
});

/**
 * Open a project for a client who may never have signed up.
 *
 * The row is written with no owner and a `claimed_email`, so it waits for them:
 * the first sign-in with that address — or with the phone number they enquired
 * from, proved by OTP — takes ownership. The alternative — asking a lead to
 * create an account before we have decided to work with them — loses the
 * enquiry at exactly the wrong moment.
 *
 * The abroad facts the wizard collected ride along into the project rather
 * than being written over with empty strings: without the country and zone a
 * converted diaspora lead landed in a portal that did not know they were
 * abroad, and the /diaspora page's promise died at the funnel's last step.
 */
export async function openProjectFromEnquiryFor(
  sql: Sql,
  staff: { email: string; userId: string },
  data: z.infer<typeof OpenFromEnquiry>,
): Promise<{ projectId: string; clientEmail: string }> {
  const rows = await sql<{
    id: string;
    email: string;
    name: string;
    zone: string;
    description: string;
    project_type: string;
    phone: string;
    diaspora: boolean;
    diaspora_country: string;
    diaspora_timezone: string;
    already: string | null;
  }>`
    select e.id, e.email, e.name, e.zone, e.description, e.project_type, e.phone,
      e.diaspora, e.diaspora_country, e.diaspora_timezone,
      (select p.id::text from portal_projects p where p.id = e.project_id) as already
    from enquiries e where e.id = ${data.enquiryId} limit 1
  `;
  const enquiry = rows[0];
  if (!enquiry) throw new Error("That enquiry no longer exists.");

  const email = normaliseEmail(enquiry.email);
  if (!email) throw new Error("That enquiry has no email address to open a project against.");

  if (enquiry.already) return { projectId: enquiry.already, clientEmail: email };

  const year = new Date().getFullYear();
  const reference = `ATR-${year}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const track = trackById(data.track);
  const locality = leadLocality({
    diaspora: enquiry.diaspora,
    country: enquiry.diaspora_country,
    timezone: enquiry.diaspora_timezone,
  });
  const brief: ProjectBrief = {
    title: data.title.trim(),
    plot: data.plot.trim() || enquiry.zone,
    area: data.area.trim(),
    contractValue: data.contractValue,
    startDate: data.startDate,
    targetDate: data.targetDate,
    clientCity: locality.clientCity,
    clientTz: locality.clientTz,
    track: track.id,
    serviceSlug: "",
    zone: data.zone || enquiry.zone,
    // The enquiry already carries the number the client gave when they asked to
    // build. Dropping it here meant every converted project had no phone on
    // file, so SMS and WhatsApp updates silently never reached the client.
    clientPhone: enquiry.phone,
  };

  // An unowned row: user_id '' and the address it is waiting for.
  const projectId = await generateProject(sql, "", brief, reference, email, enquiry.name);

  await sql`
    update enquiries set status = 'converted', project_id = ${projectId}, updated_at = now()
    where id = ${data.enquiryId}
  `;
  await logActivity(
    sql,
    projectId,
    "note",
    "Project opened from an enquiry",
    `Prepared by ${staff.email} from enquiry ${enquiry.id}. It will appear for ${email} as soon as they sign in with that address or the number on the enquiry.` +
      (enquiry.diaspora
        ? ` They are based in ${enquiry.diaspora_country || "abroad"}${locality.clientTz ? `, on ${locality.clientTz}` : ""}.`
        : ""),
  );

  return { projectId, clientEmail: email };
}

export const openProjectFromEnquiry = createServerFn({ method: "POST" })
  .validator(OpenFromEnquiry)
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    return openProjectFromEnquiryFor(await getSql(), staff, data);
  });

/** Move an enquiry along the funnel. */
export const setEnquiryStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      enquiryId: z.string().min(1),
      status: z.enum(["new", "contacted", "quoted", "won", "lost", "converted"]),
    }),
  )
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();
    // Moving a lead claims it for whoever moved it, unless someone else already
    // has it. The alternative — a shared pile where nobody's name is on
    // anything — is how two people call the same prospect.
    const rows = await sql<{ id: string }>`
      update enquiries
      set status = ${data.status},
          assigned_to = case when assigned_to = '' then ${staff.email} else assigned_to end,
          updated_at = now()
      where id = ${data.enquiryId} and status <> 'converted'
      returning id
    `;
    if (!rows[0]) throw new Error("That enquiry has already been converted, or is gone.");
    return { ok: true as const };
  });

/**
 * Take ownership of an enquiry without moving it along the funnel.
 *
 * A lead can be claimed the moment it lands — the person who rings first owns
 * the conversation. Refusing a claim someone else already holds is the whole
 * point: silent reassignment is how a prospect gets called twice.
 */
export const claimEnquiry = createServerFn({ method: "POST" })
  .validator(z.object({ enquiryId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();
    const rows = await sql<{ id: string }>`
      update enquiries
      set assigned_to = ${staff.email}, updated_at = now()
      where id = ${data.enquiryId}
        and status <> 'converted'
        and (assigned_to = '' or lower(assigned_to) = lower(${staff.email}))
      returning id
    `;
    if (!rows[0]) {
      const owner = await sql<{ assigned_to: string }>`
        select assigned_to from enquiries where id = ${data.enquiryId} limit 1
      `;
      if (!owner[0]) throw new Error("That enquiry no longer exists.");
      if (owner[0].assigned_to) {
        throw new Error(`${owner[0].assigned_to} is already working on this enquiry.`);
      }
      throw new Error("That enquiry has already been converted.");
    }
    return { ok: true as const, assignedTo: staff.email };
  });

/**
 * The studio's read of who this client is and what they have allowed.
 *
 * The consent switches are the point: they are a record of permission, not a
 * preference, and the delivery layer honours them. The studio seeing them here
 * means "why did my message not arrive?" is answerable without reading the
 * outbox — the switch was off, and this is the date they set it.
 */
export const getStaffClientProfile = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const rows = await sql<{
      user_id: string | null;
      display_name: string | null;
      email: string | null;
      phone: string | null;
      city: string | null;
      country: string | null;
      timezone: string | null;
      client_type: string | null;
      company: string | null;
      notify_email: boolean | null;
      notify_sms: boolean | null;
      notify_whatsapp: boolean | null;
      site_photo_consent: boolean | null;
      project_email: string;
      project_phone: string;
    }>`
      select p.user_id, p.claimed_email as project_email, p.client_phone as project_phone,
        c.display_name, c.email, c.phone, c.city, c.country, c.timezone,
        c.client_type, c.company,
        c.notify_email, c.notify_sms, c.notify_whatsapp, c.site_photo_consent
      from portal_projects p
      left join client_profile c on c.user_id = p.user_id
      where p.id = ${data.projectId} limit 1
    `;
    const r = rows[0];
    if (!r) throw new Error("Project not found.");
    // The profile is the record the client maintains; the project's own contact
    // details are the fallback for a lead who was converted but has never
    // signed in to fill the profile in.
    return {
      hasProfile: Boolean(r.display_name || r.email || r.phone),
      displayName: r.display_name ?? "",
      email: r.email ?? r.project_email ?? "",
      phone: r.phone ?? r.project_phone ?? "",
      city: r.city ?? "",
      country: r.country ?? "",
      timezone: r.timezone ?? "",
      clientType: r.client_type ?? "",
      company: r.company ?? "",
      // Defaults match the column defaults and the delivery layer's fallback:
      // email and WhatsApp on, SMS off until a number is asked for.
      notifyEmail: r.notify_email !== false,
      notifySms: r.notify_sms === true,
      notifyWhatsapp: r.notify_whatsapp !== false,
      sitePhotoConsent: r.site_photo_consent !== false,
    };
  });

/* ── retention ── */

/**
 * Release retention once the defects liability period has closed.
 *
 * Retention is tracked two ways — the balance the studio holds on the project,
 * and any payment line still marked `retained`. Both are reconciled here so the
 * ledger and the balance can never disagree about what was paid out.
 */
export async function releaseRetentionFor(
  sql: Sql,
  staff: { email: string; userId: string },
  projectId: string,
): Promise<{ ok: true; released: number; count: number }> {
  const project = await sql<{ retention_held: number }>`
    select retention_held from portal_projects where id = ${projectId} limit 1
  `;
  if (!project[0]) throw new Error("Project not found.");

  const lines = await sql<{ id: string; amount: number }>`
    select id, amount from portal_payments
    where project_id = ${projectId} and status = 'retained'
  `;

  // The balance held is the authority; the lines are how it is shown.
  const held = Number(project[0].retention_held ?? 0);
  const fromLines = lines.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
  const total = held > 0 ? held : fromLines;
  if (total <= 0) {
    throw new Error("No retention is held on this project, so there is nothing to release.");
  }

  if (lines.length > 0) {
    await sql`
      update portal_payments set status = 'paid', paid_date = ${todayLabel()},
        method = 'Retention released — defects closed'
      where project_id = ${projectId} and status = 'retained'
    `;
  }

  await sql`
    update portal_projects
    set retention_held = 0, paid_to_date = paid_to_date + ${total}, updated_at = now()
    where id = ${projectId}
  `;

  await logActivity(
    sql,
    projectId,
    "payment",
    "Retention released",
    `${total.toLocaleString("en-KE")} KES released after the defects liability period closed. Recorded by ${staff.email}.`,
  );

  return { ok: true, released: total, count: lines.length };
}

export const releaseRetention = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }) =>
    releaseRetentionFor(await getSql(), await requireAdmin("release-retention"), data.projectId),
  );
