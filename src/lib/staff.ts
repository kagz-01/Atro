// ATRO staff role — the allowlist itself.
//
// A role is a row in `client_role` keyed on the account's verified email, so it
// is a list ATRO maintains — not a claim anybody can make at sign-up. Anyone can
// create an account; only an address ATRO has listed can reach `/admin` or any
// staff server function.
//
// This module is client-safe: it holds the role lookup and nothing that reads a
// session. The session-resolving guards live in `staff-session.server.ts` and are
// imported dynamically by the server functions, because the build refuses a
// static `*.server.*` import from a module the browser can see.

import { getSql, type Sql } from "@/lib/db";
export { demotesLastAdmin } from "@/lib/staff-access-rules";

export type StaffRole = "staff" | "admin";

export type StaffIdentity = {
  userId: string;
  email: string;
  role: StaffRole;
};

/** Normalise for comparison: providers differ on case, and nothing else. */
export function normaliseEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

/** Case-insensitive exact match — never a `like`, never a domain match. */
export async function lookupRole(sql: Sql, email: string | null): Promise<StaffRole | null> {
  const key = normaliseEmail(email);
  if (!key) return null;
  const rows = await sql<{ role: string }>`
    select role from client_role where lower(email) = ${key} limit 1
  `;
  const role = rows[0]?.role;
  return role === "admin" || role === "staff" ? role : null;
}

/** Convenience for callers that already hold the SQL client. */
export async function isStaffEmail(email: string | null): Promise<boolean> {
  return (await lookupRole(await getSql(), email)) !== null;
}

