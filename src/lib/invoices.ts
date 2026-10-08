// ATRO financial documents — certificates, invoices, receipts, statements.
//
// Pure rendering and arithmetic, no I/O, so it is unit-testable and the numbers
// on a document can be checked independently of the database.
//
// One rule shapes this file: the rendered body is frozen at issue. Recomputing
// a document on demand would mean an invoice could quietly change after money
// moved, which is exactly the thing a certificate exists to prevent.

export type DocumentKind = "certificate" | "invoice" | "receipt" | "statement";

export const KIND_LABEL: Record<DocumentKind, string> = {
  certificate: "Payment certificate",
  invoice: "Invoice",
  receipt: "Receipt",
  statement: "Statement of account",
};

export const KIND_CODE: Record<DocumentKind, string> = {
  certificate: "CERT",
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

export type DocumentData = {
  number: string;
  kind: DocumentKind;
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
  currency: string;
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

/** Shareable, printable HTML. Self-contained: no scripts, no external assets. */
export function renderHtml(data: DocumentData): string {
  const rows = data.lines
    .map(
      (line) => `      <tr>
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
    data.vatRate > 0
      ? `      <tr><td>VAT at ${(data.vatRate * 100).toFixed(1)}%</td><td></td><td class="num">${formatMoney(data.vatAmount, data.currency)}</td></tr>`
      : "";

  return `<article class="doc">
  <header>
    <p class="brand">ATRO Design &amp; Construction</p>
    <p class="brand-sub">Designing &amp; building better structures · Nairobi, Kenya</p>
    <h1>${escapeHtml(KIND_LABEL[data.kind])}</h1>
    <dl>
      <div><dt>Number</dt><dd>${escapeHtml(data.number)}</dd></div>
      <div><dt>Date</dt><dd>${escapeHtml(formatDate(data.issuedAt))}</dd></div>
      <div><dt>Project</dt><dd>${escapeHtml(data.projectReference)} — ${escapeHtml(data.projectTitle)}</dd></div>
      <div><dt>Issued to</dt><dd>${escapeHtml(data.issuedTo)}</dd></div>
      <div><dt>Issued by</dt><dd>${escapeHtml(data.issuedBy)}</dd></div>
    </dl>
  </header>

  ${data.narrative ? `<p class="narrative">${escapeHtml(data.narrative)}</p>` : ""}

  <table>
    <thead><tr><th>Description</th><th class="num">Basis</th><th class="num">Amount</th></tr></thead>
    <tbody>
${rows}
    </tbody>
    <tfoot>
      <tr><td colspan="2">Subtotal</td><td class="num">${formatMoney(data.subtotal, data.currency)}</td></tr>
${vatRow}
      <tr class="total"><td colspan="2">Total due</td><td class="num">${formatMoney(data.total, data.currency)}</td></tr>
    </tfoot>
  </table>

  ${
    data.amountPaid > 0
      ? `<p class="paid">Received: <strong>${formatMoney(data.amountPaid, data.currency)}</strong></p>`
      : ""
  }

  <footer>
    <p>This document was issued by ATRO Design &amp; Construction and reflects the project record at the date above.</p>
    <p>Retention held against defects is not payable until the defects liability period closes.</p>
  </footer>
</article>`;
}

/** Plain text, for pasting into an email or a bank instruction. */
export function renderText(data: DocumentData): string {
  const lines = data.lines
    .map((line) => {
      const basis =
        line.quantity !== undefined && line.unit && line.rate !== undefined
          ? ` (${line.quantity} ${line.unit} @ ${line.rate.toLocaleString("en-KE")})`
          : "";
      return `  ${line.description}${basis} — ${line.amount.toLocaleString("en-KE")}`;
    })
    .join("\n");

  const vat =
    data.vatRate > 0
      ? `\n  VAT at ${(data.vatRate * 100).toFixed(1)}% — ${data.vatAmount.toLocaleString("en-KE")}`
      : "";

  return [
    `ATRO Design & Construction`,
    `${KIND_LABEL[data.kind].toUpperCase()}`,
    `Number: ${data.number}`,
    `Date: ${formatDate(data.issuedAt)}`,
    `Project: ${data.projectReference} — ${data.projectTitle}`,
    `Issued to: ${data.issuedTo}`,
    `Issued by: ${data.issuedBy}`,
    data.narrative ? `\n${data.narrative}` : "",
    `\nDescription`,
    lines,
    `\n  Subtotal — ${data.subtotal.toLocaleString("en-KE")}${vat}`,
    `  TOTAL DUE — ${data.total.toLocaleString("en-KE")} ${data.currency}`,
    data.amountPaid > 0 ? `  Received — ${data.amountPaid.toLocaleString("en-KE")} ${data.currency}` : "",
    "",
    "Retention held against defects is not payable until the defects liability period closes.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

/** Styles are printed by the document route, kept here so the frozen HTML is self-contained. */
export const DOCUMENT_STYLES = `
.doc{max-width:760px;margin:0 auto;background:#fff;color:#2b2b2b;font-family:Georgia,'Times New Roman',serif}
.doc header{border-bottom:2px solid #3C0508;padding-bottom:1.25rem;margin-bottom:1.5rem}
.doc .brand{font-family:system-ui,sans-serif;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#3C0508;margin:0}
.doc .brand-sub{font-family:system-ui,sans-serif;font-size:12px;color:#777;margin:.35rem 0 1.25rem}
.doc h1{font-family:system-ui,sans-serif;font-size:26px;letter-spacing:.01em;color:#3C0508;margin:0 0 1rem}
.doc dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem 1.5rem;margin:0;font-family:system-ui,sans-serif;font-size:13px}
.doc dt{color:#8a6a3a;text-transform:uppercase;letter-spacing:.12em;font-size:10px;margin:0 0 .2rem}
.doc dd{margin:0;color:#2b2b2b}
.doc .narrative{font-size:15px;line-height:1.7;margin:0 0 1.5rem}
.doc table{width:100%;border-collapse:collapse;font-family:system-ui,sans-serif;font-size:13px}
.doc th{text-align:left;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#8a6a3a;border-bottom:1px solid #d9d2c7;padding:.6rem .5rem}
.doc td{padding:.7rem .5rem;border-bottom:1px solid #eee7dd;vertical-align:top}
.doc .num{text-align:right;white-space:nowrap}
.doc .muted{color:#777}
.doc tfoot td{border-bottom:none;padding-top:.7rem}
.doc tfoot .total td{border-top:2px solid #3C0508;font-weight:700;color:#3C0508;padding-top:.8rem}
.doc .paid{margin:1.25rem 0 0;font-family:system-ui,sans-serif;font-size:13px}
.doc footer{margin-top:2rem;padding-top:1rem;border-top:1px solid #eee7dd;font-family:system-ui,sans-serif;font-size:11px;color:#777}
@media print{.doc{border:0}.no-print{display:none}}
`;