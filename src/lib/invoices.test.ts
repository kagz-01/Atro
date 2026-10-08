import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatDate,
  formatMoney,
  formatNumber,
  renderHtml,
  renderText,
  sumLines,
  vatFor,
  type DocumentData,
} from "./invoices.ts";

const doc: DocumentData = {
  number: "ATR-2026-CERT-0007",
  kind: "certificate",
  issuedAt: "2026-03-12T08:00:00.000Z",
  issuedTo: "Wanjiku M. — United Kingdom",
  issuedBy: "studio@atro.ke",
  projectReference: "ATR-2026-0417",
  projectTitle: "4-bedroom maisonette, Karen",
  narrative: "Certified for work completed and inspected.",
  lines: [
    { description: "Superstructure — first floor", amount: 5_000_000 },
    { description: "Blockwork", quantity: 12, unit: "sqm", rate: 2_500, amount: 30_000 },
  ],
  subtotal: 5_030_000,
  vatRate: 0,
  vatAmount: 0,
  total: 5_030_000,
  amountPaid: 0,
  currency: "KES",
};

describe("document numbers", () => {
  it("carries the year, the kind and a padded sequence", () => {
    assert.equal(formatNumber("certificate", 2026, 7), "ATR-2026-CERT-0007");
    assert.equal(formatNumber("receipt", 2026, 1234), "ATR-2026-RCPT-1234");
    assert.equal(formatNumber("statement", 2025, 1), "ATR-2025-STMT-0001");
  });

  it("never collides across kinds because the kind code differs", () => {
    const kinds = ["certificate", "invoice", "receipt", "statement"] as const;
    assert.equal(new Set(kinds.map((k) => formatNumber(k, 2026, 1))).size, kinds.length);
  });
});

describe("document arithmetic", () => {
  it("adds the lines", () => {
    assert.equal(sumLines(doc.lines), 5_030_000);
    assert.equal(sumLines([]), 0);
  });

  it("applies VAT only when a rate is set", () => {
    assert.equal(vatFor(100_000, 0), 0);
    assert.equal(vatFor(100_000, 0.16), 16_000);
  });

  it("rounds money to whole shillings", () => {
    assert.equal(vatFor(99_999, 0.16), 16_000);
    assert.equal(Number.isInteger(vatFor(333_333, 0.16)), true);
  });

  it("formats money as Kenyan shillings", () => {
    assert.equal(formatMoney(41_800_000), "KES 41,800,000");
    assert.match(formatMoney(5_030_000), /^KES 5,030,000$/);
  });

  it("formats a date, and refuses a nonsense one", () => {
    assert.equal(formatDate("2026-03-12T08:00:00.000Z").length > 0, true);
    assert.equal(formatDate("not a date"), "");
  });
});

describe("frozen document body", () => {
  it("states the kind, number, project and totals in the text version", () => {
    const text = renderText(doc);
    assert.match(text, /PAYMENT CERTIFICATE/);
    assert.match(text, /ATR-2026-CERT-0007/);
    assert.match(text, /ATR-2026-0417/);
    assert.match(text, /TOTAL DUE — 5,030,000 KES/);
  });

  it("shows the quantity and rate only when both are present", () => {
    const text = renderText(doc);
    assert.match(text, /12 sqm @ 2,500/, "a measured line shows its basis");
    assert.doesNotMatch(text, /Superstructure — first floor \(/, "a fixed fee shows none");
  });

  it("omits the VAT line entirely at a zero rate", () => {
    assert.doesNotMatch(renderText(doc), /VAT at/);
    const withVat = { ...doc, vatRate: 0.16, vatAmount: vatFor(doc.subtotal, 0.16) };
    assert.match(renderText(withVat), /VAT at 16.0%/);
  });

  it("shows money received only when something was received", () => {
    assert.doesNotMatch(renderText(doc), /Received —/);
    assert.match(renderText({ ...doc, amountPaid: 5_030_000 }), /Received — 5,030,000 KES/);
  });

  it("renders self-contained HTML with no scripts or external assets", () => {
    const html = renderHtml(doc);
    assert.match(html, /Payment certificate/);
    assert.match(html, /Superstructure — first floor/);
    assert.doesNotMatch(html, /<script/i);
    assert.doesNotMatch(html, /src=/i);
  });

  it("escapes markup so a description can never become live HTML", () => {
    const hostile = {
      ...doc,
      narrative: '<img src=x onerror="alert(1)">',
      lines: [{ description: "<script>steal()</script>", amount: 1 }],
    };
    const html = renderHtml(hostile);
    // No tag survives — the angle brackets and quotes become entities, so the
    // payload is inert text rather than an element or an event handler.
    assert.doesNotMatch(html, /<img/i);
    assert.doesNotMatch(html, /<script/i);
    assert.match(html, /&lt;script&gt;steal\(\)&lt;\/script&gt;/);
    assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  });
});

describe("statement layout", () => {
  const statement: DocumentData = {
    ...doc,
    kind: "statement",
    layout: "summary",
    totalLabel: "Outstanding balance",
    paidLabel: "Paid to date",
    number: "ATR-2026-STMT-0002",
    // Report lines: these are positions, not charges.
    lines: [
      { description: "Contract value (priced bill of quantities)", amount: 41_800_000 },
      { description: "Paid to date", amount: 17_940_000 },
      { description: "Certified and awaiting your release", amount: 480_000 },
      { description: "Retention held against defects", amount: 940_000 },
    ],
    subtotal: 480_000,
    total: 480_000,
    amountPaid: 17_940_000,
  };

  it("never calls a statement a bill", () => {
    const text = renderText(statement);
    assert.doesNotMatch(text, /TOTAL DUE/i);
    assert.match(text, /OUTSTANDING BALANCE — 480,000 KES/);
  });

  it("does not total the report lines into a figure nobody owes", () => {
    const naive = sumLines(statement.lines);
    assert.equal(naive, 61_160_000, "summing report lines is meaningless");
    assert.equal(statement.total, 480_000, "the balance is what is certified and unreleased");
    assert.notEqual(statement.total, naive);
  });

  it("drops the subtotal row and the basis column in a summary", () => {
    const html = renderHtml(statement);
    assert.doesNotMatch(html, /Subtotal/);
    assert.doesNotMatch(html, />Basis</);
    assert.match(html, />Position</);
  });

  it("uses the paid label the caller chose", () => {
    assert.match(renderText(statement), /Paid to date — 17,940,000 KES/);
  });

  it("still escapes hostile content in the summary layout", () => {
    const html = renderHtml({ ...statement, lines: [{ description: "<script>x()</script>", amount: 1 }] });
    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /&lt;script&gt;/);
  });
});
