// ATRO privilege matrix — which studio writes need more than "staff".
//
// The allowlist (client_role) answers "is this person in the studio". This
// answers the next question: once in, some writes move money, cancel money or
// change who holds the keys, and those are an admin's alone. A site foreman on
// the allowlist can log a defect and post an update; they cannot certify a
// payment or release retention.
//
// Kept free of imports so the whole matrix is readable in one screen and
// testable without a session. The server guard (`requireAdmin` in
// staff-session.server) and the console's button state both read from here, so
// a refused write and a hidden button can never disagree.

export type StaffRole = "staff" | "admin";

/**
 * The writes that need an admin. Every entry is admin-only by definition —
 * the union is the matrix. Anything not listed here stays open to any
 * allowlisted staff account.
 */
export type PrivilegedOp =
  | "certify-payment"
  | "release-retention"
  | "issue-statement"
  | "void-document"
  | "set-retainer"
  | "grant-access"
  | "revoke-access";

/** The sentence the caller is refused with, one per operation. */
const REFUSAL: Record<PrivilegedOp, string> = {
  "certify-payment": "Only an admin can certify a payment.",
  "release-retention": "Only an admin can release retention.",
  "issue-statement": "Only an admin can issue a statement.",
  "void-document": "Only an admin can void a document.",
  "set-retainer": "Only an admin can set the annual care fee.",
  "grant-access": "Only an admin can change studio access.",
  "revoke-access": "Only an admin can change studio access.",
};

/** True when this operation is reserved for admins. */
export function requiresAdmin(op: PrivilegedOp): boolean {
  return op in REFUSAL;
}

/**
 * Whether this role may perform this operation.
 *
 * A null role is nobody — not signed in, or signed in but off the allowlist —
 * and may do nothing here.
 */
export function canPerform(role: StaffRole | null, op: PrivilegedOp): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  return !requiresAdmin(op);
}

/** The refusal sentence for an operation, for server-side guards. */
export function refusalFor(op: PrivilegedOp): string {
  return REFUSAL[op];
}
