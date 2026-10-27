import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { normaliseEmail } from "@/lib/staff";
import { recordDecisionFor } from "@/lib/diaspora/server";
import { notify } from "@/lib/notify";
import {
  canAcceptCircleInvite,
  hasActiveCircleAccess,
  normaliseCircleEmail,
  PROJECT_CIRCLE_ACCESS_DAYS,
  PROJECT_CIRCLE_INVITE_DAYS,
} from "@/lib/project-circle";
import { isDayInput, siteDay } from "@/lib/presence";

type CircleActor = { userId: string; email: string; emailVerified: boolean };

type RepresentativeRow = {
  id: string;
  project_id: string;
  owner_user_id: string;
  invite_email: string;
  representative_user_id: string | null;
  status: string;
  invited_by: string;
  created_at: unknown;
  expires_at: unknown;
  accepted_at: unknown;
  revoked_at: unknown;
};

function iso(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function jsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function inviteDigest(token: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(token).digest("hex");
}

async function newInviteToken(): Promise<string> {
  const { randomBytes } = await import("node:crypto");
  return randomBytes(32).toString("base64url");
}

async function auditCircleEvent(
  sql: Sql,
  input: {
    projectId: string;
    representativeId?: string | null;
    actorUserId: string;
    event: string;
    details?: Record<string, string>;
  },
) {
  await sql`
    insert into portal_project_circle_audit (
      project_id, representative_id, actor_user_id, event, details
    ) values (
      ${input.projectId}, ${input.representativeId ?? null}, ${input.actorUserId},
      ${input.event}, ${JSON.stringify(input.details ?? {})}::jsonb
    )
  `;
}

async function requireOwnedProject(sql: Sql, ownerUserId: string, projectId: string) {
  const [project] = await sql<{ id: string }>`
    select id from portal_projects
    where id = ${projectId} and user_id = ${ownerUserId}
      and deleted_at is null and source <> 'sample'
      and lifecycle_state not in ('closed', 'archived')
    limit 1
  `;
  if (!project) throw new Error("Project not found.");
  return project.id;
}

async function requireRepresentative(
  sql: Sql,
  userId: string,
  projectId: string,
): Promise<RepresentativeRow> {
  const [membership] = await sql<RepresentativeRow>`
    select r.id, r.project_id, r.owner_user_id, r.invite_email,
      r.representative_user_id, r.status, r.invited_by,
      r.created_at, r.expires_at, r.accepted_at, r.revoked_at
    from portal_project_representatives r
    join portal_projects p on p.id = r.project_id
    where r.project_id = ${projectId}
      and r.representative_user_id = ${userId}
      and r.status = 'active' and r.expires_at > now()
      and p.user_id = r.owner_user_id
      and p.deleted_at is null and p.lifecycle_state not in ('closed', 'archived')
    limit 1
  `;
  if (!membership) throw new Error("Project not found.");
  return membership;
}

const ProjectIdInput = z.object({ projectId: z.string().min(1) });

export type CircleProjectSummary = {
  projectId: string;
  reference: string;
  title: string;
  stage: string;
  progress: number;
  expiresAt: string;
};

export type CircleProjectPayload = CircleProjectSummary & {
  milestones: {
    id: string;
    name: string;
    stage: string;
    status: string;
    progress: number;
    summary: string;
    evidence: { date: string; caption: string; detail: string }[];
  }[];
  activity: { id: string; title: string; body: string; at: string }[];
  decisions: {
    id: string;
    title: string;
    detail: string;
    options: string[];
    dueDate: string | null;
  }[];
  presence: {
    id: string;
    status: string;
    clientNote: string;
    proposedOn: string | null;
    createdAt: string;
  }[];
};

export const getMyProjectCircle = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<CircleProjectSummary[]> => {
    const sql = await getSql();
    const rows = await sql<{
      project_id: string;
      reference: string;
      title: string;
      stage: string;
      progress: number;
      expires_at: unknown;
    }>`
      select p.id as project_id, p.reference, p.title, p.stage, p.progress, r.expires_at
      from portal_project_representatives r
      join portal_projects p on p.id = r.project_id
      where r.representative_user_id = ${context.userId}
        and r.status = 'active' and r.expires_at > now()
        and p.user_id = r.owner_user_id
        and p.deleted_at is null and p.lifecycle_state not in ('closed', 'archived')
      order by p.updated_at desc
    `;
    return rows.map((row) => ({
      projectId: row.project_id,
      reference: row.reference,
      title: row.title,
      stage: row.stage,
      progress: Number(row.progress),
      expiresAt: iso(row.expires_at) ?? "",
    }));
  });

