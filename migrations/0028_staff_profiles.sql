-- Staff-authored personal details are separate from the owner-controlled
-- email-keyed access list. A profile must never grant or change a staff role.
create table if not exists staff_profile (
  user_id text primary key,
  display_name text not null default '',
  work_focus text not null default '',
  timezone text not null default 'Africa/Nairobi',
  updated_at timestamptz not null default now()
);
