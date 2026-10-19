-- Evidence photographs: the picture that proves a stage happened.
--
-- `portal_milestones.evidence` holds dated notes about a stage. It cannot hold
-- a photograph — jsonb has nowhere to put bytes — so the pictures live in their
-- own table and are read against the milestone they prove.
--
-- The photograph is stored in Postgres rather than object storage for the same
-- reason the avatar is: no storage credentials are configured, and the browser
-- has already resized it to a JPEG under 900 KB. When a bucket is available
-- this file changes and the column becomes a url.
--
-- `taken_on` is when the photograph was shot, not when it was uploaded. A
-- photograph of a slab posted a week later is still evidence of a slab, and the
-- date the work happened is the date that matters to the client.

create table if not exists portal_evidence_photo (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portal_projects (id) on delete cascade,
  milestone_id uuid not null references portal_milestones (id) on delete cascade,
  -- Position among the photographs of this stage, so they do not reshuffle on
  -- upload order across a session.
  ord integer not null default 1,
  -- A caption that says what is in the frame. "Photo 1" is not evidence, and
  -- src/lib/evidence.ts refuses it.
  caption text not null,
  detail text not null default '',
  taken_on text not null default '',
  mime text not null default 'image/jpeg',
  bytes bytea,
  -- Which member of the studio uploaded it, so an unexplained photograph has a
  -- name attached to it.
  uploaded_by text not null default '',
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (milestone_id, ord)
);

create index if not exists portal_evidence_photo_project_idx
  on portal_evidence_photo (project_id, milestone_id, ord);