export const getCircleProject = createServerFn({ method: "GET" })
  .validator(ProjectIdInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<CircleProjectPayload> => {
    const sql = await getSql();
    const membership = await requireRepresentative(sql, context.userId, data.projectId);
    const [project] = await sql<{
      id: string;
      reference: string;
      title: string;
      stage: string;
      progress: number;
      updated_at: unknown;
    }>`
      select id, reference, title, stage, progress, updated_at
      from portal_projects where id = ${membership.project_id} limit 1
    `;
    if (!project) throw new Error("Project not found.");

    const milestoneRows = await sql<{
      id: string;
      name: string;
      stage: string;
      status: string;
      progress: number;
      summary: string;
      evidence: unknown;
    }>`
      select id, name, stage, status, progress, summary, evidence
      from portal_milestones where project_id = ${project.id} order by ord
    `;
    const activityRows = await sql<{
      id: string;
      title: string;
      body: string;
      at: unknown;
    }>`
      select id, title, body, at from portal_activity
      where project_id = ${project.id} and kind in ('milestone', 'evidence')
      order by at desc limit 20
    `;
    const decisionRows = await sql<{
      id: string;
      title: string;
      detail: string;
      options: unknown;
      due_date: string | null;
    }>`
      select id, title, detail, options, due_date
      from portal_decisions
      where project_id = ${project.id} and state <> 'decided'
      order by ord
    `;
    const presenceRows = await sql<{
      id: string;
      status: string;
      client_note: string;
      proposed_on: unknown;
      created_at: unknown;
    }>`
      select id, status, client_note, proposed_on, created_at
      from portal_presence
      where project_id = ${project.id} and kind = 'visit'
      order by created_at desc limit 20
    `;

    return {
      projectId: project.id,
      reference: project.reference,
      title: project.title,
      stage: project.stage,
      progress: Number(project.progress),
      expiresAt: iso(membership.expires_at) ?? "",
      milestones: milestoneRows.map((row) => ({
        id: row.id,
        name: row.name,
        stage: row.stage,
        status: row.status,
        progress: Number(row.progress),
        summary: row.summary,
        evidence: jsonArray(row.evidence).map((value) => {
          const evidence = value as Record<string, unknown>;
          return {
            date: String(evidence.date ?? ""),
            caption: String(evidence.caption ?? ""),
            detail: String(evidence.detail ?? ""),
          };
        }),
      })),
      activity: activityRows.map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        at: iso(row.at) ?? "",
      })),
      decisions: decisionRows.map((row) => ({
        id: row.id,
        title: row.title,
        detail: row.detail,
        options: jsonArray(row.options).map(String),
        dueDate: row.due_date,
      })),
      presence: presenceRows.map((row) => ({
        id: row.id,
        status: row.status,
        clientNote: row.client_note,
        proposedOn: row.proposed_on ? String(row.proposed_on).slice(0, 10) : null,
        createdAt: iso(row.created_at) ?? "",
      })),
    };
  });

export type CircleOverview = {
  representatives: {
    id: string;
    email: string;
    status: "pending" | "active" | "revoked" | "expired";
    createdAt: string;
    expiresAt: string;
  }[];
  suggestions: {
    id: string;
    decisionId: string;
    decisionTitle: string;
    options: string[];
    suggestedOption: string;
    note: string;
    representativeEmail: string;
    createdAt: string;
  }[];
  audit: { id: string; event: string; email: string; createdAt: string }[];
};

