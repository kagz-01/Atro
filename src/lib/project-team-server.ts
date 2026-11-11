import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { accountMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/staff-session.server";

const ProjectIdInput = z.object({ projectId: z.string().min(1) });
const TeamAssignmentsInput = z.object({
  projectId: z.string().min(1),
  assignments: z
    .array(
      z.object({
        staffUserId: z.string().min(1),
        roleTitle: z.string().trim().min(2).max(80),
      }),
    )
    .max(12)
    .refine(
      (assignments) =>
        new Set(assignments.map((assignment) => assignment.staffUserId)).size ===
        assignments.length,
      "A staff member can only be listed once.",
    ),
});

export type ProjectTeamMember = {
  staffUserId: string;
  displayName: string;
  roleTitle: string;
};

export type ProjectTeamAdminPayload = {
  assignments: (ProjectTeamMember & { activeStaff: boolean })[];
  staffOptions: { userId: string; displayName: string }[];
  canEdit: boolean;
};

async function readAdminProjectTeam(
  sql: Awaited<ReturnType<typeof getSql>>,
  projectId: string,
): Promise<ProjectTeamAdminPayload> {
  const [project] = await sql<{ lifecycle_state: string }>`
    select lifecycle_state from portal_projects
    where id = ${projectId} and source <> 'sample' and deleted_at is null
    limit 1
  `;
  if (!project) throw new Error("Project not found.");

  const [assignments, staffOptions] = await Promise.all([
    sql<{
      staff_user_id: string;
      display_name: string;
      role_title: string;
      active_staff: boolean;
    }>`
      select t.staff_user_id,
        coalesce(nullif(trim(s.display_name), ''), nullif(trim(u.name), ''), 'Former staff member')
          as display_name,
        t.role_title,
        (r.email is not null) as active_staff
      from portal_project_team t
      left join "user" u on u.id = t.staff_user_id
      left join staff_profile s on s.user_id = t.staff_user_id
      left join client_role r on lower(r.email) = lower(u.email)
        and r.role in ('staff', 'office_manager', 'admin')
      where t.project_id = ${projectId}
      order by t.ordinal, t.created_at
    `,
    sql<{
      user_id: string;
      display_name: string;
    }>`
      select u.id as user_id, s.display_name
      from client_role r
      join "user" u on lower(u.email) = lower(r.email)
      left join staff_profile s on s.user_id = u.id
      where r.role in ('staff', 'office_manager', 'admin')
        and nullif(trim(s.display_name), '') is not null
      order by display_name
    `,
  ]);

  return {
    assignments: assignments.map((row) => ({
      staffUserId: row.staff_user_id,
      displayName: row.display_name,
      roleTitle: row.role_title,
      activeStaff: row.active_staff,
    })),
    staffOptions: staffOptions.map((row) => ({
      userId: row.user_id,
      displayName: row.display_name,
    })),
    canEdit: !["closed", "archived"].includes(project.lifecycle_state),
  };
}

export const getClientProjectTeam = createServerFn({ method: "GET" })
  .validator(ProjectIdInput)
  .middleware([accountMiddleware])
  .handler(async ({ context, data }): Promise<ProjectTeamMember[]> => {
    const sql = await getSql();
    const [project] = await sql<{ id: string }>`
      select id from portal_projects
      where id = ${data.projectId} and user_id = ${context.userId}
        and source <> 'sample' and deleted_at is null
      limit 1
    `;
    if (!project) throw new Error("Project not found.");

    const rows = await sql<{
      staff_user_id: string;
      display_name: string;
      role_title: string;
    }>`
      select t.staff_user_id, s.display_name, t.role_title
      from portal_project_team t
      join portal_projects p on p.id = t.project_id and p.user_id = ${context.userId}
      join "user" u on u.id = t.staff_user_id
      join client_role r on lower(r.email) = lower(u.email)
        and r.role in ('staff', 'office_manager', 'admin')
      left join staff_profile s on s.user_id = u.id
      where t.project_id = ${data.projectId} and p.source <> 'sample'
        and p.deleted_at is null
        and nullif(trim(s.display_name), '') is not null
      order by t.ordinal, t.created_at
    `;
    return rows.map((row) => ({
      staffUserId: row.staff_user_id,
      displayName: row.display_name,
      roleTitle: row.role_title,
    }));
  });

export const getAdminProjectTeam = createServerFn({ method: "GET" })
  .validator(ProjectIdInput)
  .handler(async ({ data }): Promise<ProjectTeamAdminPayload> => {
    await requireAdmin("manage-project-team");
    const sql = await getSql();
    return readAdminProjectTeam(sql, data.projectId);
  });

export const saveAdminProjectTeam = createServerFn({ method: "POST" })
  .validator(TeamAssignmentsInput)
  .handler(async ({ data }): Promise<ProjectTeamAdminPayload> => {
    const admin = await requireAdmin("manage-project-team");
    const sql = await getSql();
    const [project] = await sql<{ lifecycle_state: string }>`
      select lifecycle_state from portal_projects
      where id = ${data.projectId} and source <> 'sample' and deleted_at is null
      limit 1
    `;
    if (!project) throw new Error("Project not found.");
    if (["closed", "archived"].includes(project.lifecycle_state)) {
      throw new Error("The project team cannot be changed after a project is closed.");
    }

    const userIds = data.assignments.map((assignment) => assignment.staffUserId);
    if (userIds.length > 0) {
      const activeStaff = await sql<{ user_id: string }>`
        select u.id as user_id
        from client_role r
        join "user" u on lower(u.email) = lower(r.email)
        join staff_profile s on s.user_id = u.id and nullif(trim(s.display_name), '') is not null
        where u.id = any(${userIds}::text[]) and r.role in ('staff', 'office_manager', 'admin')
      `;
      if (activeStaff.length !== userIds.length) {
        throw new Error("Choose active staff members with a completed name in their profile.");
      }
    }

    await sql.query(
      `with incoming as (
         select staff_user_id, role_title, ordinal
         from jsonb_to_recordset($2::jsonb) as incoming_row(
           staff_user_id text, role_title text, ordinal integer
         )
       ),
       removed as (
         delete from portal_project_team t
         where t.project_id = $1
           and not exists (
             select 1 from incoming i where i.staff_user_id = t.staff_user_id
           )
       )
       insert into portal_project_team (
         project_id, staff_user_id, role_title, ordinal, assigned_by
       )
       select $1, i.staff_user_id, i.role_title, i.ordinal, $3
       from incoming i
       on conflict (project_id, staff_user_id) do update set
         role_title = excluded.role_title,
         ordinal = excluded.ordinal,
         assigned_by = excluded.assigned_by,
         updated_at = now()`,
      [
        data.projectId,
        JSON.stringify(
          data.assignments.map((assignment, ordinal) => ({
            staff_user_id: assignment.staffUserId,
            role_title: assignment.roleTitle,
            ordinal,
          })),
        ),
        admin.userId,
      ],
    );

    return readAdminProjectTeam(sql, data.projectId);
  });
