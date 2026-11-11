// ATRO studio operations — owner business reporting and the staff follow-up queue.
//
// Business aggregates are admin-only. Staff receive a separate, minimal
// operational response rather than financial or business-wide totals.

import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { TRACKS, trackById, type TrackId } from "@/lib/diaspora/tracks";
import { ZONES } from "@/lib/site";
import { unreadClientMessages } from "@/lib/messages-server";
import { proposedVariations } from "@/lib/variations-server";
import { signedKes } from "@/lib/variations";

async function staff() {
  const { requireStaff } = await import("@/lib/staff-session.server");
  return requireStaff();
}

async function admin() {
  const identity = await staff();
  if (identity.role !== "admin") {
    throw new Error("Only an admin can view the business overview.");
  }
  return identity;
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
  /** Not yet marked as contacted — the number the sidebar badge shows. */
  enquiriesNew: number;
  projectsTotal: number;
  projectsLive: number;
  projectsSample: number;
  clients: number;
};

export type GroupRow = { key: string; label: string; count: number; value: number };

/** Contracted and collected per track — the two bars the money panel compares. */
export type TrackRow = GroupRow & { paid: number };

/**
 * Six months of enquiry and cash-in history.
 *
 * month is the numeric month so the two series can be merged in JS rather than
 * forcing a full outer join in SQL — the labels come out sorted either way.
 */
export type MonthRow = {
  label: string;
  month: number;
  enquiries: number;
  received: number;
};

export type AttentionItem = {
  kind: "blocked" | "decision" | "stalled" | "unviewed" | "message" | "variation";
  projectId: string;
  reference: string;
  title: string;
  detail: string;
  ageDays: number;
};

export type OpsOverview = {
  funnel: Funnel;
  money: MoneyPosition;
  byTrack: TrackRow[];
  byZone: GroupRow[];
  byMonth: MonthRow[];
  attention: AttentionItem[];
};

export type StaffTodayOverview = {
  newEnquiries: number;
  attention: AttentionItem[];
};

export type StudioPaymentRow = {
  projectId: string;
  projectReference: string;
  projectTitle: string;
  clientLabel: string;
  contractValue: number;
  paidToDate: number;
  currentlyCertified: number;
  paymentId: string;
  paymentLabel: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
  method: string | null;
  certificate: string | null;
  attemptStatus: string | null;
  attemptReference: string | null;
  attemptChannel: string | null;
  attemptCreatedAt: string | null;
  attemptHistory: StudioPaymentAttempt[];
};

export type StudioPaymentAttempt = {
  reference: string;
  status: string;
  amount: number;
  channel: string | null;
  providerTransactionId: string | null;
  createdAt: string;
  paidAt: string | null;
};

const STALLED_DAYS = 10;
const UNVIEWED_DAYS = 14;

async function getAttentionItems(sql: Sql): Promise<AttentionItem[]> {
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

  const waitingOnUs = await unreadClientMessages(sql);
  const waitingOnClient = await proposedVariations(sql);

  return [
    ...blocked.map((row) => ({
      kind: "blocked" as const,
      projectId: row.project_id,
      reference: row.reference,
      title: row.title,
      detail: `Blocked at: ${row.name}`,
      ageDays: Number(row.age ?? 0),
    })),
    ...waiting.map((row) => ({
      kind: "decision" as const,
      projectId: row.project_id,
      reference: row.reference,
      title: row.title,
      detail: `Client has not answered: ${row.decision_title}`,
      ageDays: Number(row.age ?? 0),
    })),
    ...stalled.map((row) => ({
      kind: "stalled" as const,
      projectId: row.id,
      reference: row.reference,
      title: row.title,
      detail: "Nobody has opened this project in over a fortnight",
      ageDays: Number(row.age ?? 0),
    })),
    ...unviewed.map((row) => ({
      kind: "unviewed" as const,
      projectId: row.id,
      reference: row.reference,
      title: row.title,
      detail: "You have posted updates the client has not looked at",
      ageDays: Number(row.age ?? 0),
    })),
    ...waitingOnUs.map((row) => ({
      kind: "message" as const,
      projectId: row.projectId,
      reference: row.reference,
      title: row.title,
      detail: `${row.body.slice(0, 90)}${row.body.length > 90 ? "…" : ""}`,
      ageDays: Number(row.age ?? 0),
    })),
    ...waitingOnClient.map((row) => ({
      kind: "variation" as const,
      projectId: row.projectId,
      reference: row.reference,
      title: row.title,
      detail: `${signedKes(row.amount)} waiting for the client: ${row.variationTitle.slice(0, 60)}`,
      ageDays: Number(row.age ?? 0),
    })),
  ].sort((a, b) => b.ageDays - a.ageDays);
}

