-- Provisioning: opening a project before the client has an account, and staff
-- access that a real person can actually obtain.
--
-- A studio opens a project for a client who has never signed in. The row waits
-- for them: `claimed_email` records who it belongs to, and the first sign-in
-- with that address takes ownership. That is what makes an enquiry convertible
-- without asking the client to sign up before we have decided to work with
-- them.

alter table portal_projects add column if not exists claimed_email text not null default '';

create index if not exists portal_projects_claim_idx on portal_projects (claimed_email);

-- Enquiries become the top of a real funnel rather than a read-only inbox.
alter table enquiries add column if not exists status text not null default 'new';
alter table enquiries add column if not exists project_id uuid;
alter table enquiries add column if not exists updated_at timestamptz not null default now();

create index if not exists enquiries_status_idx on enquiries (status, created_at desc);

-- Someone who has signed in but cannot reach the studio console can ask for it.
create table if not exists staff_request (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  decided_by text not null default '',
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
