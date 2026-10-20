-- How to pay, in the two ways a client actually pays a Kenyan studio.
--
-- One row per (project, kind): `local` is what a client in the country uses —
-- an M-Pesa paybill and a local bank account; `international` is what a
-- diaspora client's bank needs — SWIFT, branch, the reference to quote. The
-- studio types both into the console; the portal shows the one that matches
-- how far away the client lives, so nobody is handed wire instructions they
-- cannot use or a paybill that only works from inside Kenya.
--
-- Both columns of text are staff-entered prose on purpose: these details
-- change with the studio's bankers, and a form of labelled fields would only
-- pretend otherwise. An empty body means the studio has not published that
-- kind yet, and the portal panel stays absent rather than promising.

create table if not exists portal_payment_instructions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  kind text not null check (kind in ('local', 'international')),
  body text not null default '',
  updated_at timestamptz not null default now(),
  unique (project_id, kind)
);
