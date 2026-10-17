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
import { authMiddleware } from "@/lib/auth/middleware";
import { requireStaff } from "@/lib/staff-session.server";
import { getSql, type Sql } from "@/lib/db";
import {
  APPROVAL_KINDS,
  APPROVAL_STATUS,
  type Approval,
  type ApprovalKind,
  type ApprovalStatus,
} from "@/lib/approvals";

const toApproval = (r: Record<string, unknown>): Approval => ({
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
  updatedAt: r.updated_at ? String(r.updated_at) : "",
});

export async function readApprovals(sql: Sql, projectId: string): Promise<Approval[]> {
  const rows = await sql<Record<string, unknown>>`
    select id, ord, kind, title, authority, reference, status, submitted_on,
      decided_on, fee_amount, fee_paid, blocking, chased_on, chase_note, note, updated_at
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
      select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
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

export const createApproval = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      kind: kindEnum,
      title: z.string().min(2).max(160),
      authority: z.string().max(120).optional().default(""),
      reference: z.string().max(80).optional().default(""),
      status: statusEnum.optional().default("not_started"),
      submittedOn: z.string().max(40).optional().default(""),
      decidedOn: z.string().max(40).optional().default(""),
      feeAmount: z.number().int().min(0).max(100_000_000).optional().default(0),
      feePaid: z.number().int().min(0).max(100_000_000).optional().default(0),
      blocking: z.boolean().optional().default(false),
      note: z.string().max(600).optional().default(""),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const [existing] = await sql<{ n: number }>`
      select coalesce(max(ord), 0)::int as n from portal_approval where project_id = ${data.projectId}
    `;
    const ord = Number(existing?.n ?? 0) + 1;
    await sql`
      insert into portal_approval (
        project_id, ord, kind, title, authority, reference, status, submitted_on,
        decided_on, fee_amount, fee_paid, blocking, note
      ) values (
        ${data.projectId}, ${ord}, ${data.kind}, ${data.title}, ${data.authority},
        ${data.reference}, ${data.status}, ${data.submittedOn}, ${data.decidedOn},
        ${data.feeAmount}, ${data.feePaid}, ${data.blocking}, ${data.note}
      )
    `;
    return { ok: true as const };
  });

export const updateApproval = createServerFn({ method: "POST" })
  .validator(
    z.object({
      approvalId: z.string().min(1),
      status: statusEnum.optional(),
      reference: z.string().max(80).optional(),
      submittedOn: z.string().max(40).optional(),
      decidedOn: z.string().max(40).optional(),
      feeAmount: z.number().int().min(0).max(100_000_000).optional(),
      feePaid: z.number().int().min(0).max(100_000_000).optional(),
      blocking: z.boolean().optional(),
      note: z.string().max(600).optional(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();

    // Read first, then write every field that was supplied, so a partial update
    // never blanks a column that was not mentioned.
    const [current] = await sql<Record<string, unknown>>`
      select status, reference, submitted_on, decided_on, fee_amount, fee_paid, blocking, note
      from portal_approval where id = ${data.approvalId}
    `;
    if (!current) throw new Error("That approval is not on the project.");

    await sql`
      update portal_approval set
        status = ${data.status ?? current.status},
        reference = ${data.reference ?? current.reference},
        submitted_on = ${data.submittedOn ?? current.submitted_on},
        decided_on = ${data.decidedOn ?? current.decided_on},
        fee_amount = ${data.feeAmount ?? current.fee_amount},
        fee_paid = ${data.feePaid ?? current.fee_paid},
        blocking = ${data.blocking ?? current.blocking},
        note = ${data.note ?? current.note},
        updated_at = now()
      where id = ${data.approvalId}
    `;
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
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    await sql`
      update portal_approval
      set chased_on = ${new Date().toISOString().slice(0, 10)},
          chase_note = ${data.note},
          updated_at = now()
      where id = ${data.approvalId}
    `;
    return { ok: true as const };
  });

/** The vocabulary the studio form is built from, so it cannot drift. */
export const approvalVocabulary = { kinds: APPROVAL_KINDS, statuses: APPROVAL_STATUS };
