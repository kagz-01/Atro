-- After handover: defects and the annual care fee.
--
-- The defect period is the promise that outlives the final payment: for a set
-- window after handover, work that was wrong is the studio's to put right. Its
-- value is entirely in the date — a period nobody can see is a period that gets
-- argued about — so it lives on the project as an explicit column rather than
-- being derived from a milestone that may or may not have been marked complete.
--
-- A defect carries the three moments that matter: when it was reported, when it
-- was accepted, when it was fixed. `fixed` is not `verified`: the studio does
-- not get to close its own homework. The client confirms the fix, and only then
-- is the record closed.
--
-- `reject_reason` is required by the application whenever the status is
-- `rejected`. "Not covered" with no explanation is how a defect period becomes
-- a complaint; the reason is what makes declining defensible.

create table if not exists portal_defect (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  ord integer not null,
  title text not null,
  detail text not null default '',
  -- The room or element, so a list of eight items is readable at a glance.
  area text not null default '',
  severity text not null default 'minor' check (severity in ('minor', 'major', 'urgent')),
  status text not null default 'reported'
    check (status in ('reported', 'accepted', 'in_progress', 'fixed', 'verified', 'rejected')),
  reported_on text not null default '',
  accepted_on text not null default '',
  fixed_on text not null default '',
  verified_on text not null default '',
  reject_reason text not null default '',
  -- The studio's words about it. A status change with no note leaves the client
  -- reading a colour instead of an answer.
  note text not null default '',
  reported_by text not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, ord)
);

create index if not exists portal_defect_project_idx
  on portal_defect (project_id, ord);

-- The yearly fee. One row per project: there is only ever one care plan on a
-- house, and a second row would mean two renewal dates for the same roof.
create table if not exists portal_retainer (
  project_id uuid primary key references portal_projects (id) on delete cascade,
  name text not null default 'Annual care',
  covers text not null default '',
  annual_amount bigint not null default 0,
  renews_on text not null default '',
  status text not null default 'active' check (status in ('active', 'lapsed', 'cancelled')),
  last_paid_on text not null default '',
  updated_at timestamptz not null default now()
);

-- The defect window itself, set by the studio when the keys are handed over.
alter table portal_projects
  add column if not exists defect_period_ends text not null default '';
