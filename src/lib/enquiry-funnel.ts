// Enquiry funnel — pure rules for moving a lead and claiming it.
//
// Kept separate from the server functions so the console and the tests agree on
// one answer to "what can I do with this lead?" without a database. The funnel
// is deliberately forward-only from each stage: a lead that has been quoted is
// not "contacted" again by moving backwards, it is won or lost. `converted`
// sits outside the funnel — it is what opening a project sets, and nothing
// moves an enquiry out of it.

export type EnquiryStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "won"
  | "lost"
  | "converted";

export type EnquiryTransition = {
  status: EnquiryStatus;
  label: string;
};

/**
 * The moves available from a stage. "Lost" is reachable from anywhere in the
 * live funnel — a studio should be able to close a lead the moment it is
 * obviously not happening, without first quoting it.
 */
export function enquiryTransitions(status: string): EnquiryTransition[] {
  switch (status) {
    case "new":
      return [
        { status: "contacted", label: "Mark contacted" },
        { status: "quoted", label: "Mark quoted" },
        { status: "won", label: "Mark won" },
        { status: "lost", label: "Mark lost" },
      ];
    case "contacted":
      return [
        { status: "quoted", label: "Mark quoted" },
        { status: "won", label: "Mark won" },
        { status: "lost", label: "Mark lost" },
      ];
    case "quoted":
      return [
        { status: "won", label: "Mark won" },
        { status: "lost", label: "Mark lost" },
      ];
    case "won":
    case "lost":
    case "converted":
    default:
      return [];
  }
}

export type ClaimState = "unclaimed" | "mine" | "theirs";

/**
 * Who is working this enquiry, from the point of view of `meEmail`.
 *
 * Emails are compared case-insensitively and trimmed: `lookupRole` normalises
 * the same way, so the same person is never two owners.
 */
export function claimState(assignedTo: string, meEmail: string): ClaimState {
  const owner = assignedTo.trim().toLowerCase();
  if (!owner) return "unclaimed";
  return owner === meEmail.trim().toLowerCase() ? "mine" : "theirs";
}

/** The status label the console shows on a card. */
export function statusLabel(status: string): string {
  if (status === "new") return "New";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
