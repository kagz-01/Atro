// Approvals, on both sides of the portal.
//
// The client reads; the studio writes. A client must never be able to mark their
// own planning consent as approved, so every write here is staff-gated.
//
// "Chasing" is recorded rather than sent: the studio marks that they have chased
// an authority and when, so the tracker can say "worth chasing again" a week
// later instead of nagging every day, and so the client can see the studio is
// actually on it.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { accountMiddleware, authMiddleware } from "@/lib/auth/middleware";
import { requireStaff } from "@/lib/staff-session.server";
import { getSql, type Sql } from "@/lib/db";
import {
  APPROVAL_KINDS,
  APPROVAL_STATUS,
  datesForApprovalStatusChange,
  type Approval,
  type ApprovalKind,
  type ApprovalStatus,
} from "@/lib/approvals";

/** One snake_case row into the shape every approvals reader speaks. */
export const toApproval = (r: Record<string, unknown>): Approval => ({
  id: String(r.id),
  ord: Number(r.ord ?? 0),
  kind: String(r.kind ?? "county") as ApprovalKind,
  title: String(r.title ?? ""),
  authority: String(r.authority ?? ""),
  reference: String(r.reference ?? ""),
  status: String(r.status ?? "not_started") as ApprovalStatus,
  submittedOn: String(r.submitted_on ?? ""),
  decidedOn: String(r.decided_on ?? ""),
  feeAmount: Number(r.fee_amount ?? 0),
  feePaid: Number(r.fee_paid ?? 0),
  blocking: r.blocking === true,
  chasedOn: String(r.chased_on ?? ""),
  chaseNote: String(r.chase_note ?? ""),
  note: String(r.note ?? ""),
  updatedAt: r.status_updated_at
    ? String(r.status_updated_at)
    : r.updated_at
      ? String(r.updated_at)
      : "",
});

export async function readApprovals(sql: Sql, projectId: string): Promise<Approval[]> {
  const rows = await sql<Record<string, unknown>>`
    select id, ord, kind, title, authority, reference, status, submitted_on,
      decided_on, fee_amount, fee_paid, blocking, chased_on, chase_note, note,
      updated_at, status_updated_at
    from portal_approval
    where project_id = ${projectId}
    order by ord
  `;
  return rows.map(toApproval);
}

/* ── client ── */

export const listMyApprovals = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects
      where id = ${data.projectId} and user_id = ${context.userId} and deleted_at is null
    `;
    if (!owned) throw new Error("Project not found.");
    return readApprovals(sql, data.projectId);
  });

/* ── studio ── */

export const readApprovalsForStaff = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    return readApprovals(await getSql(), data.projectId);
  });

const kindEnum = z.enum(
  APPROVAL_KINDS.map((k) => k.value) as [ApprovalKind, ...ApprovalKind[]],
);
const statusEnum = z.enum(
  APPROVAL_STATUS.map((s) => s.value) as [ApprovalStatus, ...ApprovalStatus[]],
);
const dateOnly = z
  .string()
  .max(10)
  .refine((value) => {
    if (!value) return true;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Enter a valid date.");

function todayInNairobi(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export const createApproval = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      kind: kindEnum,
      title: z.string().trim().min(2).max(160),
      authority: z.string().trim().max(120).optional().default(""),
      reference: z.string().trim().max(80).optional().default(""),
      status: statusEnum.optional().default("not_started"),
      submittedOn: dateOnly.optional().default(""),
      decidedOn: dateOnly.optional().default(""),
      feeAmount: z.number().int().min(0).max(100_000_000).optional().default(0),
      feePaid: z.number().int().min(0).max(100_000_000).optional().default(0),
      blocking: z.boolean().optional().default(false),
      note: z.string().trim().max(600).optional().default(""),
    }).superRefine((data, context) => {
      if (data.feePaid > data.feeAmount) {
        context.addIssue({
          code: "custom",
          path: ["feePaid"],
          message: "Fee paid cannot exceed the recorded fee amount.",
        });
      }
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const [project] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId} and deleted_at is null limit 1
    `;
    if (!project) throw new Error("Project not found.");
    const [existing] = await sql<{ n: number }>`
      select coalesce(max(ord), 0)::int as n from portal_approval where project_id = ${data.projectId}
    `;
    const ord = Number(existing?.n ?? 0) + 1;
    const statusLabel =
      APPROVAL_STATUS.find((status) => status.value === data.status)?.label ?? data.status;
    await sql`
      with created as (
        insert into portal_approval (
          project_id, ord, kind, title, authority, reference, status, submitted_on,
          decided_on, fee_amount, fee_paid, blocking, note
        ) values (
          ${data.projectId}, ${ord}, ${data.kind}, ${data.title}, ${data.authority},
          ${data.reference}, ${data.status}, ${data.submittedOn}, ${data.decidedOn},
          ${data.feeAmount}, ${data.feePaid}, ${data.blocking}, ${data.note}
        )
        returning project_id
      ),
      activity as (
        insert into portal_activity (project_id, kind, title, body)
        select project_id, 'approval', ${`Approval added: ${data.title}`},
          ${`${data.authority || "Authority not specified"} · Status: ${statusLabel}${data.blocking ? " · Holding the build" : ""}`}
        from created
        returning id
      )
      select project_id from created
    `;
    return { ok: true as const };
  });

