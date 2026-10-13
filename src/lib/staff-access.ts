// ATRO studio access — who can reach the console, and how they get there.
//
// The allowlist alone is a chicken-and-egg problem: the first admin has to be
// seeded with an email that can actually sign in through the broker. So there is
// a request path as well — sign in, ask for access, an existing admin approves
// with one click. The allowlist still only ever changes by an admin decision.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/verify.server";
import { demotesLastAdmin } from "@/lib/staff-access-rules";
import { lookupRole, normaliseEmail, type StaffIdentity, type StaffRole } from "@/lib/staff";

export type StaffMember = {
  email: string;
  role: StaffRole;
  note: string;
  since: string;
};

export type StaffRequest = {
  id: string;
  email: string;
  name: string;
  note: string;
  status: string;
  createdAt: string;
};

async function requireStaffIdentity(): Promise<StaffIdentity> {
  const user = await getSessionUser();
  if (!user) throw new Error("Sign in to continue.");
  const role = await lookupRole(await getSql(), user.email);
  if (!role) throw new Error("This area is for ATRO staff.");
  return { userId: user.id, email: normaliseEmail(user.email), role };
}

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const row = await sql<{ email: string; name: string }>`
      select email, name from "user" where id = ${context.userId} limit 1
    `;
    const email = normaliseEmail(row[0]?.email);
    const role = await lookupRole(sql, row[0]?.email);
    const pending = await sql<{ n: number }>`
      select count(*) as n from staff_request
      where email = ${email} and status = 'pending'
    `;
    return {
      userId: context.userId,
      email,
      name: row[0]?.name ?? "",
      role,
      requested: Number(pending[0]?.n ?? 0) > 0,
    };
  });

/** Open to any signed-in account: asking is not a privilege. */
export const requestStaffAccess = createServerFn({ method: "POST" })
  .validator(z.object({ note: z.string().trim().max(300).default("") }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const row = await sql<{ email: string; name: string }>`
      select email, name from "user" where id = ${context.userId} limit 1
    `;
    const email = normaliseEmail(row[0]?.email);
    if (!email) throw new Error("Your account has no email address.");

    // Already staff? Then there is nothing to ask for.
    if (await lookupRole(sql, email)) return { ok: true as const, alreadyStaff: true };

    await sql`
      insert into staff_request (email, name, note)
      values (${email}, ${row[0]?.name ?? ""}, ${data.note})
      on conflict (email) do update set note = excluded.note, status = 'pending',
        created_at = now()
    `;
    return { ok: true as const, alreadyStaff: false };
  });

async function requireAdmin(): Promise<StaffIdentity> {
  const staff = await requireStaffIdentity();
  if (staff.role !== "admin") throw new Error("Only an admin can change studio access.");
  return staff;
}

export const listStaff = createServerFn({ method: "GET" }).handler(async () => {
  await requireStaffIdentity();
  const sql = await getSql();
  const members = await sql<{ email: string; role: string; note: string; created_at: unknown }>`
    select email, role, note, created_at from client_role order by created_at
  `;
  const requests = await sql<{
    id: string;
    email: string;
    name: string;
    note: string;
    status: string;
    created_at: unknown;
  }>`
    select id, email, name, note, status, created_at
    from staff_request where status = 'pending' order by created_at
  `;

  return {
    members: members.map((m) => ({
      email: m.email,
      role: m.role === "admin" ? ("admin" as const) : ("staff" as const),
      note: m.note,
      since: new Date(String(m.created_at)).toISOString().slice(0, 10),
    })),
    requests: requests.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      note: r.note,
      status: r.status,
      createdAt: new Date(String(r.created_at)).toISOString(),
    })),
  };
});

export const grantStaff = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().trim().email(),
      role: z.enum(["staff", "admin"]).default("staff"),
      note: z.string().trim().max(160).default(""),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const sql = await getSql();
    const email = normaliseEmail(data.email);

    // Guard the transition, not just the target state. Granting `staff` to an
    // existing admin is an upsert, so without this the last admin could demote
    // themselves, leave zero admins, and lock every future request out of the
    // one screen that can approve them.
    const others = await sql<{ n: number }>`
      select count(*) as n from client_role
      where role = 'admin' and lower(email) <> ${email}
    `;
    const demoting = demotesLastAdmin({
      currentRole: await lookupRole(sql, email),
      nextRole: data.role,
      otherAdminCount: Number(others[0]?.n ?? 0),
    });
    if (demoting) {
      throw new Error("That is the last admin. Promote someone else first.");
    }

    await sql`
      insert into client_role (email, role, note)
      values (${email}, ${data.role}, ${data.note})
      on conflict (email) do update set role = excluded.role, note = excluded.note
    `;
    await sql`
      insert into studio_contact (email, label)
      values (${email}, ${email})
      on conflict (email) do update set active = true
    `;
    await sql`
      update staff_request set status = 'approved', decided_by = ${admin.email}, decided_at = now()
      where email = ${email}
    `;
    return { ok: true as const, email };
  });

export const revokeStaff = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().trim().email() }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const sql = await getSql();
    const email = normaliseEmail(data.email);

    const admins = await sql<{ n: number }>`
      select count(*) as n from client_role where role = 'admin' and lower(email) <> ${email}
    `;
    if (Number(admins[0]?.n ?? 0) === 0) {
      throw new Error("That is the last admin. Promote someone else first.");
    }

    await sql`delete from client_role where lower(email) = ${email}`;
    await sql`update studio_contact set active = false where lower(email) = ${email}`;
    await sql`
      update staff_request set status = 'declined', decided_by = ${admin.email}, decided_at = now()
      where email = ${email} and status = 'pending'
    `;
    return { ok: true as const, email };
  });
