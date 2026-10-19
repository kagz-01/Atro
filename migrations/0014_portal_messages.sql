-- Messages: the conversation, kept on the record.
--
-- A client abroad writing to their project manager has until now meant WhatsApp:
-- a thread that scrolls away, changes phone, and leaves nobody able to show what
-- was agreed last March. This is the same conversation, but it belongs to the
-- project, so it survives staff changes and can be read by anyone working on
-- the job.
--
-- `ord` fixes the order. Relying on created_at alone would let two messages
-- written in the same millisecond swap places, and a conversation that
-- reorders itself is not one anybody trusts.
--
-- `read_at` is recipient-side: it is set when the OTHER side opens the message.
-- One timestamp therefore answers both questions that matter — has the studio
-- seen the client's question, and has the client seen the reply — without two
-- flags that could disagree with each other. It is deliberately not per-viewer
-- beyond those two sides: this is a two-party record, not a shared inbox.

create table if not exists portal_message (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  ord integer not null,
  author_role text not null check (author_role in ('client', 'studio')),
  author_id text not null default '',
  -- Displayed name. Falls back to a role label when empty, so a message is
  -- never attributed to a blank line.
  author_label text not null default '',
  body text not null,
  created_at timestamptz not null default now(),
  -- When the other side opened it. Null means still unread.
  read_at timestamptz,
  unique (project_id, ord)
);

create index if not exists portal_message_project_idx
  on portal_message (project_id, ord);

-- The inbox badge reads this: unread messages authored by clients, across all
-- projects. Without it the studio would scan every project to find who wrote in.
create index if not exists portal_message_unread_idx
  on portal_message (author_role, read_at) where read_at is null;
