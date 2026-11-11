create table if not exists portal_client_document (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  user_id text not null,
  title text not null,
  category text not null check (
    category in ('Identity', 'Ownership', 'Plans', 'Permits', 'Payment', 'Other')
  ),
  filename text not null,
  mime text not null,
  size_bytes integer not null check (size_bytes > 0),
  storage_path text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'submitted', 'reviewing', 'accepted', 'needs_changes')),
  staff_note text not null default '',
  reviewed_by text,
  reviewed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_client_document_project_idx
  on portal_client_document (project_id, created_at desc)
  where deleted_at is null;
