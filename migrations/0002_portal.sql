-- ATRO client portal — per-user project records.
--
-- One row per project owned by one signed-in client (`user_id` is Better Auth's
-- TEXT id — the preview dev user is the string 'dev-user'). Every read and write
-- in src/lib/diaspora/server.ts is scoped by that column through authMiddleware.

create table if not exists portal_projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  reference text not null,
  title text not null,
  client_label text not null default '',
  client_initials text not null default '',
  client_city text not null default '',
  client_tz text not null default '',
  plot text not null default '',
  area text not null default '',
  contract_type text not null default 'Design and build',
  started_label text not null default '',
  target_label text not null default '',
  stage text not null default '',
  source text not null default 'sample',
  contract_value bigint not null default 0,
  boq_value bigint not null default 0,
  certified_to_date bigint not null default 0,
  paid_to_date bigint not null default 0,
  currently_certified bigint not null default 0,
  retention_held bigint not null default 0,
  retention_pct integer not null default 5,
  projected_at_completion bigint not null default 0,
  days_elapsed integer not null default 0,
  days_total integer not null default 0,
  days_remaining integer not null default 0,
  on_track boolean not null default true,
  variance_days integer not null default 0,
  programme_note text not null default '',
  next_call_when text not null default '',
  next_call_local text not null default '',
  next_call_agenda jsonb not null default '[]'::jsonb,
  progress integer not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_projects_user_idx on portal_projects (user_id);

create table if not exists portal_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  ord integer not null,
  stage text not null default '',
  name text not null,
  status text not null default 'pending' check (status in ('complete', 'active', 'pending', 'blocked')),
  progress integer not null default 0,
  planned_start text not null default '',
  planned_end text not null default '',
  actual_end text,
  summary text not null default '',
  evidence jsonb not null default '[]'::jsonb,
  verified_by text,
  approved_at timestamptz,
  approved_by text,
  unique (project_id, ord)
);

create table if not exists portal_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  ord integer not null,
  label text not null,
  stage text not null default '',
  amount bigint not null default 0,
  status text not null default 'scheduled' check (status in ('paid', 'certified', 'due', 'scheduled', 'retained')),
  due_date text not null default '',
  paid_date text,
  certificate text,
  method text,
  note text,
  unique (project_id, ord)
);

create table if not exists portal_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  ord integer not null,
  name text not null,
  category text not null default 'Report',
  issued text not null default '',
  reference text not null default '',
  size text not null default '',
  state text not null default 'awaiting' check (state in ('verified', 'signed', 'awaiting')),
  unique (project_id, ord)
);

create table if not exists portal_decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  ord integer not null,
  date text not null default '',
  title text not null,
  detail text not null default '',
  options jsonb not null default '[]'::jsonb,
  chosen text,
  cost_impact bigint not null default 0,
  state text not null default 'open' check (state in ('open', 'awaiting-client', 'decided')),
  decided_at timestamptz,
  unique (project_id, ord)
);

create table if not exists portal_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  kind text not null default 'note',
  title text not null,
  body text not null default '',
  at timestamptz not null default now()
);

create index if not exists portal_activity_project_idx on portal_activity (project_id, at desc);
