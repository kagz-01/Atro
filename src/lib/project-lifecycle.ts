export const PROJECT_LIFECYCLE_STATES = [
  "pre_construction",
  "active_build",
  "handover",
  "defects_period",
  "closed",
  "archived",
] as const;

export type ProjectLifecycleState = (typeof PROJECT_LIFECYCLE_STATES)[number];

export const PROJECT_LIFECYCLE_LABEL: Record<ProjectLifecycleState, string> = {
  pre_construction: "Pre-construction",
  active_build: "Active build",
  handover: "Handover",
  defects_period: "Defects period",
  closed: "Closed",
  archived: "Archived",
};

const NEXT_STATE: Partial<Record<ProjectLifecycleState, ProjectLifecycleState>> = {
  pre_construction: "active_build",
  active_build: "handover",
  handover: "defects_period",
  defects_period: "closed",
  closed: "archived",
};

export function nextProjectLifecycleState(
  state: ProjectLifecycleState,
): ProjectLifecycleState | null {
  return NEXT_STATE[state] ?? null;
}

export function lifecycleTransitionError({
  from,
  to,
  allMilestonesComplete,
  defectPeriodEnd,
  defectPeriodExpired,
  openDefects,
  retentionHeld,
}: {
  from: ProjectLifecycleState;
  to: ProjectLifecycleState;
  allMilestonesComplete: boolean;
  defectPeriodEnd: string;
  defectPeriodExpired: boolean;
  openDefects: number;
  retentionHeld: number;
}): string | null {
  if (NEXT_STATE[from] !== to) {
    return `A project in ${PROJECT_LIFECYCLE_LABEL[from]} cannot move to ${PROJECT_LIFECYCLE_LABEL[to]}.`;
  }
  if (to === "handover" && !allMilestonesComplete) {
    return "Complete all tracked milestones before moving the project to handover.";
  }
  if (to === "defects_period" && !defectPeriodEnd) {
    return "Set the defect-period end date before starting the defects period.";
  }
  if (to === "defects_period" && defectPeriodExpired) {
    return "The defect-period end date must be in the future when the period starts.";
  }
  if (to === "closed") {
    if (!defectPeriodEnd || !defectPeriodExpired) {
      return "The defect period must have ended before the project can be closed.";
    }
    if (openDefects > 0) {
      return "Resolve or formally decline all open defect reports before closing the project.";
    }
    if (retentionHeld > 0) {
      return "Release the remaining retention before closing the project.";
    }
  }
  return null;
}

export function portfolioLifecycleLabel(
  state: ProjectLifecycleState,
  allMilestonesComplete: boolean,
): string {
  if (state === "active_build" && allMilestonesComplete) return "Build complete";
  return PROJECT_LIFECYCLE_LABEL[state];
}
