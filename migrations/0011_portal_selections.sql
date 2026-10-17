-- Selections: the priced choice a client makes against a budget line.
--
-- A roof, a kitchen top, a floor finish — each one carries an allowance in the
-- contract and two or three options with real prices. The client chooses in
-- their own time, and the choice is recorded with a date.
--
-- A choice never edits the contract. If the option lands over the allowance,
-- the excess becomes a variation for the studio to price and the client to
-- approve — deliberately, with a human in the loop. That is the whole point:
-- the alternative is an end-of-job surprise, or a portal that quietly spends a
-- client's money on their behalf.

create table if not exists portal_selection (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  ord integer not null,
  title text not null,
  category text not null default 'Finish',
  stage text not null default '',
  -- Money set aside in the contract for this item. 0 means the studio has not
  -- fixed a figure yet, which reads differently from a real zero.
  allowance_amount bigint not null default 0,
  deadline text not null default '',
  status text not null default 'open' check (status in ('open', 'chosen', 'closed')),
  chosen_option_id uuid,
  chosen_at timestamptz,
  chosen_by text not null default '',
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (project_id, ord)
);

create table if not exists portal_selection_option (
  id uuid primary key default gen_random_uuid(),
  selection_id uuid not null references portal_selection (id) on delete cascade,
  ord integer not null,
  label text not null,
  description text not null default '',
  supplier text not null default '',
  -- An absolute total, never a delta: a number the client can check against
  -- what they were quoted.
  price bigint not null default 0,
  lead_time text not null default '',
  recommended boolean not null default false,
  unique (selection_id, ord)
);

create index if not exists portal_selection_project_idx
  on portal_selection (project_id, ord);
