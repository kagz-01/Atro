// ATRO financial documents — issuing and reading.
//
// The paperwork follows the money: confirming a project stage produces its
// payment request (and, for measured construction work, its certificate).
// Settlement produces the receipt. Unique indexes prevent duplicate records.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { accountMiddleware, authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { COMPANY } from "@/lib/site";
import { usesMeasuredWorkCertification } from "@/lib/diaspora/tracks";
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
  validUntil: string | null;
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
  projectId?: string;
  enquiryId?: string;
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
  validUntil?: string;
  etimsReference?: string;
};

export type IssuedDocument = { id: string; number: string };

/** Write the document and freeze its rendered body. Returns null if one already exists. */
export async function issueDocument(sql: Sql, input: IssueInput): Promise<IssuedDocument | null> {
  if (Boolean(input.projectId) === Boolean(input.enquiryId)) {
    throw new Error("A document must belong to exactly one project or enquiry.");
  }
  if (input.kind === "invoice" && !input.etimsReference?.trim()) {
    throw new Error("A tax invoice requires its eTIMS control reference.");
  }

  const project = input.projectId
    ? await sql<{ reference: string; title: string }>`
        select reference, title from portal_projects where id = ${input.projectId} limit 1
      `
    : [];
  const enquiry = input.enquiryId
    ? await sql<{ id: string; project_type: string; zone: string }>`
        select id, project_type, zone from enquiries where id = ${input.enquiryId} limit 1
      `
    : [];
  const proj = project[0];
  const lead = enquiry[0];
  if (!proj && !lead) throw new Error("Project or enquiry not found.");

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
    projectReference: proj?.reference ?? `ENQ-${lead?.id.slice(0, 8).toUpperCase()}`,
    projectTitle: proj?.title ?? `${lead?.project_type ?? "Project"} — ${lead?.zone ?? "site to be confirmed"}`,
    narrative: input.narrative,
    lines: input.lines,
    subtotal,
    vatRate,
    vatAmount,
    total,
    amountPaid: input.amountPaid ?? 0,
    layout,
    totalLabel: input.totalLabel ?? (input.kind === "quotation" ? "Quoted total" : undefined),
    paidLabel: input.paidLabel,
    currency: "KES",
    validUntil: input.validUntil,
    etimsReference: input.etimsReference,
    registeredName: COMPANY.registeredName,
    businessAddress: COMPANY.registeredAddress,
    kraPin: COMPANY.kraPin,
    contactEmail: COMPANY.email,
    contactPhone: COMPANY.phoneDisplay,
    website: COMPANY.website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  };

  try {
    const rows = await sql<{ id: string; number: string }>`
      insert into portal_invoice (
        project_id, enquiry_id, payment_id, number, kind, lines, subtotal, vat_rate,
        vat_amount, total, amount_paid, narrative, issued_to, issued_by,
        body_html, body_text, valid_until, etims_reference, issued_at
      ) values (
        ${input.projectId ?? null}, ${input.enquiryId ?? null}, ${input.paymentId ?? null},
        ${number}, ${input.kind},
        ${JSON.stringify(input.lines)}, ${subtotal}, ${vatRate}, ${vatAmount},
        ${total}, ${input.amountPaid ?? 0}, ${input.narrative},
        ${input.issuedTo}, ${input.issuedBy}, ${renderHtml(data)}, ${renderText(data)},
        ${input.validUntil ?? null}, ${input.etimsReference ?? ""}, now()
      )
      returning id, number
    `;
    const row = rows[0];
    return row ? { id: row.id, number: row.number } : null;
  } catch (err) {
    // The unique indexes make a duplicate certificate/receipt impossible; treat
    // that as "already issued" rather than an error the caller has to handle.
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("portal_invoice_certificate_once") ||
      message.includes("portal_invoice_receipt_once") ||
      message.includes("portal_invoice_payment_request_once")
    ) {
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
    narrative: `Certified under ${args.certificate} for work completed and inspected. This certificate authorises payment of ${money(args.amount)}. Retention held against defects is not included and is not payable until the defects liability period closes.`,
    lines: [
      {
        description: args.label,
        amount: args.amount,
      },
    ],
  });
}

