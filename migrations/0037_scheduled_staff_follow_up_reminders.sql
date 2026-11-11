create table if not exists staff_follow_up_reminder (
  id uuid primary key default gen_random_uuid(),
  follow_up_id uuid not null references staff_follow_up (id) on delete cascade,
  due_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed', 'skipped', 'cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(),
  claim_expires_at timestamptz,
  detail text not null default '',
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (follow_up_id, due_date)
);

create index if not exists staff_follow_up_reminder_due_idx
  on staff_follow_up_reminder (status, next_attempt_at)
  where status in ('pending', 'sending');

create index if not exists staff_follow_up_reminder_follow_up_idx
  on staff_follow_up_reminder (follow_up_id, due_date);
