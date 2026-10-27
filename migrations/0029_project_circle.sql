-- Project-circle access is a separate, revocable relationship. It grants no
-- owner identity and is deliberately not represented in portal_projects.user_id.
create table if not exists portal_project_representatives (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  owner_user_id text not null,
  invite_email text not null,
  representative_user_id text,
  token_hash text unique,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'revoked')),
  invited_by text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  check (status <> 'pending' or token_hash is not null),
  check (status <> 'active' or (representative_user_id is not null and accepted_at is not null))
);

create unique index if not exists portal_project_representatives_open_email_idx
  on portal_project_representatives (project_id, lower(invite_email))
  where status in ('pending', 'active');

create index if not exists portal_project_representatives_user_idx
  on portal_project_representatives (representative_user_id, project_id)
  where status = 'active';

create unique index if not exists portal_project_representatives_member_idx
  on portal_project_representatives (project_id, representative_user_id)
  where status = 'active';

create table if not exists portal_project_circle_audit (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  representative_id uuid references portal_project_representatives (id) on delete set null,
  actor_user_id text not null,
  event text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portal_project_circle_audit_project_idx
  on portal_project_circle_audit (project_id, created_at desc);

create table if not exists portal_decision_suggestions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  representative_id uuid not null references portal_project_representatives (id) on delete cascade,
  decision_id uuid not null references portal_decisions (id) on delete cascade,
  suggested_option text not null,
  note text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'dismissed')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists portal_decision_suggestions_pending_idx
  on portal_decision_suggestions (project_id, decision_id, representative_id)
  where status = 'pending';

create index if not exists portal_decision_suggestions_project_idx
  on portal_decision_suggestions (project_id, status, created_at desc);
