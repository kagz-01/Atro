-- Variations — the priced change, and the record that the contract moved.
--
-- Selections record what a client chose against an allowance. This records the
-- only step that may change the contract sum: a price put to the client, and
-- their answer to it. There is deliberately no edit path — once approved,
-- declined or withdrawn a variation is settled, and a second thought is a new
-- row. The history of a contract should read as a chain of decisions, not as
-- numbers that were quietly different last month.
--
-- `amount` is signed: positive adds to the contract, negative credits it. Real
-- changes cut both ways, and a credit recorded as a positive number is how a
-- client ends up arguing about a saving they never received.
--
-- `days` is the agreed time impact carried alongside the price. A variation
-- that changes cost and not programme is a variation somebody will argue about
-- later; the programme itself is still the studio's to move, but the agreed
-- impact is on the record here where the price is.
--
-- `source_kind`/`source_id` link a variation back to the selection it came
-- from, so the client sees "from your choice: Kitchen worktop" rather than an
-- unexplained figure, and the studio cannot raise the same overage twice.
--
-- `decision_note` is the client's note when they decide, and the studio's
-- stated reason when it withdraws — withdrawal is refused server-side without
-- one, because a change that vanishes without explanation is how trust goes.

create table if not exists portal_variation (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  ord integer not null,
  title text not null,
  detail text not null default '',
  reason text not null default '',
  source_kind text not null default 'studio'
    check (source_kind in ('selection', 'studio')),
  source_id uuid,
  amount bigint not null default 0,
  days integer not null default 0,
  status text not null default 'proposed'
    check (status in ('proposed', 'approved', 'declined', 'withdrawn')),
  proposed_on text not null default '',
  decided_on text not null default '',
  decision_note text not null default '',
  decided_by text not null default ''
    check (decided_by in ('', 'client', 'studio')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, ord)
);

create index if not exists portal_variation_project_idx
  on portal_variation (project_id, ord);

-- The studio's overview asks "what money is waiting on a client" — answered by
-- the proposed rows alone.
create index if not exists portal_variation_proposed_idx
  on portal_variation (project_id) where status = 'proposed';
