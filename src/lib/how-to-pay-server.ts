// How to pay: reading and writing the studio's two account sheets.
//
// One row per (project, kind) — `local` for a client in the country,
// `international` for one abroad — entered as prose in the console (the
// details follow the studio's bankers, not a form) and read back through the
// two doors this app always uses: the client's own project by user_id, and
// the console behind requireStaff.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireStaff } from "@/lib/staff-session.server";
import { getSql, type Sql } from "@/lib/db";
import type { PaymentInstructions } from "@/lib/how-to-pay";

async function loadInstructions(sql: Sql, projectId: string): Promise<PaymentInstructions> {
  const rows = await sql<{ kind: string; body: string }>`
    select kind, body from portal_payment_instructions where project_id = ${projectId}
  `;
  return {
    local: rows.find((r) => r.kind === "local")?.body ?? "",
    international: rows.find((r) => r.kind === "international")?.body ?? "",
  };
}

/**
 * The client's own project only — joined through user_id, like every client
 * read: a signed-in client cannot open another project's instructions by
 * guessing an id.
 */
export const getMyHowToPay = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const rows = await sql<{ kind: string; body: string }>`
      select i.kind, i.body
      from portal_payment_instructions i
      join portal_projects p on p.id = i.project_id
      where i.project_id = ${data.projectId} and p.user_id = ${context.userId}
    `;
    return {
      local: rows.find((r) => r.kind === "local")?.body ?? "",
      international: rows.find((r) => r.kind === "international")?.body ?? "",
    };
  });

/** Both halves, for the console form. */
export const getPaymentInstructions = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    return loadInstructions(await getSql(), data.projectId);
  });

const SaveInstructions = z.object({
  projectId: z.string().min(1),
  local: z.string().trim().max(2000).default(""),
  international: z.string().trim().max(2000).default(""),
});

/**
 * Upsert both halves; an emptied box deletes its row, so the portal panel
 * disappears again rather than showing an account the studio retired.
 */
export const savePaymentInstructions = createServerFn({ method: "POST" })
  .validator(SaveInstructions)
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    for (const kind of ["local", "international"] as const) {
      const body = data[kind];
      if (!body) {
        await sql`
          delete from portal_payment_instructions
          where project_id = ${data.projectId} and kind = ${kind}
        `;
      } else {
        await sql`
          insert into portal_payment_instructions (project_id, kind, body, updated_at)
          values (${data.projectId}, ${kind}, ${body}, now())
          on conflict (project_id, kind)
            do update set body = excluded.body, updated_at = now()
        `;
      }
    }
    return { ok: true as const };
  });
