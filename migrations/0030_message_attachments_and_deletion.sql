-- Chat attachments are private project records, and deleted messages retain
-- an audit tombstone while releasing any stored attachment bytes.

alter table portal_message
  add column if not exists deleted_at timestamptz;

create table if not exists portal_message_attachment (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references portal_message (id) on delete cascade,
  filename text not null,
  mime text not null,
  size_bytes integer not null check (size_bytes > 0),
  storage_path text not null unique,
  status text not null default 'pending' check (status in ('pending', 'ready')),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists portal_message_attachment_message_idx
  on portal_message_attachment (message_id, created_at);
