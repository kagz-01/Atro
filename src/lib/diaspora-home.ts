// The diaspora home: what a signed-in client sees on /diaspora.
//
// The public page already tells a prospect everything the studio promises.
// This is the other half — the same URL as a home, for the person who already
// has a project: their projects with the milestone being built now and the
// last thing the studio said, so a client who lands here instead of the
// portal still knows where things stand. Deliberately light — the portal
// remains the full record; this is the doorstep.
//
// No authMiddleware: like getMyStaffRole, this reads the session directly and
// answers "nobody" when there is none, because a marketing page must render
// for signed-out visitors without an error in the console.

import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";

export type DiasporaProjectCard = {
  reference: string;
  title: string;
  activeMilestone: string | null;
  lastActivityTitle: string | null;
  lastActivityAt: string | null;
};

export type DiasporaHome = {
  name: string | null;
  projects: DiasporaProjectCard[];
};

function iso(value: unknown): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** The signed-in client's projects, one row each, scoped by user_id. */
export async function loadDiasporaHome(sql: Sql, userId: string): Promise<DiasporaHome> {
  const profile = await sql<{ display_name: string | null }>`
    select display_name from client_profile where user_id = ${userId} limit 1
  `;
  const rows = await sql<{
    reference: string;
    title: string;
    active_milestone: string | null;
    last_title: string | null;
    last_at: unknown;
  }>`
    select p.reference, p.title,
           m.name as active_milestone,
           a.title as last_title, a.at as last_at
    from portal_projects p
    left join lateral (
      select name from portal_milestones
      where project_id = p.id and status = 'active'
      limit 1
    ) m on true
    left join lateral (
      select title, at from portal_activity
      where project_id = p.id
      order by at desc limit 1
    ) a on true
    where p.user_id = ${userId}
    order by p.created_at asc
  `;
  return {
    name: profile[0]?.display_name || null,
    projects: rows.map((r) => ({
      reference: r.reference,
      title: r.title,
      activeMilestone: r.active_milestone || null,
      lastActivityTitle: r.last_title || null,
      lastActivityAt: iso(r.last_at),
    })),
  };
}

export const getDiasporaHome = createServerFn({ method: "GET" }).handler(async () => {
  const { currentIdentity } = await import("@/lib/staff-session.server");
  const identity = await currentIdentity();
  if (!identity) return { signedIn: false as const, name: null, projects: [] };
  const home = await loadDiasporaHome(await getSql(), identity.userId);
  return { signedIn: true as const, ...home };
});
