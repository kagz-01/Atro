// Selections: the priced choice, on both sides of the portal.
//
// Scoping is the same rule as the rest of the per-user data: the client's writes
// are proven by walking selection -> project -> user_id, never by a client-supplied
// project id, and the studio's functions are staff-gated.
//
// The two functions that matter for money are `chooseOption` and
// `priceSelection`: one records the client's decision, the other lets the studio
// put a figure on the excess. Neither edits the contract sum. A contract only
// moves when a variation is raised, priced and approved, because that is the
// moment a human is accountable for it.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireStaff } from "@/lib/staff-session.server";
import { getSql, type Sql } from "@/lib/db";
import { canChoose, type Selection, type SelectionOption } from "@/lib/selections";
import { notify } from "@/lib/notify";

/* ── shared reading ── */

const toOption = (r: Record<string, unknown>): SelectionOption => ({
  id: String(r.id),
  label: String(r.label ?? ""),
  description: String(r.description ?? ""),
  supplier: String(r.supplier ?? ""),
  price: Number(r.price ?? 0),
  leadTime: String(r.lead_time ?? ""),
  recommended: r.recommended === true,
});

/** Read a project's selections, oldest first, with their options attached. */
export async function readSelections(sql: Sql, projectId: string): Promise<Selection[]> {
  const rows = await sql<Record<string, unknown>>`
    select id, ord, title, category, stage, allowance_amount, deadline, status,
      chosen_option_id, chosen_at, chosen_by, note
    from portal_selection
    where project_id = ${projectId}
    order by ord
  `;
  if (rows.length === 0) return [];

  const optionRows = await sql<Record<string, unknown>>`
    select o.id, o.selection_id, o.ord, o.label, o.description, o.supplier,
      o.price, o.lead_time, o.recommended
    from portal_selection_option o
    join portal_selection s on s.id = o.selection_id
    where s.project_id = ${projectId}
    order by o.ord
  `;

  const bySelection = new Map<string, SelectionOption[]>();
  for (const r of optionRows) {
    const key = String(r.selection_id);
    const list = bySelection.get(key) ?? [];
    list.push(toOption(r));
    bySelection.set(key, list);
  }

  return rows.map((r) => ({
    id: String(r.id),
    ord: Number(r.ord ?? 0),
    title: String(r.title ?? ""),
    category: String(r.category ?? ""),
    stage: String(r.stage ?? ""),
    allowance: Number(r.allowance_amount ?? 0),
    deadline: String(r.deadline ?? ""),
    status: String(r.status ?? "open") as Selection["status"],
    note: String(r.note ?? ""),
    options: bySelection.get(String(r.id)) ?? [],
    chosenOptionId: r.chosen_option_id ? String(r.chosen_option_id) : null,
    chosenAt: r.chosen_at ? String(r.chosen_at) : null,
    chosenBy: String(r.chosen_by ?? ""),
  }));
}

/** Confirm the signed-in client really owns this selection. */
async function ownedSelection(
  sql: Sql,
  userId: string,
  selectionId: string,
): Promise<{ projectId: string; title: string; ord: number; deadline: string; status: string }> {
  const [r] = await sql<{
    project_id: string;
    title: string;
    ord: number;
    deadline: string;
    status: string;
  }>`
    select s.project_id, s.title, s.ord, s.deadline, s.status
    from portal_selection s
    join portal_projects p on p.id = s.project_id
    where s.id = ${selectionId} and p.user_id = ${userId}
  `;
  if (!r) throw new Error("That selection is not on your project.");
  return {
    projectId: r.project_id,
    title: r.title,
    ord: Number(r.ord ?? 0),
    deadline: String(r.deadline ?? ""),
    status: String(r.status ?? "open"),
  };
}

/* ── client ── */

export const listMySelections = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");
    return readSelections(sql, data.projectId);
  });

/**
 * Record the client's choice.
 *
 * The option is re-read inside the write rather than trusted from the request, so
 * the price in the decision log is the price the studio published. A client
 * cannot post a cheaper number for a dearer item.
 */
