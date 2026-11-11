create table if not exists portal_project_team (
  project_id uuid not null references portal_projects (id) on delete cascade,
  staff_user_id text not null references "user" ("id") on delete cascade,
  role_title text not null check (length(btrim(role_title)) between 2 and 80),
  ordinal integer not null default 0,
  assigned_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (project_id, staff_user_id)
);

create index if not exists portal_project_team_project_idx
  on portal_project_team (project_id, ordinal, created_at);
