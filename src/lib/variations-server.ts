// Variations, on both sides of the portal.
//
// The one rule this file exists to keep: **the contract sum moves only when
// the client approves a price.** Raising, pricing and withdrawing write to the
// variation row and nothing else; approval updates the project in the same
// statement, so the price and the sum can never disagree because something
// failed halfway.
//
// Two refusal points are enforced here rather than hidden in a disabled
// button: the transition table (only the client decides money, and a settled
// variation stays settled) and the withdrawal reason — a change that vanishes
// without an explanation is how a client stops believing the record.
//
// A client writes only on a project they own — row → project → user_id.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireStaff } from "@/lib/staff-session.server";
import { getSql, type Sql } from "@/lib/db";
import { notify } from "@/lib/notify";
import {
  canTransition,
  daysLabel,
  signedKes,
  statusLabel,
  validateVariation,
  type Variation,
  type VariationStatus,
} from "@/lib/variations";

const today = () => new Date().toISOString().slice(0, 10);

const toVariation = (r: Record<string, unknown>): Variation => ({
  id: String(r.id),
  projectId: String(r.project_id),
  ord: Number(r.ord ?? 0),
  title: String(r.title ?? ""),
  detail: String(r.detail ?? ""),
  reason: String(r.reason ?? ""),
  sourceKind: String(r.source_kind ?? "studio") === "selection" ? "selection" : "studio",
  sourceId: r.source_id ? String(r.source_id) : null,
  amount: Number(r.amount ?? 0),
  days: Number(r.days ?? 0),
  status: String(r.status ?? "proposed") as VariationStatus,
  proposedOn: String(r.proposed_on ?? ""),
  decidedOn: String(r.decided_on ?? ""),
  decisionNote: String(r.decision_note ?? ""),
  decidedBy: ["client", "studio"].includes(String(r.decided_by ?? ""))
    ? (String(r.decided_by) as "client" | "studio")
    : "",
  updatedAt: r.updated_at ? String(r.updated_at) : "",
});

async function nextOrd(sql: Sql, projectId: string): Promise<number> {
  const [n] = await sql<{ n: number }>`
    select coalesce(max(ord), 0)::int as n from portal_variation where project_id = ${projectId}
  `;
  return Number(n?.n ?? 0) + 1;
}

/* ── client ── */

export const listMyVariations = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<Variation[]> => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");
    const rows = await sql<Record<string, unknown>>`
      select id, project_id, ord, title, detail, reason, source_kind, source_id,
        amount, days, status, proposed_on, decided_on, decision_note, decided_by, updated_at
      from portal_variation
      where project_id = ${data.projectId}
      order by ord desc
    `;
    return rows.map(toVariation);
  });

/**
 * The client approves or declines the price put to them.
 *
 * Approval is one statement with a CTE: the variation settles and the project's
 * contract value moves together, or neither does. If the row was settled by a
 * concurrent request the statement matches nothing and the caller is told the
 * change is already settled — never a half-amended contract.
 */
export const decideVariation = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      variationId: z.string().min(1),
      accept: z.boolean(),
      note: z.string().max(400).optional().default(""),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");

    const [row] = await sql<{ status: VariationStatus; title: string; amount: number }>`
      select status, title, amount from portal_variation
      where id = ${data.variationId} and project_id = ${data.projectId}
    `;
    if (!row) throw new Error("That change is not on this project.");

    const to: VariationStatus = data.accept ? "approved" : "declined";
    if (!canTransition(row.status, to, "client")) {
      throw new Error(
        row.status === "proposed"
          ? "Only the studio can withdraw a proposed change."
          : `That change was already ${statusLabel(row.status).toLowerCase()}.`,
      );
    }

    const note = data.note.trim();
    if (data.accept) {
      const settled = await sql`
        with changed as (
          update portal_variation
          set status = 'approved', decided_on = ${today()}, decided_by = 'client',
              decision_note = ${note}, updated_at = now()
          where id = ${data.variationId}
            and project_id = ${data.projectId}
            and status = 'proposed'
          returning amount
        )
        update portal_projects p
        set contract_value = p.contract_value + c.amount, updated_at = now()
        from changed c
        where p.id = ${data.projectId}
        returning p.id
      `;
      if (settled.length === 0) throw new Error("That change has already been settled.");
    } else {
      await sql`
        update portal_variation
        set status = 'declined', decided_on = ${today()}, decided_by = 'client',
            decision_note = ${note}, updated_at = now()
        where id = ${data.variationId}
          and project_id = ${data.projectId}
          and status = 'proposed'
      `;
    }

    await notify({
      projectId: data.projectId,
      kind: "variation",
      title: `${data.accept ? "Approved" : "Declined"}: ${row.title}`,
      body: note || `${signedKes(Number(row.amount))} ${data.accept ? "added to" : "kept out of"} the contract.`,
      // The client is the one who decided, so the studio is the one who needs
      // telling. Without an explicit audience this notified the client about
      // their own choice and the studio heard nothing — a decision that moves
      // money sat unseen until someone opened the console.
      audience: "studio",
    });

    return { ok: true as const };
  });

/* ── studio ── */