export const chooseSelectionOption = createServerFn({ method: "POST" })
  .validator(
    z.object({
      selectionId: z.string().min(1),
      optionId: z.string().min(1),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const sel = await ownedSelection(sql, context.userId, data.selectionId);

    const gate = canChoose(
      { status: sel.status as Selection["status"], deadline: sel.deadline },
      new Date(),
    );
    if (!gate.ok) throw new Error(gate.reason);

    const [option] = await sql<{ id: string; label: string; price: number }>`
      select id, label, price from portal_selection_option
      where id = ${data.optionId} and selection_id = ${data.selectionId}
    `;
    if (!option) throw new Error("That option is not on this selection.");

    const [head] = await sql<{ allowance_amount: number }>`
      select allowance_amount from portal_selection where id = ${data.selectionId}
    `;
    const delta = Number(option.price) - Number(head?.allowance_amount ?? 0);

    await sql`
      update portal_selection
      set status = 'chosen',
          chosen_option_id = ${option.id},
          chosen_at = now(),
          chosen_by = ${context.userId}
      where id = ${data.selectionId}
    `;

    // The decision log is the contractual record. A choice belongs in it whether
    // or not it costs anything, with the difference to the allowance as the
    // figure that will be argued about later.
    await sql`
      insert into portal_decisions (project_id, ord, date, title, detail, options, chosen, cost_impact, state, created_at, decided_at)
      values (
        ${sel.projectId},
        ${900 + sel.ord},
        ${new Date().toISOString().slice(0, 10)},
        ${sel.title},
        ${delta > 0
          ? `Chosen above the allowance by KES ${delta.toLocaleString("en-KE")}. To be priced as a variation.`
          : "Chosen within the allowance."},
        ${JSON.stringify([option.label])}::jsonb,
        ${option.label},
        ${delta},
        'decided',
        now(),
        now()
      )
    `;

    await sql`
      insert into portal_activity (project_id, kind, title, body)
      values (
        ${sel.projectId},
        'decision',
        ${`${sel.title} chosen`},
        ${`${option.label}${delta > 0 ? ` — KES ${delta.toLocaleString("en-KE")} over the allowance, pending a variation.` : ""}`}
      )
    `;

    // A choice above the allowance is a variation the studio has to price, so
    // they are told either way — "within the allowance" is still news that the
    // selection can be closed and the order placed.
    await notify({
      projectId: sel.projectId,
      kind: "selection",
      title: `${sel.title} chosen`,
      body: delta > 0
        ? `${option.label} — KES ${delta.toLocaleString("en-KE")} over the allowance. Price it as a variation.`
        : `${option.label} — within the allowance.`,
      audience: "studio",
    });

    return { ok: true as const, delta };
  });

/* ── studio ── */

const OptionInput = z.object({
  label: z.string().min(1).max(120),
  description: z.string().max(600).optional().default(""),
  supplier: z.string().max(120).optional().default(""),
  price: z.number().int().min(0).max(2_000_000_000),
  leadTime: z.string().max(80).optional().default(""),
  recommended: z.boolean().optional().default(false),
});

export const createSelection = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      title: z.string().min(2).max(160),
      category: z.string().max(40).optional().default("Finish"),
      stage: z.string().max(40).optional().default(""),
      allowance: z.number().int().min(0).max(2_000_000_000).optional().default(0),
      deadline: z.string().max(40).optional().default(""),
      note: z.string().max(600).optional().default(""),
      options: z.array(OptionInput).min(1).max(6),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();

    const [existing] = await sql<{ n: number }>`
      select coalesce(max(ord), 0)::int as n from portal_selection where project_id = ${data.projectId}
    `;
    const ord = Number(existing?.n ?? 0) + 1;

    const [created] = await sql<{ id: string }>`
      insert into portal_selection (project_id, ord, title, category, stage, allowance_amount, deadline, note)
      values (${data.projectId}, ${ord}, ${data.title}, ${data.category}, ${data.stage}, ${data.allowance}, ${data.deadline}, ${data.note})
      returning id
    `;
    if (!created) throw new Error("Could not create that selection.");

    let optionOrd = 0;
    for (const o of data.options) {
      optionOrd += 1;
      await sql`
        insert into portal_selection_option (selection_id, ord, label, description, supplier, price, lead_time, recommended)
        values (${created.id}, ${optionOrd}, ${o.label}, ${o.description}, ${o.supplier}, ${o.price}, ${o.leadTime}, ${o.recommended})
      `;
    }

    return { ok: true as const, selectionId: created.id };
  });

/** Set the allowance — the number the whole conversation is measured against. */
export const setSelectionAllowance = createServerFn({ method: "POST" })
  .validator(
    z.object({
      selectionId: z.string().min(1),
      allowance: z.number().int().min(0).max(2_000_000_000),
      deadline: z.string().max(40).optional(),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    if (data.deadline !== undefined) {
      await sql`
        update portal_selection set allowance_amount = ${data.allowance}, deadline = ${data.deadline}
        where id = ${data.selectionId}
      `;
    } else {
      await sql`
        update portal_selection set allowance_amount = ${data.allowance} where id = ${data.selectionId}
      `;
    }
    return { ok: true as const };
  });

export const closeSelection = createServerFn({ method: "POST" })
  .validator(z.object({ selectionId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    await sql`
      update portal_selection set status = 'closed'
      where id = ${data.selectionId} and status = 'open'
    `;
    return { ok: true as const };
  });

/** The studio's read of a project's selections. Staff-gated. */
export const readSelectionsForStaff = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    return readSelections(await getSql(), data.projectId);
  });
