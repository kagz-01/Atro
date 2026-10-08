// ATRO attention sweep — reminding, and telling the studio when someone is quiet.
//
// Two failure modes this exists to prevent:
//   1. A client is asked to choose and simply never answers. Nobody notices,
//      because nothing happened.
//   2. A project goes quiet — blocked two weeks, updates posted that nobody
//      reads — and the studio finds out when the client complains.
//
// There is no scheduler in this deployment, so the sweep is triggered when
// staff open the console. That is a trigger, not a guarantee, so every message
// it would send carries a dedupe key: one reminder per decision per window, one
// digest per studio per day. Opening the console twice does not spam a client.
// When a real scheduler exists it calls `runAttentionSweep` and nothing else
// changes.

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { notify, type Channel } from "@/lib/notify";

/** A client is chased after this long without answering. */
export const CLIENT_REMINDER_AFTER_DAYS = 3;
/** Repeated chase, if the first was ignored. */
export const CLIENT_REMINDER_REPEAT_DAYS = 7;
/** A blocked stage is raised with the studio after this long. */
export const BLOCKED_ALERT_AFTER_DAYS = 2;
/** A client who has not opened the project in this long is worth noticing. */
export const CLIENT_SILENT_DAYS = 14;

export type SweepResult = {
  clientReminders: number;
  studioAlerts: number;
  digestSent: boolean;
};

const dayWindow = (n: number) => `bucket-${Math.floor(Date.now() / (n * 86_400_000))}`;

type AwaitingDecision = {
  id: string;
  project_id: string;
  title: string;
  reference: string;
  project_title: string;
  client_label: string;
  age: number;
  attempts: number;
};

async function remindClients(sql: Sql, channels: Channel[]): Promise<number> {
  const waiting = await sql<AwaitingDecision>`
    select d.id, d.project_id, d.title, p.reference, p.title as project_title,
      p.client_label,
      floor(extract(epoch from (now() - d.created_at)) / 86400) as age,
      (select count(*) from portal_notification n
        where n.project_id = d.project_id and n.kind = 'decision'
          and n.dedupe_key like 'decision-remind:' || d.id || ':%'
          and n.status in ('pending', 'sent')) as attempts
    from portal_decisions d
    join portal_projects p on p.id = d.project_id
    where d.state = 'awaiting-client'
      and d.created_at < now() - make_interval(days => ${CLIENT_REMINDER_AFTER_DAYS})
    order by d.created_at
  `;

  let sent = 0;
  for (const d of waiting) {
    const age = Number(d.age ?? 0);
    if (age < CLIENT_REMINDER_AFTER_DAYS) continue;
    // First chase after 3 days, then weekly.
    if (d.attempts >= 1 && age < CLIENT_REMINDER_AFTER_DAYS + CLIENT_REMINDER_REPEAT_DAYS * d.attempts) {
      continue;
    }

    const result = await notify({
      projectId: d.project_id,
      kind: "decision",
      title: `Still waiting on you: ${d.title}`,
      body: `${d.reference} — ${d.project_title}. This decision has been open ${age} day${age === 1 ? "" : "s"}. Answering takes one tap in your portal and it unblocks the stage.`,
      channels,
      dedupeKey: `decision-remind:${d.id}:${dayWindow(CLIENT_REMINDER_REPEAT_DAYS)}`,
    });
    // The dedupe key is what decides this: notify() returns created: false when
    // the message has already gone out in this window.
    if (result.created) sent += 1;
  }
  return sent;
}

async function alertStudioOnBlocked(sql: Sql, channels: Channel[]): Promise<number> {
  const blocked = await sql<{
    project_id: string;
    name: string;
    reference: string;
    title: string;
    age: number;
  }>`
    select m.project_id, m.name, p.reference, p.title,
      floor(extract(epoch from (now() - coalesce(m.updated_at, p.created_at))) / 86400) as age
    from portal_milestones m
    join portal_projects p on p.id = m.project_id
    where m.status = 'blocked'
      and coalesce(m.updated_at, p.created_at) < now() - make_interval(days => ${BLOCKED_ALERT_AFTER_DAYS})
    order by coalesce(m.updated_at, p.created_at)
  `;

  let sent = 0;

  for (const b of blocked) {
    const result = await notify({
      projectId: b.project_id,
      kind: "note",
      title: `Blocked ${Number(b.age ?? 0)} days: ${b.name}`,
      body: `${b.reference} — ${b.title}. This stage has been blocked since it was flagged. It needs a decision from ATRO, not from the client.`,
      audience: "studio",
      channels,
      dedupeKey: `blocked:${b.project_id}:${dayWindow(7)}`,
    });
    if (result.created) sent += 1;
  }
  return sent;
}

