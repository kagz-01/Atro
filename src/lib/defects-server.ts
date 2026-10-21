// After handover, on both sides of the portal.
//
// The client reports and confirms; the studio responds and records. Two rules
// are enforced here rather than left to the form, because both are the kind of
// thing that quietly stops being true:
//
//   1. A transition has to be one the record allows — the studio cannot jump
//      from "reported" to "fixed", and cannot mark its own work verified. The
//      close belongs to the person who reported the problem.
//   2. A rejection needs a reason. "Not covered" with no explanation is how a
//      defect period turns into a dispute, so the reason is checked server-side
//      where the client cannot be shown a blank.
//
// A client writes only on a project they own — row → project → user_id, never
// an id taken on trust.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireAdmin, requireStaff } from "@/lib/staff-session.server";
import { getSql, type Sql } from "@/lib/db";
import { notify } from "@/lib/notify";
import {
  SEVERITIES,
  canTransition,
  statusLabel,
  type Defect,
  type DefectStatus,
  type Retainer,
  type Severity,
} from "@/lib/defects";

const today = () => new Date().toISOString().slice(0, 10);

const toDefect = (r: Record<string, unknown>): Defect => ({
  id: String(r.id),
  projectId: String(r.project_id),
  ord: Number(r.ord ?? 0),
  title: String(r.title ?? ""),
  detail: String(r.detail ?? ""),
  area: String(r.area ?? ""),
  severity: String(r.severity ?? "minor") as Severity,
  status: String(r.status ?? "reported") as DefectStatus,
  reportedOn: String(r.reported_on ?? ""),
  acceptedOn: String(r.accepted_on ?? ""),
  fixedOn: String(r.fixed_on ?? ""),
  verifiedOn: String(r.verified_on ?? ""),
  rejectReason: String(r.reject_reason ?? ""),
  note: String(r.note ?? ""),
  reportedBy: String(r.reported_by ?? "client") === "studio" ? "studio" : "client",
  updatedAt: r.updated_at ? String(r.updated_at) : "",
});

const toRetainer = (r: Record<string, unknown> | undefined): Retainer | null =>
  r
    ? {
        projectId: String(r.project_id),
        name: String(r.name ?? "Annual care"),
        covers: String(r.covers ?? ""),
        annualAmount: Number(r.annual_amount ?? 0),
        renewsOn: String(r.renews_on ?? ""),
        status: String(r.status ?? "active") as Retainer["status"],
        lastPaidOn: String(r.last_paid_on ?? ""),
      }
    : null;

export type AfterHandover = {
  periodEnd: string;
  defects: Defect[];
  retainer: Retainer | null;
};

async function readAfterHandover(sql: Sql, projectId: string): Promise<AfterHandover> {
  const [project] = await sql<{ defect_period_ends: string }>`
    select defect_period_ends from portal_projects where id = ${projectId}
  `;
  const defects = await sql<Record<string, unknown>>`
    select id, project_id, ord, title, detail, area, severity, status, reported_on,
      accepted_on, fixed_on, verified_on, reject_reason, note, reported_by, updated_at
    from portal_defect
    where project_id = ${projectId}
    order by ord desc
  `;
  const [retainer] = await sql<Record<string, unknown>>`
    select project_id, name, covers, annual_amount, renews_on, status, last_paid_on
    from portal_retainer
    where project_id = ${projectId}
  `;
  return {
    periodEnd: String(project?.defect_period_ends ?? ""),
    defects: defects.map(toDefect),
    retainer: toRetainer(retainer),
  };
}

/**
 * A title has to say what and where.
 *
 * "Issue in bathroom" is a category, not a report — and eight of them in a list
 * is unreadable for the studio and useless to the client reading back later.
 */
function checkTitle(title: string): { ok: true; title: string } | { ok: false; reason: string } {
  const trimmed = title.replace(/\s+/g, " ").trim();
  if (trimmed.length < 5) {
    return {
      ok: false,
      reason: "Say what is wrong and where — “crack above the ensuite door”, not “issue”.",
    };
  }
  if (trimmed.length > 160) return { ok: false, reason: "Keep the title under 160 characters." };
  return { ok: true, title: trimmed };
}

/* ── client ── */

