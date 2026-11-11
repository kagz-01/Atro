alter table portal_message
  add column if not exists reply_to_id uuid references portal_message (id) on delete set null;

create table if not exists portal_message_reaction (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references portal_message (id) on delete cascade,
  role text not null check (role in ('client', 'studio')),
  user_id text not null,
  emoji text not null check (emoji in ('👍', '❤️', '😂', '😮', '🙏', '🎉')),
  created_at timestamptz not null default now(),
  unique (message_id, role, user_id)
);

create index if not exists portal_message_reaction_message_idx
  on portal_message_reaction (message_id);
