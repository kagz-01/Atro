-- ATRO staff capability.
--
-- A `client_role` row is the ONLY thing that grants staff powers over other
-- people's projects. It is keyed on the Better Auth account's own email, which
-- means a role can never be claimed at sign-up: signing in with an unlisted
-- address simply yields no row, so `hasStaffRole` is false. There is no
-- self-service path to elevation.
--
-- Seeded by ATRO directly (insert below), which is what keeps it an allowlist
-- rather than a flag a visitor could set.

create table if not exists client_role (
  email text primary key,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists staff_note (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  author_id text not null,
  author_label text not null default 'ATRO',
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists staff_note_project_idx on staff_note (project_id, created_at desc);
-- The studio's own accounts. ATRO maintains this list; nobody can add themselves.
-- The owner address is the one the enquiries inbox already publishes.
insert into client_role (email, role, note) values
  ('hello@atro.ke', 'admin', 'Studio owner — full access')
on conflict (email) do nothing;