export const listMyAfterHandover = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<AfterHandover> => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");
    return readAfterHandover(sql, data.projectId);
  });

const ReportInput = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(400),
  detail: z.string().max(2000).optional().default(""),
  area: z.string().max(80).optional().default(""),
  severity: z
    .enum(SEVERITIES.map((s) => s.value) as [Severity, ...Severity[]])
    .optional()
    .default("minor"),
});

export const reportDefect = createServerFn({ method: "POST" })
  .validator(ReportInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string; client_label: string }>`
      select id, client_label from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");

    const title = checkTitle(data.title);
    if (!title.ok) throw new Error(title.reason);

    const [n] = await sql<{ n: number }>`
      select coalesce(max(ord), 0)::int as n from portal_defect where project_id = ${data.projectId}
    `;
    await sql`
      insert into portal_defect (
        project_id, ord, title, detail, area, severity, status, reported_on, reported_by
      ) values (
        ${data.projectId}, ${Number(n?.n ?? 0) + 1}, ${title.title}, ${data.detail.trim()},
        ${data.area.trim()}, ${data.severity}, 'reported', ${today()}, 'client'
      )
    `;

    await sql`
      insert into portal_activity (project_id, kind, title, body)
      values (
        ${data.projectId},
        'defect',
        ${`Defect reported: ${title.title}`},
        ${data.detail.trim().slice(0, 200)}
      )
    `;

    await notify({
      projectId: data.projectId,
      kind: "defect",
      title: `Defect reported: ${title.title}`,
      body: data.detail.trim().slice(0, 200),
      audience: "studio",
    });

    return { ok: true as const };
  });

/**
 * The client confirms a fix — the only action that closes a defect.
 *
 * Ownership is checked by walking to the project, and the status is checked
 * against the transition table, so a client cannot close something the studio
 * has not finished.
 */
export const verifyDefect = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1), defectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");

    const [row] = await sql<{ status: DefectStatus; title: string }>`
      select status, title from portal_defect where id = ${data.defectId} and project_id = ${data.projectId}
    `;
    if (!row) throw new Error("That report is not on this project.");
    if (!canTransition(row.status, "verified")) {
      throw new Error("Only a fix the studio has completed can be confirmed.");
    }

    await sql`
      update portal_defect
      set status = 'verified', verified_on = ${today()}, updated_at = now()
      where id = ${data.defectId} and project_id = ${data.projectId}
    `;

    // The client is the only one who can close a defect, so the studio is the
    // only one who needs telling. Without this the confirmation sat unseen in
    // the panel until somebody opened it — and anything counting on a closed
    // defect (retention, the care period) waited on a fact nobody had been
    // handed.
    await sql`
      insert into portal_activity (project_id, kind, title, body)
      values (${data.projectId}, 'defect', ${`Defect confirmed fixed: ${row.title}`}, 'Verified by the client.')
    `;
    await notify({
      projectId: data.projectId,
      kind: "defect",
      title: `Defect confirmed fixed: ${row.title}`,
      body: "Verified by the client.",
      audience: "studio",
    });

    return { ok: true as const };
  });

/* ── studio ── */

export const readAfterHandoverForStaff = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }): Promise<AfterHandover> => {
    await requireStaff();
    return readAfterHandover(await getSql(), data.projectId);
  });

/**
 * Move a report, record why, and put a date on it.
 *
 * The dates are stamped from the transition rather than sent by the caller, so
 * "accepted" always means accepted on a real day and a client reading the
 * history cannot be shown a date the studio typed in by hand.
 */
export const updateDefect = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      defectId: z.string().min(1),
      // "verified" is deliberately absent: a fix is confirmed by the client
      // through their own portal, never by the studio on their behalf.
      status: z.enum(["accepted", "in_progress", "fixed", "rejected"] as [
        DefectStatus,
        ...DefectStatus[],
      ]),
      note: z.string().max(600).optional().default(""),
      rejectReason: z.string().max(300).optional().default(""),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();

    const [row] = await sql<{ status: DefectStatus; title: string }>`
      select status, title from portal_defect
      where id = ${data.defectId} and project_id = ${data.projectId}
    `;
    if (!row) throw new Error("That report is not on this project.");
    if (!canTransition(row.status, data.status)) {
      throw new Error(
        `A report that is “${statusLabel(row.status)}” cannot become “${statusLabel(data.status)}”.`,
      );
    }

    const reason = data.rejectReason.trim();
    if (data.status === "rejected" && reason.length < 5) {
      throw new Error("Say why it is not covered — the client reads this.");
    }

    const note = data.note.trim();
    if (data.status === "accepted") {
      await sql`
        update portal_defect
        set status = 'accepted', accepted_on = ${today()}, note = ${note || "Accepted — on the list to fix."},
            reject_reason = '', updated_at = now()
        where id = ${data.defectId}
      `;
    } else if (data.status === "in_progress") {
      await sql`
        update portal_defect
        set status = 'in_progress', note = ${note || "Work started."}, updated_at = now()
        where id = ${data.defectId}
      `;
    } else if (data.status === "fixed") {
      await sql`
        update portal_defect
        set status = 'fixed', fixed_on = ${today()}, note = ${note || "Fixed — waiting for the client to check it."},
            updated_at = now()
        where id = ${data.defectId}
      `;
      await notify({
        projectId: data.projectId,
        kind: "defect",
        title: `Fixed: ${row.title}`,
        body: note || "Please check the work and confirm it in your portal.",
      });
    } else {
      await sql`
        update portal_defect
        set status = 'rejected', reject_reason = ${reason}, note = ${note}, updated_at = now()
        where id = ${data.defectId}
      `;
    }

    return { ok: true as const };
  });

/** The studio logs a report made by phone or on site. */
export const reportDefectForClient = createServerFn({ method: "POST" })
  .validator(ReportInput)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const [project] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId}
    `;
    if (!project) throw new Error("Project not found.");

    const title = checkTitle(data.title);
    if (!title.ok) throw new Error(title.reason);

    const [n] = await sql<{ n: number }>`
      select coalesce(max(ord), 0)::int as n from portal_defect where project_id = ${data.projectId}
    `;
    await sql`
      insert into portal_defect (
        project_id, ord, title, detail, area, severity, status, reported_on, reported_by
      ) values (
        ${data.projectId}, ${Number(n?.n ?? 0) + 1}, ${title.title}, ${data.detail.trim()},
        ${data.area.trim()}, ${data.severity}, 'reported', ${today()}, 'studio'
      )
    `;
    return { ok: true as const };
  });

