// ATRO staff session guards. Server-only: reads the verified session, then the
// allowlist. Split from `staff.ts` so no client-visible module statically imports
// a `*.server.*` file, which the build rejects.

import { getSql, type Sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/verify.server";
import { lookupRole, normaliseEmail, type StaffIdentity } from "@/lib/staff";

/** Throws unless the caller is signed in AND on the allowlist. */
export async function requireStaff(): Promise<StaffIdentity> {
  const user = await getSessionUser();
  if (!user) throw new Error("Sign in to continue.");
  const role = await lookupRole(await getSql(), user.email);
  if (!role) throw new Error("This area is for ATRO staff.");
  return { userId: user.id, email: normaliseEmail(user.email), role };
}

/**
 * Signed-in identity, regardless of the allowlist.
 *
 * The console needs to tell three states apart — not signed in, signed in but
 * not staff, and staff — and only the third should see the console itself.
 */
export async function currentIdentity(): Promise<{ userId: string; email: string } | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return { userId: user.id, email: normaliseEmail(user.email) };
}

/**
 * How many admins exist. Zero is a dead studio: nobody can approve the first
 * access request, so the request path could never bootstrap itself.
 */
async function adminCount(sql: Sql): Promise<number> {
  const rows = await sql<{ n: number }>`
    select count(*) as n from client_role where role = 'admin'
  `;
  return Number(rows[0]?.n ?? 0);
}

/**
 * Read-only variant for UI: null instead of throwing.
 *
 * When the database has no admin at all, the first account that signs in is
 * promoted rather than left locked out. The seed creates one, so this only
 * fires on a genuinely fresh install — and it is the only way a real person
 * can ever reach a studio whose seeded address is not a sign-in address they
 * control. Every later change to access still goes through an admin decision.
 */
export async function currentStaff(): Promise<StaffIdentity | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const email = normaliseEmail(user.email);
  const sql = await getSql();
  let role = await lookupRole(sql, email);

  if (!role && (await adminCount(sql)) === 0) {
    await sql`
      insert into client_role (email, role, note)
      values (${email}, 'admin', 'First signed-in account')
      on conflict (email) do update set role = 'admin'
    `;
    await sql`
      insert into studio_contact (email, label)
      values (${email}, ${email})
      on conflict (email) do update set active = true
    `;
    role = "admin";
  }

  if (!role) return null;
  return { userId: user.id, email, role };
}
