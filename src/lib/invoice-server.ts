// ATRO financial documents — issuing and reading.
//
// The paperwork follows the money: certifying a payment produces the certificate
// that authorises it, and releasing it produces the receipt. Neither depends on
// anyone remembering to press a button, and neither can be produced twice for
// the same payment (enforced by unique indexes, not by hope).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { COMPANY } from "@/lib/site";
import {
  formatNumber,
  renderHtml,
  renderText,
  sumLines,
  vatFor,
  type DocumentData,
  type DocumentKind,
  type Line,
} from "@/lib/invoices";

/* ── shape returned to the client ── */

export type DocumentSummary = {
  id: string;
  number: string;
  kind: DocumentKind;
  status: string;
  total: number;
  amountPaid: number;
  issuedAt: string;
  projectReference: string;
  projectTitle: string;
};

export type DocumentDetail = DocumentSummary & {
  bodyHtml: string;
  bodyText: string;
  narrative: string;
  issuedTo: string;
  issuedBy: string;
  voidedReason: string;
};

async function nextNumber(sql: Sql, kind: DocumentKind): Promise<string> {
  const seq = await sql.query<{ n: number }>(
    "select nextval('portal_invoice_seq')::bigint as n",
  );
  return formatNumber(kind, new Date().getFullYear(), Number(seq[0]?.n ?? 1));
}

type IssueInput = {
  projectId: string;
  kind: DocumentKind;
  lines: Line[];
  narrative: string;
  paymentId?: string | null;
  vatRate?: number;
  amountPaid?: number;
  issuedBy: string;
  issuedTo: string;
  /**
   * `invoice` (default) totals the lines. `summary` reports a position, so the
   * caller states the bottom line: summing report lines would produce a number
   * that means nothing.
   */
  layout?: "invoice" | "summary";
  /** Overrides the computed total. Required in practice for a summary. */
  subtotal?: number;
  total?: number;
  totalLabel?: string;
  paidLabel?: string;
};

export type IssuedDocument = { id: string; number: string };

/** Write the document and freeze its rendered body. Returns null if one already exists. */
export async function issueDocument(sql: Sql, input: IssueInput): Promise<IssuedDocument | null> {
  const project = await sql<{ reference: string; title: string }>`
    select reference, title from portal_projects where id = ${input.projectId} limit 1
  `;
  const proj = project[0];
  if (!proj) throw new Error("Project not found.");

  const layout = input.layout ?? "invoice";
  const vatRate = layout === "summary" ? 0 : (input.vatRate ?? 0);
  const subtotal = input.subtotal ?? sumLines(input.lines);
  const vatAmount = vatFor(subtotal, vatRate);
  const total = input.total ?? subtotal + vatAmount;
  const number = await nextNumber(sql, input.kind);

  const data: DocumentData = {
    number,
    kind: input.kind,
    issuedAt: new Date().toISOString(),
    issuedTo: input.issuedTo,
    issuedBy: input.issuedBy,
    projectReference: proj.reference,
    projectTitle: proj.title,
    narrative: input.narrative,
    lines: input.lines,
    subtotal,
    vatRate,
    vatAmount,
    total,
    amountPaid: input.amountPaid ?? 0,
    layout,
    totalLabel: input.totalLabel,
    paidLabel: input.paidLabel,
    currency: "KES",
  };

  try {
    const rows = await sql<{ id: string; number: string }>`
      insert into portal_invoice (
        project_id, payment_id, number, kind, lines, subtotal, vat_rate,
        vat_amount, total, amount_paid, narrative, issued_to, issued_by,
        body_html, body_text, issued_at
      ) values (
        ${input.projectId}, ${input.paymentId ?? null}, ${number}, ${input.kind},
        ${JSON.stringify(input.lines)}, ${subtotal}, ${vatRate}, ${vatAmount},
        ${total}, ${input.amountPaid ?? 0}, ${input.narrative},
        ${input.issuedTo}, ${input.issuedBy}, ${renderHtml(data)}, ${renderText(data)},
        now()
      )
      returning id, number
    `;
    const row = rows[0];
    return row ? { id: row.id, number: row.number } : null;
  } catch (err) {
    // The unique indexes make a duplicate certificate/receipt impossible; treat
    // that as "already issued" rather than an error the caller has to handle.
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("portal_invoice_certificate_once") || message.includes("portal_invoice_receipt_once")) {
      return null;
    }
    throw err;
  }
}

const money = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

/** Issued by the studio when a quantity surveyor certifies a stage. */
export async function issueCertificateFor(
  sql: Sql,
  staffEmail: string,
  args: { projectId: string; paymentId: string; label: string; certificate: string; amount: number },
): Promise<IssuedDocument | null> {
  const project = await sql<{ client_label: string }>`
    select client_label from portal_projects where id = ${args.projectId} limit 1
  `;
  return issueDocument(sql, {
    projectId: args.projectId,
    paymentId: args.paymentId,
    kind: "certificate",
    issuedTo: project[0]?.client_label || "Client",
    issuedBy: staffEmail,
    narrative: `Certified under ${args.certificate} for work completed and inspected. This certificate authorises the release of ${money(args.amount)}. Retention held against defects is not included and is not payable until the defects liability period closes.`,
    lines: [
      {
        description: args.label,
        amount: args.amount,
      },
    ],
  });
}

