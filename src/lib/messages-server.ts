// The conversation, on both sides of the portal.
//
// The client writes from the portal; the studio answers from the console. Both
// are gated: a client may only write on a project they own, proven by walking
// row → project → user_id rather than trusting a project id in the request, and
// every studio write goes through requireStaff.
//
// Read is recorded explicitly rather than as a side effect of listing, so the
// list stays a pure read and "seen" means somebody deliberately opened the
// thread. Opening the thread is what marks it read — there is no separate
// button, because asking a client to press "mark as read" after reading is the
// kind of thing that trains people to ignore the badge.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireStaff } from "@/lib/staff-session.server";
import { getSql, type Sql } from "@/lib/db";
import { notify } from "@/lib/notify";
import { validateMessage, type Message, type MessageRole } from "@/lib/messages";

const toMessage = (r: Record<string, unknown>): Message => ({
  id: String(r.id),
  projectId: String(r.project_id),
  ord: Number(r.ord ?? 0),
  authorRole: String(r.author_role ?? "client") as MessageRole,
  authorId: String(r.author_id ?? ""),
  authorLabel: String(r.author_label ?? ""),
  body: String(r.body ?? ""),
  createdAt: r.created_at ? String(r.created_at) : "",
  readAt: r.read_at ? String(r.read_at) : null,
});

async function readThread(sql: Sql, projectId: string): Promise<Message[]> {
  const rows = await sql<Record<string, unknown>>`
    select id, project_id, ord, author_role, author_id, author_label, body,
      created_at, read_at
    from portal_message
    where project_id = ${projectId}
    order by ord
  `;
  return rows.map(toMessage);
}

/**
 * Who the message is attributed to.
 *
 * The studio side uses the member's name from the user record — a client
 * reading "Nanjala Oduor replied" is a different experience from an email
 * address, and the name is already there. Falls back to the address, then to a
 * role label, so an attribution is never an empty line.
 */
async function studioLabel(sql: Sql, staff: { userId: string; email: string }): Promise<string> {
  const [u] = await sql<{ name: string | null }>`
    select name from "user" where id = ${staff.userId}
  `;
  return u?.name?.trim() || staff.email;
}

async function clientLabel(sql: Sql, projectId: string): Promise<string> {
  const [p] = await sql<{ user_id: string; client_label: string }>`
    select user_id, client_label from portal_projects where id = ${projectId}
  `;
  const [profile] = p
    ? await sql<{ display_name: string }>`
        select display_name from client_profile where user_id = ${p.user_id}
      `
    : [];
  return profile?.display_name?.trim() || p?.client_label?.trim() || "";
}

async function nextOrd(sql: Sql, projectId: string): Promise<number> {
  const [r] = await sql<{ n: number }>`
    select coalesce(max(ord), 0)::int as n from portal_message where project_id = ${projectId}
  `;
  return Number(r?.n ?? 0) + 1;
}

/* ── client ── */

export const listMyMessages = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");
    return readThread(sql, data.projectId);
  });

export const postMyMessage = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1), body: z.string().min(1).max(4000) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string; reference: string }>`
      select id, reference from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");

    const body = validateMessage(data.body);
    if (!body.ok) throw new Error(body.reason);

    const label = await clientLabel(sql, data.projectId);
    const ord = await nextOrd(sql, data.projectId);
    await sql`
      insert into portal_message (project_id, ord, author_role, author_id, author_label, body)
      values (${data.projectId}, ${ord}, 'client', ${context.userId}, ${label}, ${body.body})
    `;

    // The studio is told, because a message nobody is alerted to is a message
    // that sits unread for a week — which is the failure this feature exists to
    // remove. In-app always; email only if the studio has a contact configured.
    await notify({
      projectId: data.projectId,
      kind: "message",
      title: `New message from ${label || "the client"}`,
      body: body.body.slice(0, 200),
      audience: "studio",
    });

    return { ok: true as const };
  });

/** Opening the thread marks the studio's replies as seen. */
export const markStudioMessagesRead = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");
    await sql`
      update portal_message
      set read_at = coalesce(read_at, now())
      where project_id = ${data.projectId} and author_role = 'studio' and read_at is null
    `;
    return { ok: true as const };
  });

/* ── studio ── */

export const readMessagesForStaff = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    return readThread(await getSql(), data.projectId);
  });

export const postStaffMessage = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1), body: z.string().min(1).max(4000) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();

    const body = validateMessage(data.body);
    if (!body.ok) throw new Error(body.reason);

    // The project id came from the console, but it is still checked as an
    // existing row: a reply to a project that does not exist should not create
    // an orphaned thread.
    const [project] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId}
    `;
    if (!project) throw new Error("Project not found.");

    const label = await studioLabel(sql, staff);
    const ord = await nextOrd(sql, data.projectId);
    await sql`
      insert into portal_message (project_id, ord, author_role, author_id, author_label, body)
      values (${data.projectId}, ${ord}, 'studio', ${staff.userId}, ${label}, ${body.body})
    `;

    await notify({
      projectId: data.projectId,
      kind: "message",
      title: `ATRO replied: ${label}`,
      body: body.body.slice(0, 200),
    });

    return { ok: true as const };
  });

/** Opening the thread marks the client's messages as seen. */
export const markClientMessagesRead = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    await sql`
      update portal_message
      set read_at = coalesce(read_at, now())
      where project_id = ${data.projectId} and author_role = 'client' and read_at is null
    `;
    return { ok: true as const };
  });

/**
 * Unread client messages, across every project, oldest first.
 *
 * This is the studio's badge: which projects have somebody waiting for an
 * answer, and for how long. It is deliberately not a list of every message —
 * the console's job is to say "three clients are waiting", not to become an
 * email client.
 */
export async function unreadClientMessages(sql: Sql): Promise<
  { projectId: string; reference: string; title: string; body: string; age: number }[]
> {
  const rows = await sql<Record<string, unknown>>`
    select m.project_id, p.reference, p.title, m.body,
      floor(extract(epoch from (now() - m.created_at)) / 86400) as age
    from portal_message m
    join portal_projects p on p.id = m.project_id
    where m.author_role = 'client' and m.read_at is null
    order by m.created_at asc
  `;
  return rows.map((r) => ({
    projectId: String(r.project_id),
    reference: String(r.reference ?? ""),
    title: String(r.title ?? ""),
    body: String(r.body ?? ""),
    age: Number(r.age ?? 0),
  }));
}