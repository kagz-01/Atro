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

/**
 * The refusal when inviting someone who can already walk in.
 *
 * An invitation is a promise of the `staff` role held until it is accepted.
 * Someone already on the list needs no promise — and inviting them would set
 * up an accept that silently re-grants what a revoke may have deliberately
 * taken away.
 */
export function inviteRefusal(input: { alreadyStaff: boolean }): string | null {
  if (!input.alreadyStaff) return null;
  return "That address is already on the studio access list.";
}

/**
 * The role an accepted invitation resolves to.
 *
 * Never lowers what is already held: the invitation only ever promises
 * `staff`, so accepting is `staff` for a new person and a no-op for anyone
 * the boss has already promoted — an accept must not demote an admin back to
 * staff just because an invitation was still open when they were granted.
 */
export function roleAfterAccept(currentRole: StaffRole | null): StaffRole {
  return currentRole ?? "staff";
}
