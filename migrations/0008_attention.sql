-- Attention sweeping: reminders and the studio digest.
--
-- There is no scheduler in this deployment, so the sweep runs when staff open
-- the console. That is a trigger, not a guarantee, so the sweep is idempotent:
-- a `dedupe_key` on each notification row makes "one reminder per decision per
-- window" a database constraint rather than a hope. When a real scheduler
-- exists it calls exactly the same function and nothing else changes.
--
-- The digest is capped at one per day per studio by the same mechanism, so
-- opening the console forty times does not send forty emails.

alter table portal_notification
  add column if not exists dedupe_key text;

-- When a stage last changed state, so "blocked for N days" is measurable rather
-- than measured from whenever the row was created.
alter table portal_milestones
  add column if not exists updated_at timestamptz not null default now();

-- Partial unique index: the same key can be reused once the first message is
-- void or has aged out, but never twice while one is live.
create unique index if not exists portal_notification_dedupe
  on portal_notification (dedupe_key)
  where dedupe_key is not null and status in ('pending', 'sent');

-- Who to tell. The studio's own addresses, from the role allowlist.
create table if not exists studio_contact (
  email text primary key,
  label text not null default 'ATRO',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into studio_contact (email, label) values
  ('hello@atro.ke', 'Studio inbox')
on conflict (email) do nothing;
