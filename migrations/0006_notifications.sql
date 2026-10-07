-- Notification outbox.
--
-- A staff post must never fail because a provider is down, misconfigured or
-- missing, so every notification is written here first and delivered afterwards.
-- One row per (project, channel): if WhatsApp is not configured the row is
-- recorded as `skipped`, not lost, and it can be retried once credentials exist.

create table if not exists portal_notification (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  channel text not null check (channel in ('inapp', 'email', 'whatsapp', 'sms')),
  audience text not null default 'client' check (audience in ('client', 'studio')),
  kind text not null,
  title text not null,
  body text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'skipped', 'failed')),
  attempts integer not null default 0,
  detail text not null default '',
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists portal_notification_project_idx
  on portal_notification (project_id, created_at desc);
create index if not exists portal_notification_pending_idx
  on portal_notification (status, created_at);

-- Where to reach the client. The email comes from the signed-in account; a
-- phone number is only ever used by ATRO or by the client themselves.
alter table portal_projects add column if not exists client_phone text not null default '';
