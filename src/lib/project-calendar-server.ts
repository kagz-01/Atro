import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { accountMiddleware, authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { notify } from "@/lib/notify";
import { requireStaff } from "@/lib/staff-session.server";
import {
  canRespondToCalendarRequest,
  calendarRequestLabel,
  PROJECT_CALENDAR_KINDS,
  type ProjectCalendarKind,
  type ProjectCalendarRequest,
  type ProjectCalendarStatus,
} from "@/lib/project-calendar";

const REQUEST_COLUMNS = `id, project_id, title, kind, note, proposed_at, scheduled_at,
  status, staff_note, created_at, responded_at`;

function toRequest(row: Record<string, unknown>): ProjectCalendarRequest {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    title: String(row.title),
    kind: String(row.kind) as ProjectCalendarKind,
    note: String(row.note ?? ""),
    proposedAt: String(row.proposed_at),
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
    status: String(row.status) as ProjectCalendarStatus,
    staffNote: String(row.staff_note ?? ""),
    createdAt: String(row.created_at),
    respondedAt: row.responded_at ? String(row.responded_at) : null,
  };
}

async function ownsProject(sql: Sql, projectId: string, userId: string): Promise<boolean> {
  const [project] = await sql<{ id: string }>`
    select id from portal_projects
    where id = ${projectId} and user_id = ${userId} and deleted_at is null
  `;
  return Boolean(project);
}

export const listMyCalendarRequests = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await ownsProject(sql, data.projectId, context.userId))) {
      throw new Error("Project not found.");
    }
    const rows = await sql.query<Record<string, unknown>>(
      `select ${REQUEST_COLUMNS} from portal_calendar_request
       where project_id = $1 order by created_at desc limit 30`,
      [data.projectId],
    );
    return rows.map(toRequest);
  });

export const requestProjectCalendarEvent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().uuid(),
      title: z.string().trim().min(2).max(100),
      kind: z.enum(PROJECT_CALENDAR_KINDS),
      note: z.string().trim().max(500).optional(),
      proposedAt: z.string().datetime(),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const proposedAt = new Date(data.proposedAt);
    if (proposedAt.getTime() <= Date.now()) {
      throw new Error("Choose a future date and time.");
    }
    const sql = await getSql();
    if (!(await ownsProject(sql, data.projectId, context.userId))) {
      throw new Error("Project not found.");
    }
    const [request] = await sql<{ id: string }>`
      insert into portal_calendar_request (
        project_id, requested_by, title, kind, note, proposed_at
      ) values (
        ${data.projectId}, ${context.userId}, ${data.title.trim()}, ${data.kind},
        ${data.note?.trim() ?? ""}, ${proposedAt.toISOString()}
      )
      returning id
    `;
    if (!request) throw new Error("Could not submit the calendar request.");
    await notify({
      projectId: data.projectId,
      kind: "calendar",
      title: "Calendar event requested",
      body: `${calendarRequestLabel(data.kind)}: ${data.title.trim()}`,
      audience: "studio",
    });
    return { ok: true as const };
  });

export const listProjectCalendarRequestsForStaff = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const rows = await (
      await getSql()
    ).query<Record<string, unknown>>(
      `select ${REQUEST_COLUMNS} from portal_calendar_request
       where project_id = $1 order by created_at desc limit 30`,
      [data.projectId],
    );
    return rows.map(toRequest);
  });

export const respondToProjectCalendarRequest = createServerFn({ method: "POST" })
  .validator(
    z.object({
      requestId: z.string().uuid(),
      status: z.enum(["confirmed", "declined"]),
      scheduledAt: z.string().datetime().optional(),
      note: z.string().trim().max(500).optional(),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();
    const [request] = await sql<{
      id: string;
      project_id: string;
      title: string;
      status: string;
      proposed_at: unknown;
    }>`
      select r.id, r.project_id, r.title, r.status, r.proposed_at
      from portal_calendar_request r
      join portal_projects p on p.id = r.project_id
      where r.id = ${data.requestId} and p.deleted_at is null
        and p.lifecycle_state not in ('closed', 'archived')
    `;
    if (!request) throw new Error("Calendar request not found.");
    if (!canRespondToCalendarRequest(request.status as ProjectCalendarStatus, data.status)) {
      throw new Error("That calendar request has already been answered.");
    }
    const note = data.note?.trim() ?? "";
    if (data.status === "declined" && !note) {
      throw new Error("Explain why the request cannot be approved.");
    }
    const scheduledAt =
      data.status === "confirmed"
        ? new Date(data.scheduledAt ?? String(request.proposed_at)).toISOString()
        : null;
    if (scheduledAt && Date.parse(scheduledAt) <= Date.now()) {
      throw new Error("Confirm a future date and time.");
    }

    const [updated] = await sql<{ id: string }>`
      update portal_calendar_request set
        status = ${data.status}, scheduled_at = ${scheduledAt},
        staff_note = ${note}, responded_by = ${staff.email}, responded_at = now(),
        updated_at = now()
      where id = ${request.id} and status = 'requested'
      returning id
    `;
    if (!updated) throw new Error("That calendar request changed. Refresh and try again.");

    const title =
      data.status === "confirmed" ? "Calendar event confirmed" : "Calendar request not approved";
    await sql`
      insert into portal_activity (project_id, kind, title, body, at)
      values (
        ${request.project_id}, 'note', ${title},
        ${`${request.title}${note ? ` — ${note}` : ""}`}, now()
      )
    `;
    await notify({
      projectId: request.project_id,
      kind: "calendar",
      title,
      body: [request.title, note].filter(Boolean).join(" — "),
      audience: "client",
    });
    return { ok: true as const };
  });
