-- Step 16 — integrity: the two holes a client could fall through.
--
-- approval_ready: the portal's Approve button used to work on any active or
-- blocked stage, so a client could mark work complete that the studio had not
-- finished. The studio now decides when a stage is ready to be approved; the
-- button only appears once they have.
--
-- deleted_at: a client's "delete" used to be a hard DELETE — every message,
-- certificate and photograph cascaded away with no trace. It is now an
-- archive: the row stays for the studio's record and leaves the client's view.

alter table portal_milestones
  add column if not exists approval_ready boolean not null default false;

alter table portal_projects
  add column if not exists deleted_at timestamptz;
