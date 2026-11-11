create table if not exists portal_calendar_request (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  requested_by text not null,
  title text not null,
  kind text not null check (kind in ('meeting', 'other')),
  note text not null default '',
  proposed_at timestamptz not null,
  scheduled_at timestamptz,
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'declined')),
  staff_note text not null default '',
  responded_by text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_calendar_request_project_idx
  on portal_calendar_request (project_id, created_at desc);
