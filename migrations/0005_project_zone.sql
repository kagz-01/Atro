-- Which county a project sits in.
--
-- The enquiries form already asks for a zone, so a project that never recorded
-- one could not be counted against delivery capacity. Workload and pipeline both
-- group by it, and `/zones` already knows which counties are active, limited or
-- by request.

alter table portal_projects add column if not exists zone text not null default '';

create index if not exists portal_projects_zone_idx on portal_projects (zone);