/** When the keys were handed over, the clock the client can see. */
export const setDefectPeriod = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1), ends: z.string().max(40) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    if (data.ends && !/^\d{4}-\d{2}-\d{2}$/.test(data.ends)) {
      throw new Error("Give the date the defect period ends.");
    }
    const [project] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId}
    `;
    if (!project) throw new Error("Project not found.");
    await sql`
      update portal_projects set defect_period_ends = ${data.ends}, updated_at = now()
      where id = ${data.projectId}
    `;
    return { ok: true as const };
  });

export const setRetainer = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      name: z.string().max(80).optional().default("Annual care"),
      covers: z.string().max(600).optional().default(""),
      annualAmount: z.number().int().min(0).max(100_000_000),
      renewsOn: z.string().max(40).optional().default(""),
      status: z.enum(["active", "lapsed", "cancelled"]).optional().default("active"),
      lastPaidOn: z.string().max(40).optional().default(""),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireAdmin("set-retainer");
    const sql = await getSql();
    const [project] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId}
    `;
    if (!project) throw new Error("Project not found.");
    if (data.annualAmount > 0 && !data.renewsOn) {
      throw new Error("Set the renewal date so the client knows when it is due.");
    }
    await sql`
      insert into portal_retainer (
        project_id, name, covers, annual_amount, renews_on, status, last_paid_on, updated_at
      ) values (
        ${data.projectId}, ${data.name.trim() || "Annual care"}, ${data.covers.trim()},
        ${data.annualAmount}, ${data.renewsOn}, ${data.status}, ${data.lastPaidOn}, now()
      )
      on conflict (project_id) do update set
        name = excluded.name,
        covers = excluded.covers,
        annual_amount = excluded.annual_amount,
        renews_on = excluded.renews_on,
        status = excluded.status,
        last_paid_on = excluded.last_paid_on,
        updated_at = now()
    `;
    return { ok: true as const };
  });