export const getProjectCircleOverview = createServerFn({ method: "GET" })
  .validator(ProjectIdInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<CircleOverview> => {
    const sql = await getSql();
    const projectId = await requireOwnedProject(sql, context.userId, data.projectId);
    const representativeRows = await sql<{
      id: string;
      invite_email: string;
      status: "pending" | "active" | "revoked";
      created_at: unknown;
      expires_at: unknown;
    }>`
      select id, invite_email, status, created_at, expires_at
      from portal_project_representatives
      where project_id = ${projectId}
      order by created_at desc limit 30
    `;
    const suggestionRows = await sql<{
      id: string;
      decision_id: string;
      decision_title: string;
      options: unknown;
      suggested_option: string;
      note: string;
      invite_email: string;
      created_at: unknown;
    }>`
      select s.id, s.decision_id, d.title as decision_title, d.options,
        s.suggested_option, s.note, r.invite_email, s.created_at
      from portal_decision_suggestions s
      join portal_decisions d on d.id = s.decision_id and d.project_id = s.project_id
      join portal_project_representatives r on r.id = s.representative_id
      where s.project_id = ${projectId} and s.status = 'pending'
        and d.state <> 'decided'
      order by s.created_at desc
    `;
    const auditRows = await sql<{
      id: string;
      event: string;
      details: unknown;
      created_at: unknown;
    }>`
      select id, event, details, created_at
      from portal_project_circle_audit
      where project_id = ${projectId}
      order by created_at desc limit 20
    `;

    return {
      representatives: representativeRows.map((row) => {
        const expiresAt = iso(row.expires_at) ?? "";
        const status =
          row.status === "revoked"
            ? "revoked"
            : hasActiveCircleAccess(row.status, expiresAt)
              ? "active"
              : new Date(expiresAt).getTime() > Date.now()
                ? row.status
                : "expired";
        return {
          id: row.id,
          email: row.invite_email,
          status,
          createdAt: iso(row.created_at) ?? "",
          expiresAt,
        };
      }),
      suggestions: suggestionRows.map((row) => ({
        id: row.id,
        decisionId: row.decision_id,
        decisionTitle: row.decision_title,
        options: jsonArray(row.options).map(String),
        suggestedOption: row.suggested_option,
        note: row.note,
        representativeEmail: row.invite_email,
        createdAt: iso(row.created_at) ?? "",
      })),
      audit: auditRows.map((row) => {
        const details =
          row.details && typeof row.details === "object"
            ? (row.details as Record<string, unknown>)
            : {};
        return {
          id: row.id,
          event: row.event,
          email: String(details.email ?? ""),
          createdAt: iso(row.created_at) ?? "",
        };
      }),
    };
  });

const InviteRepresentativeInput = z.object({
  projectId: z.string().min(1),
  email: z.string().trim().email().max(160),
});

