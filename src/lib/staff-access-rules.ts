// Access rules that decide nothing on their own — no database, no session.
// Kept free of imports so they can be tested directly, and so the reasoning
// behind a lockout guard is readable without reading the SQL around it.

export type StaffRole = "staff" | "admin";

/**
 * Whether moving one person from `currentRole` to `nextRole` would leave the
 * studio with no admin at all.
 *
 * Granting access is an upsert, so handing someone the `staff` role is also
 * how an existing admin gets demoted. Checking only the resulting state misses
 * that: the dangerous moment is the transition, and getting it wrong locks
 * every future access request out of the one screen that can approve it.
 *
 * `otherAdminCount` must exclude the person being changed.
 */
export function demotesLastAdmin(input: {
  currentRole: StaffRole | null;
  nextRole: StaffRole;
  otherAdminCount: number;
}): boolean {
  const { currentRole, nextRole, otherAdminCount } = input;
  if (otherAdminCount > 0) return false;
  return currentRole === "admin" && nextRole !== "admin";
}

/**
 * Whether re-granting a role would demote someone who is already an admin.
 *
 * `grantStaff` is an upsert, so choosing "staff" for an existing admin is a
 * demotion wearing a grant's clothes. That is not what the grant form is for:
 * demotion is a separate, deliberate decision (revoke, or an explicit demote),
 * and it should never be reachable by re-filling a form whose purpose is to
 * give access. This is the hole the `demotesLastAdmin` guard only half-closed
 * — it blocked demoting the *last* admin, but any other admin could still be
 * silently demoted by re-submitting the grant form.
 */
export function grantDemotesAdmin(input: {
  currentRole: StaffRole | null;
  nextRole: StaffRole;
}): boolean {
  const { currentRole, nextRole } = input;
  return currentRole === "admin" && nextRole !== "admin";
}
