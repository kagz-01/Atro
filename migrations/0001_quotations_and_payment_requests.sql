-- Quotations may be created from an enquiry before a project exists. Once the
-- enquiry converts, the immutable document is attached to that project.
alter table portal_invoice
  alter column project_id drop not null;

alter table portal_invoice
  add column if not exists enquiry_id uuid references enquiries (id) on delete set null,
  add column if not exists valid_until date,
  add column if not exists etims_reference text not null default '';

alter table portal_invoice
  drop constraint if exists portal_invoice_kind_check,
  add constraint portal_invoice_kind_check
    check (kind in ('quotation', 'certificate', 'payment_request', 'invoice', 'receipt', 'statement'));

alter table portal_invoice
  drop constraint if exists portal_invoice_status_check,
  add constraint portal_invoice_status_check
    check (status in ('issued', 'accepted', 'declined', 'expired', 'void'));

alter table portal_invoice
  add constraint portal_invoice_has_owner_check
    check (project_id is not null or enquiry_id is not null);

create index if not exists portal_invoice_enquiry_idx
  on portal_invoice (enquiry_id, issued_at desc)
  where enquiry_id is not null;

create unique index if not exists portal_invoice_payment_request_once
  on portal_invoice (payment_id)
  where kind = 'payment_request' and status = 'issued' and payment_id is not null;