export const inviteProjectRepresentative = createServerFn({ method: "POST" })
  .validator(InviteRepresentativeInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const projectId = await requireOwnedProject(sql, context.userId, data.projectId);
    const email = normaliseEmail(data.email);
    if (!email) throw new Error("Enter a valid email address.");
    if (email === normaliseEmail(context.email)) {
      throw new Error("You cannot invite your own account as a representative.");
    }

    const priorRows = await sql<{
      id: string;
      status: string;
      expires_at: unknown;
    }>`
      select id, status, expires_at
      from portal_project_representatives
      where project_id = ${projectId} and lower(invite_email) = ${email}
        and status in ('pending', 'active')
      limit 1
    `;
    const prior = priorRows[0];
    if (
      prior?.status === "active" &&
      hasActiveCircleAccess(prior.status, iso(prior.expires_at) ?? "")
    ) {
      throw new Error("That person already has active access to this project.");
    }
    if (prior?.status === "active") {
      await sql`
        update portal_project_representatives
        set status = 'revoked', revoked_at = now()
        where id = ${prior.id} and status = 'active'
      `;
      await auditCircleEvent(sql, {
        projectId,
        representativeId: prior.id,
        actorUserId: context.userId,
        event: "expired",
        details: { email, actorEmail: context.email },
      });
    }

    const token = await newInviteToken();
    const tokenHash = await inviteDigest(token);
    let representativeId = prior?.status === "pending" ? prior.id : null;
    if (representativeId) {
      const [resent] = await sql<{ id: string }>`
        update portal_project_representatives
        set owner_user_id = ${context.userId}, token_hash = ${tokenHash},
          invited_by = ${context.userId}, created_at = now(),
          expires_at = now() + (${PROJECT_CIRCLE_INVITE_DAYS} * interval '1 day'),
          accepted_at = null, revoked_at = null
        where id = ${representativeId} and status = 'pending'
        returning id
      `;
      if (!resent) throw new Error("That invitation changed. Refresh and try again.");
    } else {
      const [created] = await sql<{ id: string }>`
        insert into portal_project_representatives (
          project_id, owner_user_id, invite_email, token_hash, invited_by, expires_at
        ) values (
          ${projectId}, ${context.userId}, ${email}, ${tokenHash}, ${context.userId},
          now() + (${PROJECT_CIRCLE_INVITE_DAYS} * interval '1 day')
        )
        returning id
      `;
      if (!created) throw new Error("Could not create the project invitation.");
      representativeId = created.id;
    }
    const [invite] = await sql<{ expires_at: unknown }>`
      select expires_at from portal_project_representatives where id = ${representativeId}
    `;
    await auditCircleEvent(sql, {
      projectId,
      representativeId,
      actorUserId: context.userId,
      event: prior?.status === "pending" ? "resent" : "invited",
      details: { email, actorEmail: context.email },
    });
    return {
      ok: true as const,
      token,
      email,
      expiresAt: iso(invite?.expires_at) ?? "",
      inviteDays: PROJECT_CIRCLE_INVITE_DAYS,
    };
  });

export const revokeProjectRepresentative = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1), representativeId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const projectId = await requireOwnedProject(sql, context.userId, data.projectId);
    const [representative] = await sql<{ id: string; invite_email: string }>`
      update portal_project_representatives
      set status = 'revoked', revoked_at = now(), token_hash = null
      where id = ${data.representativeId} and project_id = ${projectId}
        and status in ('pending', 'active')
      returning id, invite_email
    `;
    if (!representative) throw new Error("That representative is no longer active.");
    await auditCircleEvent(sql, {
      projectId,
      representativeId: representative.id,
      actorUserId: context.userId,
      event: "revoked",
      details: { email: representative.invite_email, actorEmail: context.email },
    });
    return { ok: true as const };
  });

const CircleTokenInput = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "That invitation link is invalid."),
});

async function findMatchingInvite(
  sql: Sql,
  token: string,
  actor: CircleActor,
): Promise<RepresentativeRow> {
  const tokenHash = await inviteDigest(token);
  const [invite] = await sql<RepresentativeRow>`
    select r.id, r.project_id, r.owner_user_id, r.invite_email,
      r.representative_user_id, r.status, r.invited_by,
      r.created_at, r.expires_at, r.accepted_at, r.revoked_at
    from portal_project_representatives r
    join portal_projects p on p.id = r.project_id
    where r.token_hash = ${tokenHash} and r.status = 'pending'
      and r.expires_at > now() and p.deleted_at is null
    and p.user_id = r.owner_user_id
    and p.lifecycle_state not in ('closed', 'archived')
    limit 1
  `;
  if (
    !invite ||
    invite.owner_user_id === actor.userId ||
    !canAcceptCircleInvite({
      status: invite.status,
      expiresAt: iso(invite.expires_at) ?? "",
      inviteEmail: invite.invite_email,
      sessionEmail: actor.email,
      emailVerified: actor.emailVerified,
    })
  ) {
    throw new Error(
      "This invitation is invalid or expired, or you are not signed in with its verified email address.",
    );
  }
  return invite;
}

