// ATRO "My work" — the studio console's answer to "what is on ME".
//
// Overview and Projects describe the studio; this screen is the one page that
// belongs to a single staff member: the enquiries they claimed and have not
// closed, the approvals that have gone quiet and need another call, and the
// notes they left on projects. Reads start with `requireStaff()`, like every
// staff operation, and the only write it drives — marking a chase — is the
// existing `chaseApproval`, so the list and the action cannot disagree about
// what a chase is.

import { createServerFn } from "@tanstack/react-start";
import { needsChase } from "@/lib/approvals";
import { toApproval } from "@/lib/approvals-server";
import { getSql } from "@/lib/db";
import { requireStaff } from "@/lib/staff-session.server";

export type MyEnquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  projectType: string;
  zone: string;
  status: string;
  createdAt: string;
};

export type MyChase = {
  approvalId: string;
  title: string;
  authority: string;
  blocking: boolean;
  chasedOn: string;
  projectId: string;
  projectTitle: string;
  reference: string;
};

export type MyNote = {
  id: string;
  body: string;
  createdAt: string;
  projectId: string;
  projectTitle: string;
  reference: string;
};

export type MyWork = {
  enquiries: MyEnquiry[];
  chases: MyChase[];
  notes: MyNote[];
};

export const getMyWork = createServerFn({ method: "GET" }).handler(async (): Promise<MyWork> => {
  const staff = await requireStaff();
  const sql = await getSql();

  // The live funnel only: claimed enquiries that are won, lost or already
  // converted are finished work, not today's queue.
  const enquiries = await sql<{
    id: string;
    name: string;
    phone: string;
    email: string;
    project_type: string;
    zone: string;
    status: string;
    created_at: unknown;
  }>`
    select id, name, phone, email, project_type, zone, status, created_at
    from enquiries
    where lower(assigned_to) = ${staff.email}
      and status in ('new', 'contacted', 'quoted')
    order by created_at desc
    limit 8
  `;

  // Chases are judged with the same pure rule the approvals panel uses
  // (`needsChase`), so a row here and a row there can never disagree about
  // whether an approval is worth another call. Staff work across every
  // project by design, so this is studio-wide, not per-claim.
  const approvalRows = await sql<Record<string, unknown>>`
    select a.*, p.id as project_id, p.title as project_title, p.reference
    from portal_approval a
    join portal_projects p on p.id = a.project_id
    order by p.reference, a.ord
  `;
  const now = new Date();
  const chases = approvalRows
    .map((row) => ({ approval: toApproval(row), row }))
    .filter(({ approval }) => needsChase(approval, now))
    .slice(0, 8)
    .map(({ approval, row }) => ({
      approvalId: approval.id,
      title: approval.title,
      authority: approval.authority,
      blocking: approval.blocking,
      chasedOn: approval.chasedOn,
      projectId: String(row.project_id ?? ""),
      projectTitle: String(row.project_title ?? ""),
      reference: String(row.reference ?? ""),
    }));

  // Notes are authored by the writer's user id (postUpdateFor), which is what
  // makes "notes I wrote" a query rather than a guess.
  const notes = await sql<{
    id: string;
    body: string;
    created_at: unknown;
    project_id: string;
    project_title: string;
    reference: string;
  }>`
    select n.id, n.body, n.created_at, p.id as project_id, p.title as project_title, p.reference
    from staff_note n
    join portal_projects p on p.id = n.project_id
    where lower(n.author_id) = lower(${staff.userId})
    order by n.created_at desc
    limit 6
  `;

  return {
    enquiries: enquiries.map((e) => ({
      id: e.id,
      name: e.name,
      phone: e.phone,
      email: e.email,
      projectType: e.project_type,
      zone: e.zone,
      status: e.status,
      createdAt: String(e.created_at),
    })),
    chases,
    notes: notes.map((n) => ({
      id: n.id,
      body: n.body,
      createdAt: String(n.created_at),
      projectId: n.project_id,
      projectTitle: n.project_title,
      reference: n.reference,
    })),
  };
});
