-- The office manager has an explicit operational identity in the studio
-- allowlist. Their authority remains non-admin: existing server guards keep
-- financial, lifecycle, and access-management writes admin-only.

alter table client_role
  drop constraint if exists client_role_role_check;

alter table client_role
  add constraint client_role_role_check
    check (role in ('staff', 'office_manager', 'admin'));
