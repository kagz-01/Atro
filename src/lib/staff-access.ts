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
import { requireAdmin } from "@/lib/staff-session.server";
import {
  demotesLastAdmin,
  grantDemotesAdmin,
  inviteRefusal,
  roleAfterAccept,
} from "@/lib/staff-access-rules";
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

export type StaffInvite = {
  id: string;
  email: string;
  note: string;
  invitedBy: string;
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
    // The session carries the address too: a preview persona (or any account
    // whose user row has not been written yet) has no row to read, and the
    // greeting must never render a blank.
    const email = normaliseEmail(row[0]?.email) || normaliseEmail(context.email);
    const role = await lookupRole(sql, email);
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
    // Same fallback as getMyAccess: the session's own address when the user
    // table has nothing for this id, so asking for access works for whoever
    // can open the request card in the first place.
    const email = normaliseEmail(row[0]?.email) || normaliseEmail(context.email);
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
  const invites = await sql<{
    id: string;
    email: string;
    note: string;
    invited_by: string;
    created_at: unknown;
  }>`
    select id, email, note, invited_by, created_at
    from staff_invite where status = 'pending' order by created_at
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
    invites: invites.map((i) => ({
      id: i.id,
      email: i.email,
      note: i.note,
      invitedBy: i.invited_by,
      createdAt: new Date(String(i.created_at)).toISOString(),
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
    const admin = await requireAdmin("grant-access");
    const sql = await getSql();
    const email = normaliseEmail(data.email);

    // Guard the transition, not just the target state. Granting `staff` to an
    // existing admin is an upsert, so without this the last admin could demote
    // themselves, leave zero admins, and lock every future request out of the
    // one screen that can approve them.
    const currentRole = await lookupRole(sql, email);
    if (grantDemotesAdmin({ currentRole, nextRole: data.role })) {
      throw new Error(
        "That account is already an admin. Revoke access first if you want to change their role.",
      );
    }
    const others = await sql<{ n: number }>`
      select count(*) as n from client_role
      where role = 'admin' and lower(email) <> ${email}
    `;
    const demoting = demotesLastAdmin({
      currentRole,
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
    // A hand-granted access answers any invitation that was still open for the
    // same address — granting IS the thing the invitation promised.
    await sql`
      update staff_invite set status = 'accepted', responded_at = now()
      where lower(email) = ${email} and status = 'pending'
    `;
    return { ok: true as const, email };
  });

export const revokeStaff = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().trim().email() }))
  .handler(async ({ data }) => {
    const admin = await requireAdmin("revoke-access");
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
    // Revoking access also withdraws any invitation still open for that
    // address — otherwise the door revoked here could be walked back through
    // by accepting the invitation that is still waiting for them.
    await sql`
      update staff_invite set status = 'revoked', responded_at = now()
      where lower(email) = ${email} and status = 'pending'
    `;
    return { ok: true as const, email };
  });

/**
 * Invite an address to the console. The promise resolves when they sign in
 * and accept (see `acceptMyInvite`) — the invitation itself never grants.
 *
 * Sending to an address that already has an open invitation is the resend:
 * the same row is refreshed rather than a second one stacked, so the Access
 * screen shows one waiting entry per person however many times the boss
 * pressed the button.
 */
export const inviteStaff = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().trim().email(),
      note: z.string().trim().max(160).default(""),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin("grant-access");
    const sql = await getSql();
    const email = normaliseEmail(data.email);

    const currentRole = await lookupRole(sql, email);
    const refusal = inviteRefusal({ alreadyStaff: Boolean(currentRole) });
    if (refusal) throw new Error(refusal);

    const existing = await sql<{ id: string }>`
      select id from staff_invite
      where lower(email) = ${email} and status = 'pending'
    `;
    if (existing[0]) {
      await sql`
        update staff_invite
        set note = ${data.note}, invited_by = ${admin.email}, created_at = now()
        where id = ${existing[0].id}
      `;
      return { ok: true as const, email, resent: true };
    }

    await sql`
      insert into staff_invite (email, invited_by, note)
      values (${email}, ${admin.email}, ${data.note})
    `;
    return { ok: true as const, email, resent: false };
  });

/** Withdraw an invitation before it is accepted. */
export const revokeInvite = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().trim().email() }))
  .handler(async ({ data }) => {
    await requireAdmin("revoke-access");
    const sql = await getSql();
    const email = normaliseEmail(data.email);
    await sql`
      update staff_invite set status = 'revoked', responded_at = now()
      where lower(email) = ${email} and status = 'pending'
    `;
    return { ok: true as const, email };
  });

/**
 * Walk through the door an invitation opened: the caller's session address
 * holds a pending invitation, so the allowlist gains that address — as
 * `staff`, or unchanged if a role was already granted by hand while the
 * invitation waited (see `roleAfterAccept`).
 *
 * Takes no data of its own — the session's address decides everything — but
 * carries an empty validator because a context-carrying POST needs one for
 * the middleware's types to line up.
 */
export const acceptMyInvite = createServerFn({ method: "POST" })
  .validator(z.object({}))
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const email = normaliseEmail(context.email ?? "");
    if (!email) throw new Error("Your session has no email address.");

    const sql = await getSql();
    const invite = await sql<{
      id: string;
      invited_by: string;
      note: string;
    }>`
      select id, invited_by, note from staff_invite
      where lower(email) = ${email} and status = 'pending'
    `;
    if (!invite[0]) throw new Error("That invitation is no longer open.");

    const role = roleAfterAccept(await lookupRole(sql, email));
    await sql`
      insert into client_role (email, role, note)
      values (${email}, ${role}, ${invite[0].note || `Invited by ${invite[0].invited_by}`})
      on conflict (email) do nothing
    `;
    await sql`
      insert into studio_contact (email, label)
      values (${email}, ${email})
      on conflict (email) do update set active = true
    `;
    // An invitation that is accepted also answers a request that was still
    // waiting on the same address: both wanted in, one door was enough.
    await sql`
      update staff_request set status = 'approved', decided_by = ${invite[0].invited_by}, decided_at = now()
      where lower(email) = ${email} and status = 'pending'
    `;
    await sql`
      update staff_invite set status = 'accepted', responded_at = now()
      where id = ${invite[0].id}
    `;
    return { ok: true as const, email, role };
  });
