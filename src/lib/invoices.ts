// ATRO financial documents — quotations, certificates, payment requests, receipts and statements.
//
// Pure rendering and arithmetic, no I/O, so it is unit-testable and the numbers
// on a document can be checked independently of the database.
//
// One rule shapes this file: the rendered body is frozen at issue. Recomputing
// a document on demand would mean an invoice could quietly change after money
// moved, which is exactly the thing a certificate exists to prevent.

export type DocumentKind =
  | "quotation"
  | "certificate"
  | "payment_request"
  | "invoice"
  | "receipt"
  | "statement";

export const KIND_LABEL: Record<DocumentKind, string> = {
  quotation: "Quotation",
  certificate: "Payment certificate",
  payment_request: "Payment request — not a tax invoice",
  invoice: "Tax invoice",
  receipt: "Receipt",
  statement: "Statement of account",
};

export const KIND_CODE: Record<DocumentKind, string> = {
  quotation: "QUOT",
  certificate: "CERT",
  payment_request: "PAY",
  invoice: "INV",
  receipt: "RCPT",
  statement: "STMT",
};

export type Line = {
  description: string;
  /** Quantity is optional: a fixed-fee stage has no unit. */
  quantity?: number;
  unit?: string;
  /** Omitted for a fixed fee — the document then shows "Fixed" rather than a fake rate. */
  rate?: number;
  amount: number;
};

export type DocumentLayout = "invoice" | "summary";

