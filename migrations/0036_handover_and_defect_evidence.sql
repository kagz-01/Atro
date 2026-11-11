alter table portal_projects
  add column if not exists handed_over_on text not null default '';

create table if not exists portal_handover_document (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  title text not null check (length(btrim(title)) between 2 and 120),
  category text not null check (
    category in (
      'executed_agreement',
      'handover_certificate',
      'warranty',
      'manual',
      'as_built',
      'inspection',
      'final_account',
      'other'
    )
  ),
  filename text not null,
  mime text not null,
  size_bytes integer not null check (size_bytes > 0),
  storage_path text not null unique,
  uploaded_by text not null,
  uploaded_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'ready')),
  received_at timestamptz,
  received_by text
);

create index if not exists portal_handover_document_project_idx
  on portal_handover_document (project_id, uploaded_at desc)
  where status = 'ready';

create table if not exists portal_defect_evidence (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  defect_id uuid not null references portal_defect (id) on delete cascade,
  filename text not null,
  mime text not null,
  size_bytes integer not null check (size_bytes > 0),
  storage_path text not null unique,
  uploaded_by text not null,
  uploaded_by_role text not null check (uploaded_by_role in ('client', 'staff')),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'ready'))
);

create index if not exists portal_defect_evidence_defect_idx
  on portal_defect_evidence (defect_id, created_at)
  where status = 'ready';

create table if not exists portal_defect_event (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  defect_id uuid not null references portal_defect (id) on delete cascade,
  status text not null check (
    status in ('reported', 'accepted', 'in_progress', 'fixed', 'verified', 'rejected')
  ),
  note text not null default '',
  actor text not null,
  actor_role text not null check (actor_role in ('client', 'staff')),
  created_at timestamptz not null default now()
);

create index if not exists portal_defect_event_defect_idx
  on portal_defect_event (defect_id, created_at);
