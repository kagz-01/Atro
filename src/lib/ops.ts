// ATRO studio operations — the numbers a studio actually runs on.
//
// All staff-gated. Deliberately aggregate rather than per-client: this is the
// view that answers "how are we doing", not "what is happening to Wanjiku".

import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { TRACKS, trackById, type TrackId } from "@/lib/diaspora/tracks";
import { ZONES } from "@/lib/site";

async function staff() {
  const { requireStaff } = await import("@/lib/staff-session.server");
  return requireStaff();
}

export type MoneyPosition = {
  contractValue: number;
  certified: number;
  paid: number;
  certifiedUnreleased: number;
  retentionHeld: number;
  projectedAtCompletion: number;
};

export type Funnel = {
  enquiriesTotal: number;
  enquiriesDiaspora: number;
  enquiriesLast7Days: number;
  projectsTotal: number;
  projectsLive: number;
  projectsSample: number;
  clients: number;
};

export type GroupRow = { key: string; label: string; count: number; value: number };

export type AttentionItem = {
  kind: "blocked" | "decision" | "stalled" | "unviewed";
  projectId: string;
  reference: string;
  title: string;
  detail: string;
  ageDays: number;
};

export type OpsOverview = {
  funnel: Funnel;
  money: MoneyPosition;
  byTrack: GroupRow[];
  byZone: GroupRow[];
  attention: AttentionItem[];
};

const STALLED_DAYS = 10;
const UNVIEWED_DAYS = 14;

export const getOpsOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<OpsOverview> => {
    await staff();
    const sql = await getSql();

    const [projects] = await sql<Record<string, unknown>>`
      select
        count(*) as total,
        count(*) filter (where source <> 'sample') as live,
        count(*) filter (where source = 'sample') as sample_projects,
        count(distinct user_id) as clients,
        coalesce(sum(contract_value), 0) as contract_value,
        coalesce(sum(certified_to_date), 0) as certified,
        coalesce(sum(paid_to_date), 0) as paid,
        coalesce(sum(currently_certified), 0) as certified_unreleased,
        coalesce(sum(retention_held), 0) as retention_held,
        coalesce(sum(projected_at_completion), 0) as projected_at_completion
      from portal_projects
    `;

    const [enquiries] = await sql<Record<string, unknown>>`
      select
        count(*) as total,
        count(*) filter (where diaspora) as diaspora,
        count(*) filter (where created_at > now() - interval '7 days') as last_7
      from enquiries
    `;

    const trackRows = await sql<{ track: string; count: number; value: number }>`
      select coalesce(nullif(track, ''), 'construction') as track,
        count(*) as count, coalesce(sum(contract_value), 0) as value
      from portal_projects group by 1
    `;

    const zoneRows = await sql<{ zone: string; count: number; value: number }>`
      select zone, count(*) as count, coalesce(sum(contract_value), 0) as value
      from portal_projects group by 1
    `;

    // ── the queue that needs a human ──
    const blocked = await sql<{
      project_id: string;
      reference: string;
      title: string;
      name: string;
      age: number;
    }>`
      select m.project_id, p.reference, p.title, m.name,
        floor(extract(epoch from (now() - coalesce(m.updated_at, p.created_at))) / 86400) as age
      from portal_milestones m
      join portal_projects p on p.id = m.project_id
      where m.status = 'blocked'
      order by age desc
    `;

    const waiting = await sql<{
      project_id: string;
      reference: string;
      title: string;
      decision_title: string;
      age: number;
    }>`
      select d.project_id, p.reference, p.title, d.title as decision_title,
        floor(extract(epoch from (now() - d.created_at)) / 86400) as age
      from portal_decisions d
      join portal_projects p on p.id = d.project_id
      where d.state = 'awaiting-client'
      order by age desc
    `;

    const stalled = await sql<{
      id: string;
      reference: string;
      title: string;
      age: number;
    }>`
      select id, reference, title,
        floor(extract(epoch from (now() - created_at)) / 86400) as age
      from portal_projects
      where source <> 'sample'
        and created_at < now() - make_interval(days => ${STALLED_DAYS})
        and (last_viewed_at is null or last_viewed_at < now() - make_interval(days => ${STALLED_DAYS}))
      order by age desc
    `;

    const unviewed = await sql<{
      id: string;
      reference: string;
      title: string;
      age: number;
    }>`
      select id, reference, title,
        floor(extract(epoch from (now() - updated_at)) / 86400) as age
      from portal_projects
      where source <> 'sample'
        and updated_at > now() - make_interval(days => 7)
        and (last_viewed_at is null or last_viewed_at < now() - make_interval(days => ${UNVIEWED_DAYS}))
      order by age desc
    `;

    const trackLabel = (id: string) => trackById(id).label;
    const zoneLabel = (slug: string) =>
      ZONES.find((z) => z.slug === slug)?.name ?? (slug ? slug : "Unassigned");

    const attention: AttentionItem[] = [
      ...blocked.map((r) => ({
        kind: "blocked" as const,
        projectId: r.project_id,
        reference: r.reference,
        title: r.title,
        detail: `Blocked at: ${r.name}`,
        ageDays: Number(r.age ?? 0),
      })),
      ...waiting.map((r) => ({
        kind: "decision" as const,
        projectId: r.project_id,
        reference: r.reference,
        title: r.title,
        detail: `Client has not answered: ${r.decision_title}`,
        ageDays: Number(r.age ?? 0),
      })),
      ...stalled.map((r) => ({
        kind: "stalled" as const,
        projectId: r.id,
        reference: r.reference,
        title: r.title,
        detail: "Nobody has opened this project in over a fortnight",
        ageDays: Number(r.age ?? 0),
      })),
      ...unviewed.map((r) => ({
        kind: "unviewed" as const,
        projectId: r.id,
        reference: r.reference,
        title: r.title,
        detail: "You have posted updates the client has not looked at",
        ageDays: Number(r.age ?? 0),
      })),
    ].sort((a, b) => b.ageDays - a.ageDays);

    const n = (v: unknown) => Number(v ?? 0);

    return {
      funnel: {
        enquiriesTotal: n(enquiries?.total),
        enquiriesDiaspora: n(enquiries?.diaspora),
        enquiriesLast7Days: n(enquiries?.last_7),
        projectsTotal: n(projects?.total),
        projectsLive: n(projects?.live),
        projectsSample: n(projects?.sample_projects),
        clients: n(projects?.clients),
      },
      money: {
        contractValue: n(projects?.contract_value),
        certified: n(projects?.certified),
        paid: n(projects?.paid),
        certifiedUnreleased: n(projects?.certified_unreleased),
        retentionHeld: n(projects?.retention_held),
        projectedAtCompletion: n(projects?.projected_at_completion),
      },
      byTrack: trackRows.map((r) => ({
        key: r.track,
        label: trackLabel(r.track),
        count: n(r.count),
        value: n(r.value),
      })),
      byZone: zoneRows.map((r) => ({
        key: r.zone,
        label: zoneLabel(r.zone),
        count: n(r.count),
        value: n(r.value),
      })),
      attention,
    };
  },
);

/** Pipeline summary by track, using the studio's own registry for the labels. */
export function trackLabelFor(id: string): string {
  return (TRACKS[id as TrackId] ?? TRACKS.construction).label;
}