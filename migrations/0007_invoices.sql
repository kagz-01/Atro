-- Financial documents: payment certificates, invoices, receipts, statements.
--
-- The rendered body is FROZEN at issue time. An invoice that can still change a
-- month later is worth nothing when a client is arguing with a contractor, and
-- nothing at all to an accountant. So the HTML and plain text are written once
-- and never recomputed; a correction is a void plus a new document.
--
-- Numbers come from a sequence so they are atomic and cannot be reused. The
-- frozen body is what makes the number meaningful.

create sequence if not exists portal_invoice_seq;

create table if not exists portal_invoice (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  payment_id uuid references portal_payments (id) on delete set null,
  number text not null unique,
  kind text not null check (kind in ('certificate', 'invoice', 'receipt', 'statement')),
  status text not null default 'issued' check (status in ('issued', 'void')),
  currency text not null default 'KES',
  lines jsonb not null default '[]'::jsonb,
  subtotal bigint not null default 0,
  vat_rate numeric(6, 4) not null default 0,
  vat_amount bigint not null default 0,
  total bigint not null default 0,
  amount_paid bigint not null default 0,
  narrative text not null default '',
  issued_to text not null default '',
  issued_by text not null default '',
  voided_reason text not null default '',
  body_html text not null default '',
  body_text text not null default '',
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists portal_invoice_project_idx
  on portal_invoice (project_id, issued_at desc);

-- One certificate per certification and one receipt per release, so a retry can
-- never produce two documents for the same money.
create unique index if not exists portal_invoice_certificate_once
  on portal_invoice (payment_id) where kind = 'certificate' and status = 'issued';
create unique index if not exists portal_invoice_receipt_once
  on portal_invoice (payment_id) where kind = 'receipt' and status = 'issued';