export type DocumentData = {
  number: string;
  kind: DocumentKind;
  /**
   * `invoice` prices work and ends in an amount due. `summary` reports a
   * position — a statement must never be rendered as a bill, or it ends up
   * claiming the client owes the whole contract rather than the balance.
   */
  layout?: DocumentLayout;
  /** What the bottom line is called. Never assume "total due". */
  totalLabel?: string;
  issuedAt: string;
  issuedTo: string;
  issuedBy: string;
  projectReference: string;
  projectTitle: string;
  narrative: string;
  lines: Line[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  amountPaid: number;
  paidLabel?: string;
  currency: string;
  validUntil?: string;
  etimsReference?: string;
  registeredName?: string;
  businessAddress?: string;
  kraPin?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
};

/** Human number: `ATR-2026-CERT-0007`. */
export function formatNumber(kind: DocumentKind, year: number, sequence: number): string {
  return `ATR-${year}-${KIND_CODE[kind]}-${String(sequence).padStart(4, "0")}`;
}

export function sumLines(lines: Line[]): number {
  return lines.reduce((sum, line) => sum + Math.round(line.amount), 0);
}

/**
 * VAT is never assumed. The rate is set per engagement by ATRO, so this only
 * applies what it is given and the document shows the line either way.
 */
export function vatFor(subtotal: number, rate: number): number {
  return Math.round(subtotal * rate);
}

export function formatMoney(amount: number, currency = "KES"): string {
  return `${currency} ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function formatDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Printable HTML. No scripts; the letterhead logo is served by this application.
 *
 * Two layouts on purpose: an invoice prices work and ends in an amount due; a
 * statement reports a position and ends in what is actually outstanding.
 */
export function renderHtml(data: DocumentData): string {
  const layout = data.layout ?? "invoice";
  const registeredName = data.registeredName ?? "ATRO Design & Construction";
  const businessAddress = data.businessAddress ?? "PLACEHOLDER — TO BE PROVIDED";
  const kraPin = data.kraPin ?? "PLACEHOLDER — TO BE PROVIDED";
  const contactEmail = data.contactEmail ?? "hello@atroconstruction.co.ke";
  const contactPhone = data.contactPhone ?? "+254 799 034 712";
  const website = data.website ?? "atroconstruction.co.ke";

  const rows = data.lines
    .map((line) =>
      layout === "summary"
        ? `      <tr>
        <td>${escapeHtml(line.description)}</td>
        <td class="num">${formatMoney(line.amount, data.currency)}</td>
      </tr>`
        : `      <tr>
        <td>${escapeHtml(line.description)}${
          line.quantity !== undefined && line.unit
            ? `<span class="muted"> · ${line.quantity} ${escapeHtml(line.unit)}</span>`
            : ""
        }</td>
        <td class="num">${
          line.quantity !== undefined && line.unit && line.rate !== undefined
            ? `${line.quantity} ${escapeHtml(line.unit)} @ ${formatMoney(line.rate, "")}`
            : "Fixed"
        }</td>
        <td class="num">${formatMoney(line.amount, data.currency)}</td>
      </tr>`,
    )
    .join("\n");

  const vatRow =
    layout === "invoice" && data.vatRate > 0
      ? `      <tr><td>VAT at ${(data.vatRate * 100).toFixed(1)}%</td><td></td><td class="num">${formatMoney(data.vatAmount, data.currency)}</td></tr>`
      : "";

  const headerCells =
    layout === "summary"
      ? `<th>Position</th><th class="num">Amount</th>`
      : `<th>Description</th><th class="num">Basis</th><th class="num">Amount</th>`;

  const subtotalRows =
    layout === "summary"
      ? ""
      : `      <tr><td colspan="2">Subtotal</td><td class="num">${formatMoney(data.subtotal, data.currency)}</td></tr>
${vatRow}`;

  const totalSpan = layout === "summary" ? 1 : 2;
  const paidLine =
    data.amountPaid > 0
      ? `<p class="paid">${escapeHtml(data.paidLabel ?? "Received")}: <strong>${formatMoney(data.amountPaid, data.currency)}</strong></p>`
      : "";
  const documentNotice =
    data.kind === "payment_request"
      ? `<p class="notice">Payment request only — this is not a tax invoice. ATRO is not yet issuing eTIMS tax invoices through this system.</p>`
      : data.kind === "invoice" && !data.etimsReference
        ? `<p class="notice">Draft only — not a tax invoice. An eTIMS control reference is required before this can be issued as a tax invoice.</p>`
        : data.kind === "quotation"
        ? `<p class="notice">This quotation is not a contract or signed engagement. Work begins only after the scope, terms and engagement are agreed in writing.</p>`
          : "";
  const validUntil =
    data.kind === "quotation" && data.validUntil
      ? `<div><dt>Valid until</dt><dd>${escapeHtml(formatDate(data.validUntil))}</dd></div>`
      : "";
  const retentionNote =
    data.kind === "certificate" || data.kind === "statement"
      ? `<p>Retention, if agreed in the contract, is held against defects and is payable only under the contract terms.</p>`
      : "";

  return `<article class="doc">
  <header>
    <div class="letterhead">
      <img class="logo" src="/logo/logo.png" alt="ATRO Design &amp; Construction">
      <div>
        <p class="brand">${escapeHtml(registeredName)}</p>
        <p class="brand-sub">${escapeHtml(businessAddress)}</p>
        <p class="contact">${escapeHtml(contactEmail)} · ${escapeHtml(contactPhone)} · ${escapeHtml(website)}</p>
      </div>
    </div>
    <p class="tax-details">KRA PIN: ${escapeHtml(kraPin)}</p>
    <h1>${escapeHtml(KIND_LABEL[data.kind])}</h1>
    <dl>
      <div><dt>Number</dt><dd>${escapeHtml(data.number)}</dd></div>
      <div><dt>Date</dt><dd>${escapeHtml(formatDate(data.issuedAt))}</dd></div>
      ${validUntil}
      <div><dt>Project</dt><dd>${escapeHtml(data.projectReference)} — ${escapeHtml(data.projectTitle)}</dd></div>
      <div><dt>Issued to</dt><dd>${escapeHtml(data.issuedTo)}</dd></div>
      <div><dt>Issued by</dt><dd>${escapeHtml(data.issuedBy)}</dd></div>
    </dl>
  </header>

  ${documentNotice}
  ${data.narrative ? `<p class="narrative">${escapeHtml(data.narrative)}</p>` : ""}

  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>
${rows}
    </tbody>
    <tfoot>
${subtotalRows}
      <tr class="total"><td colspan="${totalSpan}">${escapeHtml(data.totalLabel ?? "Total due")}</td><td class="num">${formatMoney(data.total, data.currency)}</td></tr>
    </tfoot>
  </table>

  ${paidLine}

  <footer>
    <p>Issued by ${escapeHtml(registeredName)} · ${escapeHtml(contactEmail)} · ${escapeHtml(contactPhone)}</p>
    ${retentionNote}
  </footer>
</article>`;
}

/** Plain text, for pasting into an email or a bank instruction. */
export function renderText(data: DocumentData): string {
  const layout = data.layout ?? "invoice";

  const lines = data.lines
    .map((line) => {
      if (layout === "summary") {
        return `  ${line.description} — ${line.amount.toLocaleString("en-KE")}`;
      }
      const basis =
        line.quantity !== undefined && line.unit && line.rate !== undefined
          ? ` (${line.quantity} ${line.unit} @ ${line.rate.toLocaleString("en-KE")})`
          : "";
      return `  ${line.description}${basis} — ${line.amount.toLocaleString("en-KE")}`;
    })
    .join("\n");

  const subtotalBlock =
    layout === "summary"
      ? ""
      : `\n  Subtotal — ${data.subtotal.toLocaleString("en-KE")}${
          data.vatRate > 0
            ? `\n  VAT at ${(data.vatRate * 100).toFixed(1)}% — ${data.vatAmount.toLocaleString("en-KE")}`
            : ""
        }`;

  return [
    data.registeredName ?? "ATRO Design & Construction",
    `${data.businessAddress ?? "PLACEHOLDER — TO BE PROVIDED"} · KRA PIN: ${data.kraPin ?? "PLACEHOLDER — TO BE PROVIDED"}`,
    `${data.contactEmail ?? "hello@atroconstruction.co.ke"} · ${data.contactPhone ?? "+254 799 034 712"} · ${data.website ?? "atroconstruction.co.ke"}`,
    `${KIND_LABEL[data.kind].toUpperCase()}`,
    `Number: ${data.number}`,
    `Date: ${formatDate(data.issuedAt)}`,
    data.kind === "quotation" && data.validUntil
      ? `Valid until: ${formatDate(data.validUntil)}`
      : "",
    `Project: ${data.projectReference} — ${data.projectTitle}`,
    `Issued to: ${data.issuedTo}`,
    `Issued by: ${data.issuedBy}`,
    data.narrative ? `\n${data.narrative}` : "",
    `\n${layout === "summary" ? "Position" : "Description"}`,
    lines,
    `${subtotalBlock}\n  ${(data.totalLabel ?? "Total due").toUpperCase()} — ${data.total.toLocaleString("en-KE")} ${data.currency}`,
    data.amountPaid > 0
      ? `  ${data.paidLabel ?? "Received"} — ${data.amountPaid.toLocaleString("en-KE")} ${data.currency}`
      : "",
    data.kind === "quotation"
      ? "This quotation is not a contract or signed engagement. Work begins only after the scope, terms and engagement are agreed in writing."
      : data.kind === "payment_request" || (data.kind === "invoice" && !data.etimsReference)
        ? "Payment request/draft only — not a tax invoice. ATRO is not yet issuing eTIMS tax invoices through this system."
        : data.kind === "certificate" || data.kind === "statement"
          ? "Retention, if agreed in the contract, is held against defects and is payable only under the contract terms."
          : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

/** Styles are printed by the document route, kept here so the frozen HTML is self-contained. */
export const DOCUMENT_STYLES = `
.doc{max-width:760px;margin:0 auto;background:#fff;color:#2b2b2b;font-family:Georgia,'Times New Roman',serif}
.doc header{border-bottom:2px solid #3C0508;padding-bottom:1.25rem;margin-bottom:1.5rem}
.doc .letterhead{display:flex;align-items:center;gap:1rem;margin-bottom:1rem}
.doc .logo{width:88px;height:88px;object-fit:contain}
.doc .brand{font-family:system-ui,sans-serif;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#3C0508;margin:0}
.doc .brand-sub{font-family:system-ui,sans-serif;font-size:12px;color:#777;margin:.35rem 0}
.doc .contact,.doc .tax-details{font-family:system-ui,sans-serif;font-size:10px;color:#777;margin:.35rem 0}
.doc .tax-details{margin:.65rem 0 1.25rem}
.doc h1{font-family:system-ui,sans-serif;font-size:26px;letter-spacing:.01em;color:#3C0508;margin:0 0 1rem}
.doc dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem 1.5rem;margin:0;font-family:system-ui,sans-serif;font-size:13px}
.doc dt{color:#8a6a3a;text-transform:uppercase;letter-spacing:.12em;font-size:10px;margin:0 0 .2rem}
.doc dd{margin:0;color:#2b2b2b}
.doc .narrative{font-size:15px;line-height:1.7;margin:0 0 1.5rem;white-space:pre-line}
.doc table{width:100%;border-collapse:collapse;font-family:system-ui,sans-serif;font-size:13px}
.doc th{text-align:left;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#8a6a3a;border-bottom:1px solid #d9d2c7;padding:.6rem .5rem}
.doc td{padding:.7rem .5rem;border-bottom:1px solid #eee7dd;vertical-align:top}
.doc .num{text-align:right;white-space:nowrap}
.doc .muted{color:#777}
.doc tfoot td{border-bottom:none;padding-top:.7rem}
.doc tfoot .total td{border-top:2px solid #3C0508;font-weight:700;color:#3C0508;padding-top:.8rem}
.doc .paid{margin:1.25rem 0 0;font-family:system-ui,sans-serif;font-size:13px}
.doc .notice{margin:0 0 1rem;padding:.75rem 1rem;border:1px solid #dfc48d;background:#fff9ed;color:#5a390d;font-family:system-ui,sans-serif;font-size:12px;line-height:1.55}
.doc footer{margin-top:2rem;padding-top:1rem;border-top:1px solid #eee7dd;font-family:system-ui,sans-serif;font-size:11px;color:#777}
@media print{.doc{border:0}.no-print{display:none}@page{size:A4;margin:18mm}}
`;