/** One digest a day, listing what the studio is carrying. */
async function sendDigest(sql: Sql, channels: Channel[]): Promise<boolean> {
  const waiting = await sql<{ n: number }>`
    select count(*) as n from portal_decisions d
    join portal_projects p on p.id = d.project_id
    where d.state = 'awaiting-client'
  `;
  const blocked = await sql<{ n: number }>`
    select count(*) as n from portal_milestones where status = 'blocked'
  `;
  const silent = await sql<{ n: number }>`
    select count(*) as n from portal_projects
    where source <> 'sample'
      and (last_viewed_at is null or last_viewed_at < now() - make_interval(days => ${CLIENT_SILENT_DAYS}))
  `;

  const total = Number(waiting[0]?.n ?? 0) + Number(blocked[0]?.n ?? 0) + Number(silent[0]?.n ?? 0);
  if (total === 0) return false;

  // Attach the digest to the project that actually needs attention rather than
  // whichever row happens to be oldest — otherwise deleting that project
  // silently stops the studio being told anything.
  const subject = await sql<{ id: string }>`
    select p.id from portal_projects p
    where exists (
      select 1 from portal_milestones m
        where m.project_id = p.id and m.status = 'blocked'
    ) or exists (
      select 1 from portal_decisions d
        where d.project_id = p.id and d.state = 'awaiting-client'
    )
    order by p.created_at desc
    limit 1
  `;
  const projectId = subject[0]?.id;
  if (!projectId) return false;

  const result = await notify({
    projectId,
    kind: "note",
    title: `Daily studio digest: ${total} item${total === 1 ? "" : "s"} need a human`,
    body: [
      `${waiting[0]?.n ?? 0} decision(s) waiting on a client`,
      `${blocked[0]?.n ?? 0} stage(s) blocked`,
      `${silent[0]?.n ?? 0} client(s) have not opened their project in ${CLIENT_SILENT_DAYS} days`,
    ].join("\\n"),
    audience: "studio",
    channels,
    dedupeKey: `studio-digest:${new Date().toISOString().slice(0, 10)}`,
  });

  return result.created;
}

/**
 * One pass of the sweep. Safe to call as often as you like: every send is
 * claimed through the dedupe index first.
 */
export async function runAttentionSweep(options?: {
  clientChannels?: Channel[];
  studioChannels?: Channel[];
}): Promise<SweepResult> {
  const sql = await getSql();
  const clientChannels = options?.clientChannels ?? ["inapp"];
  const studioChannels = options?.studioChannels ?? ["inapp"];

  const clientReminders = await remindClients(sql, clientChannels);
  const studioAlerts = await alertStudioOnBlocked(sql, studioChannels);
  const digestSent = await sendDigest(sql, studioChannels);

  return { clientReminders, studioAlerts, digestSent };
}

/** What the client should be nudged about, for a banner in their own portal. */
export type ClientNudge = { decisionId: string; title: string; ageDays: number };

export async function clientNudges(sql: Sql, userId: string): Promise<ClientNudge[]> {
  const rows = await sql<{ id: string; title: string; age: number }>`
    select d.id, d.title,
      floor(extract(epoch from (now() - d.created_at)) / 86400) as age
    from portal_decisions d
    join portal_projects p on p.id = d.project_id
    where p.user_id = ${userId}
      and d.state = 'awaiting-client'
      and d.created_at < now() - make_interval(days => ${CLIENT_REMINDER_AFTER_DAYS})
    order by d.created_at
  `;
  return rows.map((r) => ({
    decisionId: r.id,
    title: r.title,
    ageDays: Number(r.age ?? 0),
  }));
}

/* ── server functions ── */

/**
 * Runs the sweep. Staff-gated: it sends messages on the studio's behalf, so it
 * must never be reachable from a client session.
 */
export const runAttentionSweepNow = createServerFn({ method: "POST" }).handler(async () => {
  const { requireStaff } = await import("@/lib/staff-session.server");
  await requireStaff();
  return runAttentionSweep();
});

/** Client-side nudges for the signed-in account. */
export const getMyNudges = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => clientNudges(await getSql(), context.userId));