export const getProjectCircleInvite = createServerFn({ method: "GET" })
  .validator(CircleTokenInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const invite = await findMatchingInvite(sql, data.token, context);
    const [project] = await sql<{ title: string; reference: string }>`
      select title, reference from portal_projects where id = ${invite.project_id}
    `;
    if (!project) throw new Error("Project not found.");
    return {
      email: invite.invite_email,
      projectTitle: project.title,
      reference: project.reference,
      expiresAt: iso(invite.expires_at) ?? "",
    };
  });

export const acceptProjectCircleInvite = createServerFn({ method: "POST" })
  .validator(CircleTokenInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const invite = await findMatchingInvite(sql, data.token, context);
    const [existingAccess] = await sql<{ id: string; expires_at: unknown }>`
      select id, expires_at from portal_project_representatives
      where project_id = ${invite.project_id}
        and representative_user_id = ${context.userId} and status = 'active'
      limit 1
    `;
    if (existingAccess && hasActiveCircleAccess("active", iso(existingAccess.expires_at) ?? "")) {
      throw new Error("Your account already has access to this project.");
    }
    if (existingAccess) {
      const [expired] = await sql<{ id: string; invite_email: string }>`
        update portal_project_representatives
        set status = 'revoked', revoked_at = now(), token_hash = null
        where id = ${existingAccess.id} and status = 'active'
        returning id, invite_email
      `;
      if (expired) {
        await auditCircleEvent(sql, {
          projectId: invite.project_id,
          representativeId: expired.id,
          actorUserId: context.userId,
          event: "expired",
          details: { email: expired.invite_email, actorEmail: context.email },
        });
      }
    }
    const [accepted] = await sql<{ id: string }>`
      update portal_project_representatives
      set status = 'active', representative_user_id = ${context.userId},
        token_hash = null, accepted_at = now(),
        expires_at = now() + (${PROJECT_CIRCLE_ACCESS_DAYS} * interval '1 day')
      where id = ${invite.id} and status = 'pending'
        and lower(invite_email) = ${normaliseCircleEmail(context.email)}
        and expires_at > now()
      returning id
    `;
    if (!accepted) throw new Error("This invitation was already used or has expired.");
    await auditCircleEvent(sql, {
      projectId: invite.project_id,
      representativeId: invite.id,
      actorUserId: context.userId,
      event: "accepted",
      details: { email: invite.invite_email, actorEmail: context.email },
    });
    return {
      ok: true as const,
      projectId: invite.project_id,
      accessDays: PROJECT_CIRCLE_ACCESS_DAYS,
    };
  });

const SuggestDecisionInput = z.object({
  projectId: z.string().min(1),
  decisionId: z.string().min(1),
  option: z.string().trim().min(1).max(200),
  note: z.string().trim().max(500).default(""),
});

export const suggestProjectDecision = createServerFn({ method: "POST" })
  .validator(SuggestDecisionInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const representative = await requireRepresentative(sql, context.userId, data.projectId);
    const [decision] = await sql<{ title: string; options: unknown; state: string }>`
      select title, options, state from portal_decisions
      where id = ${data.decisionId} and project_id = ${data.projectId} limit 1
    `;
    if (!decision || decision.state === "decided") {
      throw new Error("That decision is no longer open.");
    }
    const options = jsonArray(decision.options).map(String);
    if (!options.includes(data.option)) throw new Error("Choose one of the listed options.");

    const [suggestion] = await sql<{ id: string }>`
      insert into portal_decision_suggestions (
        project_id, representative_id, decision_id, suggested_option, note
      ) values (
        ${data.projectId}, ${representative.id}, ${data.decisionId}, ${data.option}, ${data.note}
      )
      on conflict (project_id, decision_id, representative_id) where status = 'pending'
      do update set suggested_option = excluded.suggested_option,
        note = excluded.note, updated_at = now()
      returning id
    `;
    if (!suggestion) throw new Error("Could not record your suggestion.");
    await auditCircleEvent(sql, {
      projectId: data.projectId,
      representativeId: representative.id,
      actorUserId: context.userId,
      event: "decision_suggested",
      details: { decision: decision.title, option: data.option, actorEmail: context.email },
    });
    await sql`
      insert into portal_activity (project_id, kind, title, body)
      values (
        ${data.projectId}, 'decision', 'Project representative suggested a decision',
        ${`${decision.title}: ${data.option}${data.note ? `. ${data.note}` : ""}`}
      )
    `;
    await notify({
      projectId: data.projectId,
      kind: "decision",
      title: "Project representative shared decision input",
      body: `${decision.title}: ${data.option}. The owner must confirm any final decision.`,
      audience: "client",
    });
    return { ok: true as const, suggestionId: suggestion.id };
  });

