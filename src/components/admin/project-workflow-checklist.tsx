import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { toast } from "sonner";
import { readApprovalsForStaff } from "@/lib/approvals-server";
import {
  getWeeklyUpdateChecklist,
  setWeeklyUpdateChecklistItem,
  type WeeklyUpdateChecklist,
} from "@/lib/staff-ops";
import type { VaultDoc } from "@/lib/diaspora/portal";

const WEEKLY_ITEMS = [
  { key: "progress_reviewed", label: "Review and reconcile project progress" },
  { key: "evidence_reviewed", label: "Review this week's site evidence" },
  { key: "client_updated", label: "Post a client-facing project update" },
] as const;

export function ProjectWorkflowChecklist({
  projectId,
  documents,
}: {
  projectId: string;
  documents: VaultDoc[];
}) {
  const queryClient = useQueryClient();
  const checklistQuery = useQuery<WeeklyUpdateChecklist>({
    queryKey: ["weekly-update-checklist", projectId],
    queryFn: () => getWeeklyUpdateChecklist({ data: { projectId } }),
  });
  const approvalsQuery = useQuery({
    queryKey: ["staff-approvals", projectId],
    queryFn: () => readApprovalsForStaff({ data: { projectId } }),
  });
  const updateItem = useMutation({
    mutationFn: setWeeklyUpdateChecklistItem,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["weekly-update-checklist", projectId] }),
    onError: (cause) =>
      toast.error(
        cause instanceof Error ? cause.message : "Could not update the weekly checklist.",
      ),
  });
  const checklist = checklistQuery.data;
  const approvals = approvalsQuery.data ?? [];
  const awaitingDocuments = documents.filter((document) => document.state === "awaiting");
  const blockingApprovals = approvals.filter(
    (approval) =>
      approval.blocking && approval.status !== "approved" && approval.status !== "not_required",
  );

  return (
    <Panel
      title="Workflow checklists"
      subtitle="A practical weekly routine and a live view of recorded project completeness"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section aria-labelledby="weekly-update-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="weekly-update-heading" className="text-[13px] font-semibold text-maroon">
              Weekly update
            </h3>
            {checklist ? <Badge tone="stone">Week of {checklist.weekStart}</Badge> : null}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-ink/55">
            Mark each step after completing it. These items reset at the start of each week.
          </p>
          {checklistQuery.error ? (
            <p role="alert" className="mt-3 text-[13px] text-red-700">
              {checklistQuery.error instanceof Error
                ? checklistQuery.error.message
                : "Could not load the weekly checklist."}
            </p>
          ) : checklistQuery.isLoading ? (
            <div className="flex min-h-16 items-center justify-center" aria-busy="true">
              <Loader2 className="size-5 animate-spin text-gold" />
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {WEEKLY_ITEMS.map(({ key, label }) => {
                const checked =
                  key === "progress_reviewed"
                    ? checklist?.progressReviewed === true
                    : key === "evidence_reviewed"
                      ? checklist?.evidenceReviewed === true
                      : checklist?.clientUpdated === true;
                return (
                  <li key={key}>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-ink/10 p-3 text-[12px] text-ink/70 focus-within:ring-2 focus-within:ring-maroon">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        disabled={!checklist || updateItem.isPending}
                        onChange={(event) =>
                          updateItem.mutate({
                            data: {
                              projectId,
                              item: key,
                              checked: event.target.checked,
                            },
                          })
                        }
                      />
                      {checked ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-ink/35" />
                      )}
                      <span>{label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="completeness-heading">
          <h3 id="completeness-heading" className="text-[13px] font-semibold text-maroon">
            Documents and approvals
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-ink/55">
            Based on records entered for this project. It does not replace a project-specific
            statutory or contract requirements list.
          </p>
          {approvalsQuery.error ? (
            <p role="alert" className="mt-3 text-[13px] text-red-700">
              {approvalsQuery.error instanceof Error
                ? approvalsQuery.error.message
                : "Could not load approval records."}
            </p>
          ) : approvalsQuery.isLoading ? (
            <div className="flex min-h-16 items-center justify-center" aria-busy="true">
              <Loader2 className="size-5 animate-spin text-gold" />
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              <li className="rounded-lg border border-ink/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] text-ink/70">
                    {documents.length} document record{documents.length === 1 ? "" : "s"}
                  </span>
                  <Badge
                    tone={awaitingDocuments.length || documents.length === 0 ? "gold" : "live"}
                  >
                    {awaitingDocuments.length
                      ? `${awaitingDocuments.length} awaiting`
                      : documents.length
                        ? "Recorded documents issued"
                        : "No documents recorded"}
                  </Badge>
                </div>
                {awaitingDocuments.length > 0 ? (
                  <p className="mt-2 text-[11px] text-ink/55">
                    {awaitingDocuments.map((document) => document.name).join(" · ")}
                  </p>
                ) : null}
              </li>
              <li className="rounded-lg border border-ink/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] text-ink/70">
                    {approvals.length} approval record{approvals.length === 1 ? "" : "s"}
                  </span>
                  <Badge
                    tone={blockingApprovals.length || approvals.length === 0 ? "gold" : "live"}
                  >
                    {blockingApprovals.length
                      ? `${blockingApprovals.length} blocking`
                      : approvals.length
                        ? "No open blocking approvals"
                        : "No approval records"}
                  </Badge>
                </div>
                {blockingApprovals.length > 0 ? (
                  <p className="mt-2 text-[11px] text-ink/55">
                    {blockingApprovals.map((approval) => approval.title).join(" · ")}
                  </p>
                ) : null}
              </li>
            </ul>
          )}
        </section>
      </div>
    </Panel>
  );
}
