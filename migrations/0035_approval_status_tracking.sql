alter table portal_approval
  add column if not exists status_updated_at timestamptz;

update portal_approval
set status_updated_at = updated_at
where status_updated_at is null;

alter table portal_approval
  alter column status_updated_at set default now(),
  alter column status_updated_at set not null;
