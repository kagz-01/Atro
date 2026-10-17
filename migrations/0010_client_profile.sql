-- The client's own record, once, instead of a copy on every project.
--
-- Until now a client typed their name, city and timezone into each project, so
-- someone with two projects had two spellings of themselves and a change of
-- address only landed on one of them. This is the single record; projects keep
-- their denormalised copies for the historical record but fall back to it.

create table if not exists client_profile (
  user_id text primary key,
  display_name text not null default '',
  initials text not null default '',
  phone text not null default '',
  email text not null default '',
  city text not null default '',
  country text not null default '',
  timezone text not null default '',
  client_type text not null default 'individual'
    check (client_type in ('individual', 'owner', 'diaspora', 'developer', 'agent')),
  company text not null default '',
  about text not null default '',
  language text not null default 'en',
  -- Which channels the studio may use. A number is only ever texted if the
  -- client asked for it, so this is a record of consent rather than a setting.
  notify_email boolean not null default true,
  notify_sms boolean not null default false,
  notify_whatsapp boolean not null default true,
  site_photo_consent boolean not null default true,
  referral_source text not null default '',
  -- The picture lives here rather than in object storage: the project has no
  -- storage credentials configured yet, and a client avatar is small enough to
  -- keep in Postgres. Migrating to a bucket later is a change to the two
  -- functions in src/lib/profile-server.ts and nothing else.
  avatar_mime text not null default '',
  avatar_bytes bytea,
  avatar_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Names are not unique and a client is not identified by one, so this is for
-- the studio's "search by client" only.
create index if not exists client_profile_name_idx on client_profile (lower(display_name));
