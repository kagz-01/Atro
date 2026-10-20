-- Presence — the two ways a client stands in the same building, one of them
-- walks it and the other has it walked on camera.
--
-- A client at home and a client abroad share every record in the portal: the
-- contract, the money, the approvals and the decisions are identical work
-- wherever the client sleeps. What they cannot share is the act of being
-- there. The local client asks to attend — a site visit the studio answers
-- with a confirmed slot. The abroad client asks to be shown around — a
-- walkthrough the studio records and delivers as a link. One table, because
-- both are the same conversation (a request for presence, and the studio's
-- answer to it); `kind` separates them rather than two schemas that would
-- drift apart and start disagreeing about what a "request" is.
--
-- Statuses are answered exactly once: a request moves from 'requested' to
-- 'scheduled' (a visit), 'delivered' (a recording) or 'declined', and stays
-- there. The alternative — silently moving a confirmed date after the client
-- was told it — is how a client arrives at a gate nobody expected them at.
-- Changing an answered request is a conversation (Messages) or a new request,
-- never a second write against the row the client was promised.
--
-- `proposed_on` is the client's suggested day (a date, no time: they do not
-- know the programme). `scheduled_at` is the studio's confirmed instant,
-- entered in Nairobi time by whoever answers; it is stored as timestamptz so
-- the portal can print it correctly on any clock. `delivery_url` is where the
-- recording was handed over — validated as an http(s) URL on write, so a
-- half-written link never reaches a client waiting for a look at their build.

create table if not exists portal_presence (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  kind text not null check (kind in ('visit', 'walkthrough')),
  status text not null default 'requested'
    check (status in ('requested', 'scheduled', 'delivered', 'declined')),
  requested_by text not null default '',
  client_note text not null default '',
  proposed_on date,
  scheduled_at timestamptz,
  delivery_url text not null default '',
  staff_note text not null default '',
  responded_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The console opens a project and reads its presence list; newest first is
-- how both panels order it, so the index matches the query.
create index if not exists portal_presence_project_idx
  on portal_presence (project_id, created_at desc);

-- The waiting queue: open requests, per project, per track. Partial, because
-- answered rows are history and history should not bloat a working index.
create index if not exists portal_presence_open_idx
  on portal_presence (project_id, kind)
  where status = 'requested';
