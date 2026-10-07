-- Service track on a project.
--
-- A project used to imply the nine-stage build path. ATRO also sells design,
-- advisory, specialist and post-construction work, so the shape of the
-- engagement is now data: `track` selects the milestone template and the payment
-- schedule, and `service_slug` records which service in the registry it is.
--
-- Existing rows default to the build track, which is what they already are.

alter table portal_projects add column if not exists track text not null default 'construction';
alter table portal_projects add column if not exists service_slug text not null default '';

create index if not exists portal_projects_track_idx on portal_projects (track);