export const readVariationsForStaff = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }): Promise<Variation[]> => {
    await requireStaff();
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select id, project_id, ord, title, detail, reason, source_kind, source_id,
        amount, days, status, proposed_on, decided_on, decision_note, decided_by, updated_at
      from portal_variation
      where project_id = ${data.projectId}
      order by ord desc
    `;
    return rows.map(toVariation);
  });

const RaiseInput = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(400),
  detail: z.string().max(2000).optional().default(""),
  reason: z.string().max(600).optional().default(""),
  amount: z.number().int(),
  days: z.number().int().optional().default(0),
  sourceKind: z.enum(["selection", "studio"]).optional().default("studio"),
  sourceId: z.string().max(60).optional().default(""),
});

/**
 * Put a priced change to the client.
 *
 * Raised from a choice or from the studio, the price lands with the client and
 * the contract stays exactly where it was until they answer. A selection link
 * is verified against the same project, so "from your choice" can never point
 * at another client's selection.
 */
export const raiseVariation = createServerFn({ method: "POST" })
  .validator(RaiseInput)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const [project] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId}
    `;
    if (!project) throw new Error("Project not found.");

    const checked = validateVariation({
      title: data.title,
      amount: data.amount,
      days: data.days,
    });
    if (!checked.ok) throw new Error(checked.reason);

    let sourceId: string | null = null;
    if (data.sourceKind === "selection" && data.sourceId) {
      const [sel] = await sql<{ id: string }>`
        select id from portal_selection
        where id = ${data.sourceId} and project_id = ${data.projectId}
      `;
      if (!sel) throw new Error("That selection is not on this project.");
      sourceId = sel.id;
    }

    const ord = await nextOrd(sql, data.projectId);
    await sql`
      insert into portal_variation (
        project_id, ord, title, detail, reason, source_kind, source_id,
        amount, days, status, proposed_on, decided_by
      ) values (
        ${data.projectId}, ${ord}, ${checked.title}, ${data.detail.trim()},
        ${data.reason.trim()}, ${sourceId ? "selection" : "studio"}, ${sourceId},
        ${data.amount}, ${data.days}, 'proposed', ${today()}, ''
      )
    `;

    const impact = [
      signedKes(data.amount),
      ...(data.days ? [daysLabel(data.days)] : []),
    ].join(" · ");
    await notify({
      projectId: data.projectId,
      kind: "variation",
      title: `Variation to approve: ${checked.title}`,
      body: `${impact} — ${data.reason.trim().slice(0, 140) || "for your approval before it is committed."}`,
      audience: "client",
    });

    return { ok: true as const };
  });

/**
 * Recall a proposed change before the client has answered.
 *
 * The reason is checked here because this is the move a client feels: a price
 * they were about to approve disappearing. "Repriced" is an answer; silence is
 * not.
 */
export const withdrawVariation = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      variationId: z.string().min(1),
      reason: z.string().max(300).optional().default(""),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();

    const [row] = await sql<{ status: VariationStatus; title: string }>`
      select status, title from portal_variation
      where id = ${data.variationId} and project_id = ${data.projectId}
    `;
    if (!row) throw new Error("That change is not on this project.");
    if (!canTransition(row.status, "withdrawn", "studio")) {
      throw new Error(
        row.status === "proposed"
          ? "Only the client can decide a proposed change — it can no longer be withdrawn."
          : `That change was already ${statusLabel(row.status).toLowerCase()}.`,
      );
    }

    const reason = data.reason.trim();
    if (reason.length < 5) {
      throw new Error("Say why it is being withdrawn — the client reads this.");
    }

    await sql`
      update portal_variation
      set status = 'withdrawn', decided_on = ${today()}, decided_by = 'studio',
          decision_note = ${reason}, updated_at = now()
      where id = ${data.variationId}
        and project_id = ${data.projectId}
        and status = 'proposed'
    `;

    await notify({
      projectId: data.projectId,
      kind: "variation",
      title: `Withdrawn: ${row.title}`,
      body: reason,
      audience: "client",
    });

    return { ok: true as const };
  });

/**
 * Proposed changes across every project — the studio overview's "money waiting
 * on a client" list. Age runs from the day the price went out, because that is
 * how long the client has been sitting on it.
 */
export async function proposedVariations(sql: Sql): Promise<
  { projectId: string; reference: string; title: string; variationTitle: string; amount: number; age: number }[]
> {
  const rows = await sql<Record<string, unknown>>`
    select v.project_id, p.reference, p.title, v.title as variation_title, v.amount,
      floor(extract(epoch from (
        now() - coalesce(nullif(v.proposed_on, '')::date, v.created_at::date)::timestamptz
      )) / 86400) as age
    from portal_variation v
    join portal_projects p on p.id = v.project_id
    where v.status = 'proposed'
    order by v.project_id, v.ord
  `;
  return rows.map((r) => ({
    projectId: String(r.project_id),
    reference: String(r.reference ?? ""),
    title: String(r.title ?? ""),
    variationTitle: String(r.variation_title ?? ""),
    amount: Number(r.amount ?? 0),
    age: Number(r.age ?? 0),
  }));
}