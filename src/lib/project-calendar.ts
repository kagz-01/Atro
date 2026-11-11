export const PROJECT_CALENDAR_KINDS = ["meeting", "other"] as const;
export type ProjectCalendarKind = (typeof PROJECT_CALENDAR_KINDS)[number];

export const PROJECT_CALENDAR_STATUSES = ["requested", "confirmed", "declined"] as const;
export type ProjectCalendarStatus = (typeof PROJECT_CALENDAR_STATUSES)[number];

export type ProjectCalendarRequest = {
  id: string;
  projectId: string;
  title: string;
  kind: ProjectCalendarKind;
  note: string;
  proposedAt: string;
  scheduledAt: string | null;
  status: ProjectCalendarStatus;
  staffNote: string;
  createdAt: string;
  respondedAt: string | null;
};

export function canRespondToCalendarRequest(
  from: ProjectCalendarStatus,
  to: ProjectCalendarStatus,
): boolean {
  return from === "requested" && (to === "confirmed" || to === "declined");
}

export function calendarRequestLabel(kind: ProjectCalendarKind): string {
  return kind === "meeting" ? "Project meeting" : "Other project event";
}
