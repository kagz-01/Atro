// Presence, on both sides of the portal.
//
// The client asks from the portal — for a visit if they live here, for a
// walkthrough if they do not — and the studio answers from the console: a
// confirmed slot in Nairobi time, a recording to watch, or a decline that
// carries words. The same rules messages holds, for the same reasons: a
// client writes only on a project they own, proven by walking row → project →
// user_id rather than trusting a project id in the request; every studio
// write goes through requireStaff; and the answer a client was given is on
// the row — the transition table in presence.ts refuses to overwrite it.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireStaff } from "@/lib/staff-session.server";
import { getSql, type Sql } from "@/lib/db";
import { notify } from "@/lib/notify";
import { isAbroad } from "@/lib/abroad";
import {
  canRespond,
  deliveryUrlOk,
  eatInstant,
  formatInstant,
  formatDay,
  hasOpen,
  isDayInput,
  mayAsk,
  SITE_ZONE,
  type PresenceKind,
  type PresenceRequest,
  type PresenceStatus,
} from "@/lib/presence";

const toRequest = (r: Record<string, unknown>): PresenceRequest => ({
  id: String(r.id),
  projectId: String(r.project_id),
  kind: String(r.kind) as PresenceKind,
  status: String(r.status) as PresenceStatus,
  clientNote: String(r.client_note ?? ""),
  proposedOn: r.proposed_on ? String(r.proposed_on).slice(0, 10) : null,
  scheduledAt: r.scheduled_at ? String(r.scheduled_at) : null,
  deliveryUrl: String(r.delivery_url ?? ""),
  staffNote: String(r.staff_note ?? ""),
  createdAt: r.created_at ? String(r.created_at) : "",
  respondedAt: r.responded_at ? String(r.responded_at) : null,
  respondedBy: String(r.responded_by ?? ""),
});

async function readFor(sql: Sql, projectId: string): Promise<PresenceRequest[]> {
  const rows = await sql<Record<string, unknown>>`
    select id, project_id, kind, status, client_note, proposed_on, scheduled_at,
      delivery_url, staff_note, created_at, responded_by,
      case when status = 'requested' then null else updated_at end as responded_at
    from portal_presence
    where project_id = ${projectId}
    order by created_at desc
  `;
  return rows.map(toRequest);
}

async function ownedProject(sql: Sql, projectId: string, userId: string): Promise<boolean> {
  const [owned] = await sql<{ id: string }>`
    select id from portal_projects where id = ${projectId} and user_id = ${userId}
  `;
  return Boolean(owned);
}

/** The signed-in client's track. No profile row yet means local — the default. */
async function clientIsAbroad(sql: Sql, userId: string): Promise<boolean> {
  const [profile] = await sql<{ client_type: string | null }>`
    select client_type from client_profile where user_id = ${userId}
  `;
  return isAbroad(profile?.client_type ?? "");
}

/* ── client ── */

export const listMyPresence = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await ownedProject(sql, data.projectId, context.userId)))
      throw new Error("Project not found.");
    return readFor(sql, data.projectId);
  });

export const requestVisit = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      proposedOn: z.string().refine(isDayInput, "That is not a day on the calendar."),
      note: z.string().max(300).optional(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await ownedProject(sql, data.projectId, context.userId)))
      throw new Error("Project not found.");
    if (!(await mayAskTrack(sql, context.userId, "visit")))
      throw new Error(
        "This portal is on the abroad track — ask for a walkthrough instead, or message the studio about a trip.",
      );
    const existing = await readFor(sql, data.projectId);
    if (hasOpen(existing, "visit"))
      throw new Error("You already have a visit waiting on the studio.");

    await sql`
      insert into portal_presence (project_id, kind, requested_by, client_note, proposed_on)
      values (${data.projectId}, 'visit', ${context.userId}, ${data.note?.trim() ?? ""}, ${data.proposedOn})
    `;
    await notify({
      projectId: data.projectId,
      kind: "presence",
      title: "Site visit requested",
      body: (data.note?.trim() || `Asked to visit on ${formatDay(data.proposedOn) ?? data.proposedOn}.`)
        .slice(0, 200),
      audience: "studio",
    });
    return { ok: true as const };
  });