export const getStaffToday = createServerFn({ method: "GET" }).handler(
  async (): Promise<StaffTodayOverview> => {
    await staff();
    const sql = await getSql();
    const [enquiries] = await sql<{ new_enquiries: number }>`
      select count(*) filter (where status = 'new') as new_enquiries
      from enquiries
    `;
    return {
      newEnquiries: Number(enquiries?.new_enquiries ?? 0),
      attention: await getAttentionItems(sql),
    };
  },
);

export const getStudioPayments = createServerFn({ method: "GET" }).handler(
  async (): Promise<StudioPaymentRow[]> => {
    await staff();
    const sql = await getSql();
    const rows = await sql<{
      project_id: string;
      project_reference: string;
      project_title: string;
      client_label: string;
      contract_value: number;
      paid_to_date: number;
      currently_certified: number;
      payment_id: string;
      payment_label: string;
      amount: number;
      status: string;
      due_date: string;
      paid_date: string | null;
      method: string | null;
      certificate: string | null;
      attempt_status: string | null;
      attempt_reference: string | null;
      attempt_channel: string | null;
      attempt_created_at: string | null;
    }>`
      select
        project.id as project_id, project.reference as project_reference,
        project.title as project_title, project.client_label,
        project.contract_value, project.paid_to_date, project.currently_certified,
        payment.id as payment_id, payment.label as payment_label, payment.amount,
        payment.status, payment.due_date, payment.paid_date, payment.method,
        payment.certificate, latest.status as attempt_status,
        latest.reference as attempt_reference, latest.payment_channel as attempt_channel,
        latest.created_at::text as attempt_created_at
      from portal_projects project
      join portal_payments payment on payment.project_id = project.id
      left join lateral (
        select attempt.status, attempt.reference, attempt.payment_channel, attempt.created_at
        from portal_paystack_attempt attempt
        where attempt.project_id = project.id and attempt.payment_id = payment.id
        order by attempt.created_at desc
        limit 1
      ) latest on true
      where project.source <> 'sample' and project.deleted_at is null
      order by lower(project.client_label), project.reference, payment.ord
    `;

    const attemptRows = await sql<{
      payment_id: string;
      reference: string;
      status: string;
      amount_kes: number;
      payment_channel: string | null;
      provider_transaction_id: string | null;
      created_at: string;
      paid_at: string | null;
    }>`
      select attempt.payment_id, attempt.reference, attempt.status, attempt.amount_kes,
        attempt.payment_channel, attempt.provider_transaction_id,
        attempt.created_at::text, attempt.paid_at::text
      from portal_paystack_attempt attempt
      join portal_projects project on project.id = attempt.project_id
      where project.source <> 'sample' and project.deleted_at is null
      order by attempt.created_at desc
    `;
    const attemptsByPayment = new Map<string, StudioPaymentAttempt[]>();
    for (const attempt of attemptRows) {
      const history = attemptsByPayment.get(attempt.payment_id) ?? [];
      history.push({
        reference: attempt.reference,
        status: attempt.status,
        amount: Number(attempt.amount_kes),
        channel: attempt.payment_channel,
        providerTransactionId: attempt.provider_transaction_id,
        createdAt: attempt.created_at,
        paidAt: attempt.paid_at,
      });
      attemptsByPayment.set(attempt.payment_id, history);
    }

    return rows.map((row) => ({
      projectId: row.project_id,
      projectReference: row.project_reference,
      projectTitle: row.project_title,
      clientLabel: row.client_label,
      contractValue: Number(row.contract_value),
      paidToDate: Number(row.paid_to_date),
      currentlyCertified: Number(row.currently_certified),
      paymentId: row.payment_id,
      paymentLabel: row.payment_label,
      amount: Number(row.amount),
      status: row.status,
      dueDate: row.due_date,
      paidDate: row.paid_date,
      method: row.method,
      certificate: row.certificate,
      attemptStatus: row.attempt_status,
      attemptReference: row.attempt_reference,
      attemptChannel: row.attempt_channel,
      attemptCreatedAt: row.attempt_created_at,
      attemptHistory: attemptsByPayment.get(row.payment_id) ?? [],
    }));
  },
);

