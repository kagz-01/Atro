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