/** A confirmed project stage gets a payment request, never a pretend tax invoice. */
export async function issuePaymentRequestFor(
  sql: Sql,
  staffEmail: string,
  args: {
    projectId: string;
    paymentId: string;
    label: string;
    reference: string;
    certificate?: string;
    amount: number;
  },
): Promise<IssuedDocument | null> {
  const project = await sql<{ client_label: string }>`
    select client_label from portal_projects where id = ${args.projectId} limit 1
  `;
  return issueDocument(sql, {
    projectId: args.projectId,
    paymentId: args.paymentId,
    kind: "payment_request",
    issuedTo: project[0]?.client_label || "Client",
    issuedBy: staffEmail,
    narrative:
      (args.certificate
        ? `Payment is requested for the completed and inspected work shown below, under certificate ${args.certificate}. `
        : `Payment is requested for the agreed project stage shown below, under reference ${args.reference} and the signed engagement terms. `) +
      "Pay only through the payment method shown in your client portal. This document is not a tax invoice.",
    lines: [
      {
        description: args.certificate
          ? `${args.label} — certificate ${args.certificate}`
          : `${args.label} — agreed project stage`,
        amount: args.amount,
      },
    ],
  });
}

/** Issued to the client after Paystack confirms payment settlement. */
export async function issueReceiptFor(
  sql: Sql,
  args: {
    projectId: string;
    paymentId: string;
    label: string;
    certificate: string;
    amount: number;
  },
): Promise<IssuedDocument | null> {
  const project = await sql<{ client_label: string; track: string }>`
    select client_label, track from portal_projects where id = ${args.projectId} limit 1
  `;
  const measuredWork = usesMeasuredWorkCertification(project[0]?.track ?? "");
  return issueDocument(sql, {
    projectId: args.projectId,
    paymentId: args.paymentId,
    kind: "receipt",
    issuedTo: project[0]?.client_label || "Client",
    issuedBy: COMPANY.name,
    narrative: measuredWork
      ? `Received against certificate ${args.certificate} for ${args.label}. Quote this receipt number when corresponding.`
      : `Received against agreed stage reference ${args.certificate} for ${args.label}. Quote this receipt number when corresponding.`,
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
    track: string;
    contract_value: number;
    paid_to_date: number;
    currently_certified: number;
    retention_held: number;
    retention_pct: number;
  }>`
    select reference, title, client_label, track, contract_value, paid_to_date,
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
  const measuredWork = usesMeasuredWorkCertification(p.track);

  const lines: Line[] = [
    {
      description: measuredWork ? "Agreed contract value (priced bill of quantities)" : "Agreed engagement value",
      amount: contractValue,
    },
    { description: "Paid to date", amount: paid },
    {
      description: measuredWork ? "Certified and awaiting payment" : "Approved stages awaiting payment",
      amount: awaiting,
    },
    {
      description: measuredWork
        ? "Retention held against defects"
        : "Retention held under the engagement",
      amount: retention,
    },
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
      `The position on your project as at the date of this statement. It is a record, not a demand for payment. The outstanding balance is the amount ${measuredWork ? "certified" : "approved under the engagement"} and awaiting payment.`,
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
    validUntil:
      row.valid_until == null ? null : String(row.valid_until).slice(0, 10),
    projectReference: String(row.reference ?? ""),
    projectTitle: String(row.title ?? ""),
  };
}

export const listMyDocuments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql`
      select d.id, d.number, d.kind, d.status, d.total, d.amount_paid, d.issued_at, d.valid_until,
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
      select d.id, d.number, d.kind, d.status, d.total, d.amount_paid, d.issued_at, d.valid_until,
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

/** Staff can open enquiry quotations before the client has a portal account. */
export const getStaffDocument = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }): Promise<DocumentDetail | null> => {
    const { requireStaff } = await import("@/lib/staff-session.server");
    await requireStaff();
    const sql = await getSql();
    const rows = await sql`
      select d.id, d.number, d.kind, d.status, d.total, d.amount_paid, d.issued_at, d.valid_until,
        d.body_html, d.body_text, d.narrative, d.issued_to, d.issued_by,
        d.voided_reason,
        coalesce(p.reference, 'ENQ-' || upper(left(e.id::text, 8))) as reference,
        coalesce(p.title, e.project_type || ' — ' || e.zone) as title
      from portal_invoice d
      left join portal_projects p on p.id = d.project_id
      left join enquiries e on e.id = d.enquiry_id
      where d.id = ${data.id}
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
      voidedReason: String(row.voided_reason ?? ""),
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
      select d.id, d.number, d.kind, d.status, d.total, d.amount_paid, d.issued_at, d.valid_until,
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

export const listEnquiryQuotations = createServerFn({ method: "GET" })
  .validator(z.object({ enquiryId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireStaff } = await import("@/lib/staff-session.server");
    await requireStaff();
    const sql = await getSql();
    await sql`
      update portal_invoice
      set status = 'expired'
      where enquiry_id = ${data.enquiryId}
        and kind = 'quotation'
        and status = 'issued'
        and valid_until < current_date
    `;
    const rows = await sql`
      select d.id, d.number, d.kind, d.status, d.total, d.amount_paid, d.issued_at,
        d.valid_until,
        coalesce(p.reference, 'ENQ-' || upper(left(e.id::text, 8))) as reference,
        coalesce(p.title, e.project_type || ' — ' || e.zone) as title
      from portal_invoice d
      left join portal_projects p on p.id = d.project_id
      left join enquiries e on e.id = d.enquiry_id
      where d.enquiry_id = ${data.enquiryId} and d.kind = 'quotation'
      order by d.issued_at desc
    `;
    return rows.map((row) => toSummary(row as Record<string, unknown>));
  });

export const issueStatement = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/staff-session.server");
    const staff = await requireAdmin("issue-statement");
    const sql = await getSql();
    const issued = await issueStatementFor(sql, staff.email, data.projectId);
    if (!issued) throw new Error("Could not issue the statement.");
    return issued;
  });

const QuotationInput = z
  .object({
    projectId: z.string().uuid().optional(),
    enquiryId: z.string().uuid().optional(),
    scope: z.string().trim().min(20).max(5_000),
    pricingBasis: z.string().trim().min(10).max(2_000),
    exclusions: z.string().trim().max(3_000).default(""),
    lines: z
      .array(
        z.object({
          description: z.string().trim().min(2).max(240),
          amount: z.number().int().positive().max(50_000_000_000),
        }),
      )
      .min(1)
      .max(40),
    vatRate: z.number().min(0).max(0.3).default(0),
    validUntil: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((value) => {
        const parsed = new Date(`${value}T00:00:00Z`);
        return (
          !Number.isNaN(parsed.getTime()) &&
          parsed.toISOString().slice(0, 10) === value &&
          value >= new Date().toISOString().slice(0, 10)
        );
      }),
  })
  .refine((data) => Boolean(data.projectId) !== Boolean(data.enquiryId), {
    message: "Choose exactly one enquiry or project.",
  });

export const issueQuotation = createServerFn({ method: "POST" })
  .validator(QuotationInput)
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/staff-session.server");
    const staff = await requireAdmin("issue-quotation");
    const sql = await getSql();
    const recipient = data.projectId
      ? await sql<{ client_label: string; claimed_email: string }>`
          select client_label, claimed_email from portal_projects where id = ${data.projectId} limit 1
        `
      : await sql<{ name: string; email: string }>`
          select name, email from enquiries where id = ${data.enquiryId} limit 1
        `;
    const to = recipient[0];
    if (!to) throw new Error("The project or enquiry was not found.");
    const issuedTo =
      "client_label" in to
        ? [to.client_label, to.claimed_email].filter(Boolean).join(" · ")
        : [to.name, to.email].filter(Boolean).join(" · ");
    const scope = data.scope.trim();
    const exclusions = data.exclusions.trim();
    const narrative = [
      `Scope and inclusions:\n${scope}`,
      `Pricing basis and references:\n${data.pricingBasis.trim()}`,
      exclusions ? `Exclusions and assumptions:\n${exclusions}` : "",
      data.vatRate > 0
        ? `VAT is calculated at ${(data.vatRate * 100).toFixed(2)}% as entered by ATRO.`
        : "VAT is not included in this quotation. Confirm the applicable tax treatment before acceptance.",
      "This quotation is subject to a written agreement. Changes to scope, quantities, site conditions or supplier quotations may change the price.",
    ]
      .filter(Boolean)
      .join("\n\n");
    const issued = await issueDocument(sql, {
      projectId: data.projectId,
      enquiryId: data.enquiryId,
      kind: "quotation",
      issuedTo: issuedTo || "Client",
      issuedBy: staff.email,
      narrative,
      lines: data.lines,
      vatRate: data.vatRate,
      validUntil: data.validUntil,
    });
    if (!issued) throw new Error("Could not issue the quotation.");
    return issued;
  });

/** A void never edits history — the document stays, marked, and a new one is issued. */
export const voidDocument = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1), reason: z.string().trim().min(3).max(200) }))
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/staff-session.server");
    const staff = await requireAdmin("void-document");
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