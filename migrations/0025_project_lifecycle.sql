-- Project lifecycle is separate from milestone progress. Completing every
-- tracked stage does not, by itself, mean handover or close-out is complete.

alter table portal_projects
  add column if not exists lifecycle_state text not null default 'active_build'
    check (lifecycle_state in (
      'pre_construction',
      'active_build',
      'handover',
      'defects_period',
      'closed',
      'archived'
    ));

create table if not exists portal_project_lifecycle_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  from_state text not null check (from_state in (
    'pre_construction', 'active_build', 'handover', 'defects_period', 'closed', 'archived'
  )),
  to_state text not null check (to_state in (
    'pre_construction', 'active_build', 'handover', 'defects_period', 'closed', 'archived'
  )),
  reason text not null,
  changed_by text not null,
  changed_at timestamptz not null default now()
);

create index if not exists portal_project_lifecycle_history_project_idx
  on portal_project_lifecycle_history (project_id, changed_at desc);