export const getOpsOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<OpsOverview> => {
    await admin();
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
        count(*) filter (where created_at > now() - interval '7 days') as last_7,
        count(*) filter (where status = 'new') as new_enquiries
      from enquiries
    `;

    const trackRows = await sql<{ track: string; count: number; value: number; paid: number }>`
      select coalesce(nullif(track, ''), 'construction') as track,
        count(*) as count, coalesce(sum(contract_value), 0) as value,
        coalesce(sum(paid_to_date), 0) as paid
      from portal_projects group by 1
    `;

    // ── six months of history for the dashboard charts ──
    const enquiryMonths = await sql<{ label: string; month: number; count: number }>`
      select to_char(date_trunc('month', created_at), 'Mon') as label,
        extract(month from created_at)::int as month,
        count(*) as count
      from enquiries
      where created_at > now() - make_interval(months => 6)
      group by 1, 2
    `;

    // paid_date is stored as free text (it carries "Week 08" style labels on some
    // rows), so it is filtered to ISO dates before being cast — casting the whole
    // column would throw on a single unparseable value.
    const cashMonths = await sql<{ label: string; month: number; received: number }>`
      select to_char(date_trunc('month', paid_date::timestamptz), 'Mon') as label,
        extract(month from paid_date::timestamptz)::int as month,
        coalesce(sum(amount), 0) as received
      from portal_payments
      where status = 'paid'
        and paid_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
        and paid_date::timestamptz > now() - make_interval(months => 6)
      group by 1, 2
    `;

    const zoneRows = await sql<{ zone: string; count: number; value: number }>`
      select zone, count(*) as count, coalesce(sum(contract_value), 0) as value
      from portal_projects group by 1
    `;

    const trackLabel = (id: string) => trackById(id).label;
    const zoneLabel = (slug: string) =>
      ZONES.find((z) => z.slug === slug)?.name ?? (slug ? slug : "Unassigned");

    const attention = await getAttentionItems(sql);

    const n = (v: unknown) => Number(v ?? 0);

    // Merge the two monthly series on the month number, then order by month so
    // the chart reads Jan → Jun regardless of which query saw which month.
    const monthly = new Map<number, MonthRow>();
    const month = (key: number, label: string): MonthRow => {
      const found = monthly.get(key);
      if (found) return found;
      const fresh: MonthRow = { label, month: key, enquiries: 0, received: 0 };
      monthly.set(key, fresh);
      return fresh;
    };
    for (const r of enquiryMonths) month(r.month, r.label).enquiries = n(r.count);
    for (const r of cashMonths) month(r.month, r.label).received = n(r.received);
    const byMonth = [...monthly.values()].sort((a, b) => a.month - b.month);

    return {
      funnel: {
        enquiriesTotal: n(enquiries?.total),
        enquiriesDiaspora: n(enquiries?.diaspora),
        enquiriesLast7Days: n(enquiries?.last_7),
        enquiriesNew: n(enquiries?.new_enquiries),
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
        paid: n(r.paid),
      })),
      byZone: zoneRows.map((r) => ({
        key: r.zone,
        label: zoneLabel(r.zone),
        count: n(r.count),
        value: n(r.value),
      })),
      byMonth,
      attention,
    };
  },
);

/** Pipeline summary by track, using the studio's own registry for the labels. */
export function trackLabelFor(id: string): string {
  return (TRACKS[id as TrackId] ?? TRACKS.construction).label;
}