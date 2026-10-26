alter table portal_decisions
  add column if not exists due_date date;

create table if not exists staff_follow_up (
  id uuid primary key default gen_random_uuid(),
  assigned_to text not null,
  created_by text not null,
  project_id uuid references portal_projects (id) on delete cascade,
  title text not null,
  due_date date not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists staff_follow_up_assignee_due_idx
  on staff_follow_up (assigned_to, due_date)
  where completed_at is null;

create table if not exists portal_weekly_update_checklist (
  project_id uuid not null references portal_projects (id) on delete cascade,
  week_start date not null,
  progress_reviewed boolean not null default false,
  evidence_reviewed boolean not null default false,
  client_updated boolean not null default false,
  updated_by text not null default '',
  updated_at timestamptz not null default now(),
  primary key (project_id, week_start)
);