export const updateApproval = createServerFn({ method: "POST" })
  .validator(
    z.object({
      approvalId: z.string().min(1),
      kind: kindEnum.optional(),
      title: z.string().trim().min(2).max(160).optional(),
      authority: z.string().trim().max(120).optional(),
      status: statusEnum.optional(),
      reference: z.string().trim().max(80).optional(),
      submittedOn: dateOnly.optional(),
      decidedOn: dateOnly.optional(),
      feeAmount: z.number().int().min(0).max(100_000_000).optional(),
      feePaid: z.number().int().min(0).max(100_000_000).optional(),
      blocking: z.boolean().optional(),
      note: z.string().trim().max(600).optional(),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();

    // Read first, then write every field that was supplied, so a partial update
    // never blanks a column that was not mentioned.
    const [current] = await sql<Record<string, unknown>>`
      select project_id, kind, title, authority, status, reference, submitted_on, decided_on,
        fee_amount, fee_paid, blocking, note
      from portal_approval where id = ${data.approvalId} limit 1
    `;
    if (!current) throw new Error("That approval is not on the project.");

    const nextFeeAmount = data.feeAmount ?? Number(current.fee_amount);
    const nextFeePaid = data.feePaid ?? Number(current.fee_paid);
    if (nextFeePaid > nextFeeAmount) {
      throw new Error("Fee paid cannot exceed the recorded fee amount.");
    }

    const nextStatus = data.status ?? (current.status as ApprovalStatus);
    const statusChanged = data.status !== undefined && data.status !== current.status;
    const statusDates = datesForApprovalStatusChange({
      previousStatus: current.status as ApprovalStatus,
      nextStatus,
      submittedOn: String(current.submitted_on ?? ""),
      decidedOn: String(current.decided_on ?? ""),
      today: todayInNairobi(),
    });
    const submittedOn = data.submittedOn ?? statusDates.submittedOn;
    const decidedOn = data.decidedOn ?? statusDates.decidedOn;
    const changedTitle = data.title ?? String(current.title);
    const statusLabel =
      APPROVAL_STATUS.find((status) => status.value === nextStatus)?.label ?? nextStatus;
    const activityTitle = statusChanged
      ? `Approval status updated: ${changedTitle}`
      : `Approval updated: ${changedTitle}`;
    const activityBody = `Status: ${statusLabel}${data.reference ? ` · Reference ${data.reference}` : ""}${data.blocking ?? current.blocking ? " · Holding the build" : ""}`;
    const updated = await sql<{ project_id: string }>`
      with changed as (
        update portal_approval set
          kind = ${data.kind ?? current.kind},
          title = ${changedTitle},
          authority = ${data.authority ?? current.authority},
          status = ${nextStatus},
          reference = ${data.reference ?? current.reference},
          submitted_on = ${submittedOn},
          decided_on = ${decidedOn},
          fee_amount = ${nextFeeAmount},
          fee_paid = ${nextFeePaid},
          blocking = ${data.blocking ?? current.blocking},
          note = ${data.note ?? current.note},
          updated_at = now(),
          status_updated_at = case when ${statusChanged} then now() else status_updated_at end
        where id = ${data.approvalId}
        returning project_id
      ),
      activity as (
        insert into portal_activity (project_id, kind, title, body)
        select project_id, 'approval', ${activityTitle}, ${activityBody} from changed
        returning id
      )
      select project_id from changed
    `;
    if (!updated[0]) throw new Error("That approval is no longer available.");
    return { ok: true as const };
  });

/** Record that the studio chased this authority today. */
export const chaseApproval = createServerFn({ method: "POST" })
  .validator(
    z.object({
      approvalId: z.string().min(1),
      note: z.string().max(300).optional().default(""),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const rows = await sql<{ project_id: string; title: string; authority: string }>`
      select project_id, title, authority from portal_approval where id = ${data.approvalId} limit 1
    `;
    const approval = rows[0];
    if (!approval) throw new Error("That approval is no longer available.");
    const chasedOn = todayInNairobi();
    const activityTitle = `Follow-up recorded: ${approval.title}`;
    const activityBody = `${approval.authority || "Authority"} followed up on ${chasedOn}${data.note ? ` · ${data.note}` : ""}`;
    const updated = await sql<{ project_id: string }>`
      with followed as (
        update portal_approval
        set chased_on = ${chasedOn}, chase_note = ${data.note}
        where id = ${data.approvalId}
        returning project_id
      ),
      activity as (
        insert into portal_activity (project_id, kind, title, body)
        select project_id, 'approval', ${activityTitle}, ${activityBody} from followed
        returning id
      )
      select project_id from followed
    `;
    if (!updated[0]) throw new Error("That approval is no longer available.");
    return { ok: true as const };
  });

/** The vocabulary the studio form is built from, so it cannot drift. */
export const approvalVocabulary = { kinds: APPROVAL_KINDS, statuses: APPROVAL_STATUS };
