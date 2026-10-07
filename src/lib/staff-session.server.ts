// ATRO staff session guards. Server-only: reads the verified session, then the
// allowlist. Split from `staff.ts` so no client-visible module statically imports
// a `*.server.*` file, which the build rejects.

import { getSql } from "@/lib/db";
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

/** Read-only variant for UI: null instead of throwing. */
export async function currentStaff(): Promise<StaffIdentity | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const role = await lookupRole(await getSql(), user.email);
  if (!role) return null;
  return { userId: user.id, email: normaliseEmail(user.email), role };
}
