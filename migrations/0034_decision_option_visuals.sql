alter table portal_decisions
  add column if not exists option_details jsonb not null default '[]'::jsonb,
  add column if not exists creation_key uuid;

create unique index if not exists portal_decisions_creation_key_idx
  on portal_decisions (creation_key)
  where creation_key is not null;

create table if not exists portal_decision_visual (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  decision_id uuid references portal_decisions (id) on delete cascade,
  draft_key uuid,
  option_index integer not null check (option_index between 0 and 5),
  caption text not null default '',
  filename text not null,
  mime text not null check (mime in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer not null check (size_bytes > 0),
  storage_path text not null unique,
  status text not null default 'pending' check (status in ('pending', 'ready', 'deleting')),
  created_by text not null,
  created_at timestamptz not null default now(),
  check (
    (decision_id is null and draft_key is not null)
    or (decision_id is not null and draft_key is null)
  )
);

create unique index if not exists portal_decision_visual_draft_option_idx
  on portal_decision_visual (project_id, draft_key, option_index)
  where decision_id is null;

create unique index if not exists portal_decision_visual_decision_option_idx
  on portal_decision_visual (decision_id, option_index)
  where decision_id is not null;

create index if not exists portal_decision_visual_project_decision_idx
  on portal_decision_visual (project_id, decision_id, option_index)
  where decision_id is not null;