const ReviewSuggestionInput = z.object({
  projectId: z.string().min(1),
  suggestionId: z.string().min(1),
  decision: z.enum(["confirm", "dismiss"]),
  chosenOption: z.string().trim().max(200).optional(),
});

export const reviewProjectDecisionSuggestion = createServerFn({ method: "POST" })
  .validator(ReviewSuggestionInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const projectId = await requireOwnedProject(sql, context.userId, data.projectId);
    const [suggestion] = await sql<{
      id: string;
      decision_id: string;
      suggested_option: string;
      status: string;
    }>`
      select id, decision_id, suggested_option, status
      from portal_decision_suggestions
      where id = ${data.suggestionId} and project_id = ${projectId}
      limit 1
    `;
    if (!suggestion || suggestion.status !== "pending") {
      throw new Error("That suggestion has already been reviewed.");
    }
    if (data.decision === "confirm") {
      if (!data.chosenOption) throw new Error("Choose the owner's final decision.");
      await recordDecisionFor(sql, context.userId, {
        projectId,
        decisionId: suggestion.decision_id,
        choice: data.chosenOption,
      });
    }
    const nextStatus = data.decision === "confirm" ? "confirmed" : "dismissed";
    const [reviewed] = await sql<{ id: string }>`
      update portal_decision_suggestions
      set status = ${nextStatus}, reviewed_by = ${context.userId}, reviewed_at = now()
      where id = ${suggestion.id} and status = 'pending'
      returning id
    `;
    if (!reviewed) throw new Error("That suggestion changed while you were reviewing it.");
    await auditCircleEvent(sql, {
      projectId,
      representativeId: null,
      actorUserId: context.userId,
      event: data.decision === "confirm" ? "suggestion_confirmed" : "suggestion_dismissed",
      details: {
        option: data.chosenOption ?? suggestion.suggested_option,
        actorEmail: context.email,
      },
    });
    return { ok: true as const };
  });

const RequestVisitInput = z.object({
  projectId: z.string().min(1),
  proposedOn: z.string().refine(isDayInput, "Choose a real calendar date."),
  note: z.string().trim().max(300).default(""),
});

export const requestCircleVisit = createServerFn({ method: "POST" })
  .validator(RequestVisitInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const representative = await requireRepresentative(sql, context.userId, data.projectId);
    if (data.proposedOn <= siteDay(new Date().toISOString())) {
      throw new Error("Choose a future visit date in Nairobi time.");
    }
    const [open] = await sql<{ id: string }>`
      select id from portal_presence
      where project_id = ${data.projectId} and kind = 'visit' and status = 'requested'
      limit 1
    `;
    if (open) throw new Error("A site-visit request is already waiting for the studio.");
    const [request] = await sql<{ id: string }>`
      insert into portal_presence (
        project_id, kind, requested_by, client_note, proposed_on
      ) values (
        ${data.projectId}, 'visit', ${context.userId},
        ${data.note}, ${data.proposedOn}
      )
      returning id
    `;
    if (!request) throw new Error("Could not submit the visit request.");
    await auditCircleEvent(sql, {
      projectId: data.projectId,
      representativeId: representative.id,
      actorUserId: context.userId,
      event: "visit_requested",
      details: { proposedOn: data.proposedOn, actorEmail: context.email },
    });
    await notify({
      projectId: data.projectId,
      kind: "presence",
      title: "Project representative requested a site visit",
      body: data.note || `A representative requested a visit on ${data.proposedOn}.`,
      audience: "studio",
    });
    return { ok: true as const, requestId: request.id };
  });
