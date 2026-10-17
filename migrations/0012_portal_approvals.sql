-- Approvals: the paperwork between a plot and a building.
--
-- Planning consent, environmental impact, the contractor's registration, the
-- county permit, water and power. To a client in another country this is the
-- part they cannot do and cannot see, and it is the part that silently holds a
-- project up for months.
--
-- The fees are tracked because they are real money that leaves a build budget
-- — permits alone run from KES 50,000 to 300,000 — and because approvals handled
-- for a fee is a line the studio can invoice.

create table if not exists portal_approval (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  ord integer not null,
  kind text not null default 'county',
  title text not null,
  authority text not null default '',
  reference text not null default '',
  status text not null default 'not_started'
    check (status in ('not_started', 'submitted', 'under_review', 'approved', 'rejected', 'not_required')),
  submitted_on text not null default '',
  decided_on text not null default '',
  fee_amount bigint not null default 0,
  fee_paid bigint not null default 0,
  -- True when this holds up the next stage of the build.
  blocking boolean not null default false,
  -- When the studio last chased the authority, so it is not chased twice.
  chased_on text not null default '',
  chase_note text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, ord)
);

create index if not exists portal_approval_project_idx
  on portal_approval (project_id, ord);