export const requestWalkthrough = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      note: z.string().max(300).optional(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await ownedProject(sql, data.projectId, context.userId)))
      throw new Error("Project not found.");
    if (!(await mayAskTrack(sql, context.userId, "walkthrough")))
      throw new Error("Ask for a site visit — you are on the local track.");
    const existing = await readFor(sql, data.projectId);
    if (hasOpen(existing, "walkthrough"))
      throw new Error("You already have a walkthrough waiting on the studio.");

    await sql`
      insert into portal_presence (project_id, kind, requested_by, client_note)
      values (${data.projectId}, 'walkthrough', ${context.userId}, ${data.note?.trim() ?? ""})
    `;
    await notify({
      projectId: data.projectId,
      kind: "presence",
      title: "Walkthrough requested",
      body: (data.note?.trim() || "The client asked for a walk on camera.").slice(0, 200),
      audience: "studio",
    });
    return { ok: true as const };
  });

async function mayAskTrack(sql: Sql, userId: string, kind: PresenceKind): Promise<boolean> {
  return mayAsk(await clientIsAbroad(sql, userId), kind);
}

/* ── studio ── */

export const listPresenceForStaff = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    return readFor(await getSql(), data.projectId);
  });

export const respondPresence = createServerFn({ method: "POST" })
  .validator(
    z.object({
      requestId: z.string().min(1),
      status: z.enum(["scheduled", "delivered", "declined"]),
      scheduledAt: z.string().max(40).optional(),
      deliveryUrl: z.string().max(500).optional(),
      note: z.string().max(600).optional(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();
    const [current] = await sql<Record<string, unknown>>`
      select id, project_id, kind, status from portal_presence where id = ${data.requestId}
    `;
    if (!current) throw new Error("That request is not on any project.");
    const kind = String(current.kind) as PresenceKind;
    const status = String(current.status) as PresenceStatus;
    if (!canRespond(kind, status, data.status))
      throw new Error("That request has already been answered.");

    const note = data.note?.trim() ?? "";
    // A decline with no words attached is how a client learns to distrust the
    // portal — the status must arrive with its reason.
    if (data.status === "declined" && !note)
      throw new Error("Tell the client why — a decline needs a reason.");

    // Exactly one of these applies per answer, and because canRespond has
    // refused every re-answer, writing both fields is safe: the other stays
    // empty, as it was for the open request.
    let scheduledAt: string | null = null;
    let deliveryUrl = "";
    if (kind === "visit" && data.status === "scheduled") {
      scheduledAt = eatInstant(data.scheduledAt ?? "");
      if (!scheduledAt)
        throw new Error("Give the client a date and time — the studio answers in Nairobi time.");
    }
    if (kind === "walkthrough" && data.status === "delivered") {
      const url = data.deliveryUrl?.trim() ?? "";
      if (!deliveryUrlOk(url))
        throw new Error("Deliver a link the client can open — https://…");
      deliveryUrl = url;
    }

    await sql`
      update portal_presence set
        status = ${data.status},
        scheduled_at = ${scheduledAt},
        delivery_url = ${deliveryUrl},
        staff_note = ${note},
        responded_by = ${staff.email},
        updated_at = now()
      where id = ${data.requestId}
    `;
    return finish(sql, current, data.status, kind, note, scheduledAt);
  });

/**
 * Stamp the answer and tell the client. The in-app notification is the belt;
 * the card in their portal is the braces — either way the answer is on the
 * record the moment the studio writes it.
 */
async function finish(
  sql: Sql,
  row: Record<string, unknown>,
  status: "scheduled" | "delivered" | "declined",
  kind: PresenceKind,
  note: string,
  scheduledAt: string | null,
): Promise<{ ok: true }> {
  const projectId = String(row.project_id);
  const title =
    status === "declined"
      ? kind === "visit"
        ? "The visit did not go ahead"
        : "The walkthrough did not go ahead"
      : status === "scheduled"
        ? "Your site visit is confirmed"
        : "Your walkthrough is ready";
  const when = status === "scheduled" ? formatInstant(scheduledAt, SITE_ZONE) : null;
  const body = [when ? `Confirmed for ${when}.` : "", note]
    .filter(Boolean)
    .join(" ")
    .slice(0, 300);
  await notify({ projectId, kind: "presence", title, body, audience: "client" });
  return { ok: true as const };
}
