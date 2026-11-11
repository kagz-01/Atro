// ATRO privilege matrix — which studio writes need more than "staff".
//
// The allowlist (client_role) answers "is this person in the studio". This
// answers the next question: once in, high-impact writes that move money,
// change access, or finalize a project are an admin's alone.
//
// Kept free of runtime imports so the whole matrix is readable in one screen
// and testable without a session. The server guard (`requireAdmin` in
// staff-session.server) and the console's button state both read from here, so
// a refused write and a hidden button can never disagree.

import type { StaffRole } from "@/lib/staff-access-rules";

/**
 * The writes that need an admin. Every entry is admin-only by definition —
 * the union is the matrix. Anything not listed here stays open to any
 * allowlisted staff account.
 */
export type PrivilegedOp =
  | "certify-payment"
  | "release-retention"
  | "issue-statement"
  | "issue-quotation"
  | "void-document"
  | "set-retainer"
  | "record-project-expense"
  | "approve-project-expense"
  | "close-project"
  | "archive-project"
  | "grant-access"
  | "revoke-access"
  | "manage-project-team";

/** The sentence the caller is refused with, one per operation. */
const REFUSAL: Record<PrivilegedOp, string> = {
  "certify-payment": "Only an admin can certify a payment.",
  "release-retention": "Only an admin can release retention.",
  "issue-statement": "Only an admin can issue a statement.",
  "issue-quotation": "Only an admin can issue a quotation.",
  "void-document": "Only an admin can void a document.",
  "set-retainer": "Only an admin can set the annual care fee.",
  "record-project-expense": "Only an admin can record a project expense.",
  "approve-project-expense": "Only an admin can approve a project expense.",
  "close-project": "Only an admin can close a project.",
  "archive-project": "Only an admin can archive a project.",
  "grant-access": "Only an admin can change studio access.",
  "revoke-access": "Only an admin can change studio access.",
  "manage-project-team": "Only an admin can assign project team members.",
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

/** Only the office manager and owner may schedule project calls. */
export function canScheduleProjectCalls(role: StaffRole | null): boolean {
  return role === "office_manager" || role === "admin";
}

/** The refusal sentence for an operation, for server-side guards. */
export function refusalFor(op: PrivilegedOp): string {
  return REFUSAL[op];
}