/** Issued to the client the moment they release a certified payment. */
export async function issueReceiptFor(
  sql: Sql,
  args: { projectId: string; paymentId: string; label: string; certificate: string; amount: number },
): Promise<IssuedDocument | null> {
  const project = await sql<{ client_label: string }>`
    select client_label from portal_projects where id = ${args.projectId} limit 1
  `;
  return issueDocument(sql, {
    projectId: args.projectId,
    paymentId: args.paymentId,
    kind: "receipt",
    issuedTo: project[0]?.client_label || "Client",
    issuedBy: COMPANY.name,
    narrative: `Received against certificate ${args.certificate} for ${args.label}. Quote this receipt number when corresponding.`,
    lines: [{ description: args.label, amount: args.amount }],
    amountPaid: args.amount,
  });
}

/** A running position, issued on request by the studio. */
export async function issueStatementFor(
  sql: Sql,
  staffEmail: string,
  projectId: string,
): Promise<IssuedDocument | null> {
  const project = await sql<{
    reference: string;
    title: string;
    client_label: string;
    contract_value: number;
    paid_to_date: number;
    currently_certified: number;
    retention_held: number;
    retention_pct: number;
  }>`
    select reference, title, client_label, contract_value, paid_to_date,
      currently_certified, retention_held, retention_pct
    from portal_projects where id = ${projectId} limit 1
  `;
  const p = project[0];
  if (!p) throw new Error("Project not found.");

  // These are positions, not charges. They are never added together: the
  // contract value is not money owed, it is the ceiling.
  const contractValue = Number(p.contract_value);
  const paid = Number(p.paid_to_date);
  const awaiting = Number(p.currently_certified);
  const retention = Number(p.retention_held);
  const spentCommitted = paid + awaiting + retention;
  const remaining = Math.max(0, contractValue - spentCommitted);

  const lines: Line[] = [
    { description: "Contract value (priced bill of quantities)", amount: contractValue },
    { description: "Paid to date", amount: paid },
    { description: "Certified and awaiting your release", amount: awaiting },
    { description: "Retention held against defects", amount: retention },
    { description: "Still to be spent against the contract", amount: remaining },
  ];

  return issueDocument(sql, {
    projectId,
    kind: "statement",
    layout: "summary",
    totalLabel: "Outstanding balance",
    paidLabel: "Paid to date",
    issuedTo: p.client_label || "Client",
    issuedBy: staffEmail,
    narrative:
      "The position on your project as at the date of this statement. It is a record, not a demand for payment. The outstanding balance is the amount certified and waiting for your release.",
    lines,
    // The only figure a statement may call a balance is what is actually owed.
    subtotal: awaiting,
    total: awaiting,
    amountPaid: paid,
  });
}

/* ── reads ── */

function toSummary(row: Record<string, unknown>): DocumentSummary {
  return {
    id: String(row.id),
    number: String(row.number),
    kind: row.kind as DocumentKind,
    status: String(row.status),
    total: Number(row.total ?? 0),
    amountPaid: Number(row.amount_paid ?? 0),
    issuedAt: new Date(String(row.issued_at ?? row.created_at)).toISOString(),
    projectReference: String(row.reference ?? ""),
    projectTitle: String(row.title ?? ""),
  };
}

export const listMyDocuments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql`
      select d.id, d.number, d.kind, d.status, d.total, d.amount_paid, d.issued_at,
        p.reference, p.title
      from portal_invoice d
      join portal_projects p on p.id = d.project_id
      where p.user_id = ${context.userId}
      order by d.issued_at desc limit 100
    `;
    return rows.map(toSummary);
  });

export const getMyDocument = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<DocumentDetail | null> => {
    const sql = await getSql();
    const rows = await sql`
      select d.id, d.number, d.kind, d.status, d.total, d.amount_paid, d.issued_at,
        d.body_html, d.body_text, d.narrative, d.issued_to, d.issued_by,
        d.voided_reason, p.reference, p.title
      from portal_invoice d
      join portal_projects p on p.id = d.project_id
      where d.id = ${data.id} and p.user_id = ${context.userId}
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      ...toSummary(row as Record<string, unknown>),
      bodyHtml: String(row.body_html),
      bodyText: String(row.body_text),
      narrative: String(row.narrative),
      issuedTo: String(row.issued_to),
      issuedBy: String(row.issued_by),
      voidedReason: String(row.voided_reason),
    };
  });

/** The studio's view of a project's documents. */
export const listProjectDocuments = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff-session.server");
    const staff = await requireStaff();
    const sql = await getSql();
    const rows = await sql`
      select d.id, d.number, d.kind, d.status, d.total, d.amount_paid, d.issued_at,
        d.voided_reason, p.reference, p.title
      from portal_invoice d
      join portal_projects p on p.id = d.project_id
      where d.project_id = ${data.projectId}
      order by d.issued_at desc
    `;
    void staff;
    return rows.map((row) => ({
      ...toSummary(row as Record<string, unknown>),
      voidedReason: String(row.voided_reason ?? ""),
    }));
  });

export const issueStatement = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff-session.server");
    const staff = await requireStaff();
    const sql = await getSql();
    const issued = await issueStatementFor(sql, staff.email, data.projectId);
    if (!issued) throw new Error("Could not issue the statement.");
    return issued;
  });

/** A void never edits history — the document stays, marked, and a new one is issued. */
export const voidDocument = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1), reason: z.string().trim().min(3).max(200) }))
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff-session.server");
    const staff = await requireStaff();
    const sql = await getSql();
    const rows = await sql<{ id: string }>`
      update portal_invoice
      set status = 'void', voided_reason = ${data.reason}
      where id = ${data.id} and status = 'issued'
      returning id
    `;
    if (!rows[0]) throw new Error("That document is already void or does not exist.");
    return { ok: true as const, by: staff.email };
  });