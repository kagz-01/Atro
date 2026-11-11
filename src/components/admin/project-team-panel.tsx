import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import {
  getAdminProjectTeam,
  saveAdminProjectTeam,
  type ProjectTeamAdminPayload,
} from "@/lib/project-team-server";

type AssignmentDraft = { staffUserId: string; roleTitle: string };

function toDraft(data: ProjectTeamAdminPayload): AssignmentDraft[] {
  return data.assignments.map(({ staffUserId, roleTitle }) => ({ staffUserId, roleTitle }));
}

export function AdminProjectTeamPanel({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<AssignmentDraft[] | null>(null);
  const queryKey = ["admin-project-team", projectId];
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getAdminProjectTeam({ data: { projectId } }),
  });

  useEffect(() => {
    if (data && draft === null) setDraft(toDraft(data));
  }, [data, draft]);

  const save = useMutation({
    mutationFn: saveAdminProjectTeam,
    onSuccess: async (result) => {
      setDraft(toDraft(result));
      queryClient.setQueryData(queryKey, result);
      toast.success("Project team saved.");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not save the project team."),
  });

  if (isLoading || !data || !draft) {
    return (
      <Panel title="ATRO project team">
        {error ? (
          <p role="alert" className="text-[13px] text-red-700">
            {error instanceof Error ? error.message : "Could not load the project team."}
          </p>
        ) : (
          <div className="h-28 animate-pulse rounded-xl bg-ink/6" aria-busy="true" />
        )}
      </Panel>
    );
  }

  const selectedIds = draft.map((assignment) => assignment.staffUserId).filter(Boolean);
  const hasDuplicateStaff = new Set(selectedIds).size !== selectedIds.length;
  const hasInvalidAssignment = draft.some(
    (assignment) =>
      !assignment.staffUserId ||
      assignment.roleTitle.trim().length < 2 ||
      !data.staffOptions.some((staff) => staff.userId === assignment.staffUserId),
  );
  const changed = JSON.stringify(draft) !== JSON.stringify(toDraft(data)) && !hasInvalidAssignment;

  return (
    <Panel
      title="ATRO project team"
      subtitle="Assign the named contacts the client will see in their Project team tab."
    >
      {!data.canEdit ? (
        <p className="rounded-xl border border-ink/10 bg-cream p-4 text-[13px] text-ink/65">
          Team assignments are locked because the project is closed or archived.
        </p>
      ) : null}
      {data.staffOptions.length === 0 ? (
        <p className="rounded-xl border border-gold/30 bg-gold/8 p-4 text-[13px] leading-relaxed text-ink/70">
          No staff profiles are ready to assign. Ask team members to add a preferred name in their
          staff profile, and confirm they have active studio access.
        </p>
      ) : null}

      <div className="space-y-3">
        {draft.map((assignment, index) => {
          const current = data.assignments.find(
            (member) => member.staffUserId === assignment.staffUserId,
          );
          const selectedIsActive = data.staffOptions.some(
            (staff) => staff.userId === assignment.staffUserId,
          );
          return (
            <div
              key={`${assignment.staffUserId || "new"}-${index}`}
              className="grid gap-3 rounded-xl border border-ink/10 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <div>
                <Label htmlFor={`team-staff-${index}`}>ATRO team member</Label>
                <Select
                  id={`team-staff-${index}`}
                  value={assignment.staffUserId}
                  onChange={(event) =>
                    setDraft(
                      (previous) =>
                        previous?.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, staffUserId: event.target.value } : row,
                        ) ?? null,
                    )
                  }
                  className="mt-1"
                  disabled={!data.canEdit || save.isPending}
                  required
                >
                  <option value="">Choose a staff member</option>
                  {current && !selectedIsActive ? (
                    <option value={current.staffUserId}>
                      {current.displayName} (no longer active)
                    </option>
                  ) : null}
                  {data.staffOptions.map((staff) => (
                    <option key={staff.userId} value={staff.userId}>
                      {staff.displayName}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor={`team-role-${index}`}>Project role</Label>
                <Input
                  id={`team-role-${index}`}
                  value={assignment.roleTitle}
                  onChange={(event) =>
                    setDraft(
                      (previous) =>
                        previous?.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, roleTitle: event.target.value } : row,
                        ) ?? null,
                    )
                  }
                  placeholder="Project manager, QS, site supervisor…"
                  minLength={2}
                  maxLength={80}
                  className="mt-1"
                  disabled={!data.canEdit || save.isPending}
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                aria-label={`Remove team member ${index + 1}`}
                disabled={!data.canEdit || save.isPending}
                onClick={() =>
                  setDraft((previous) => previous?.filter((_, i) => i !== index) ?? [])
                }
              >
                <Trash2 className="size-4" aria-hidden />
                <span className="sm:hidden">Remove</span>
              </Button>
            </div>
          );
        })}
      </div>

      {hasDuplicateStaff ? (
        <p role="alert" className="text-[12px] text-red-700">
          List each staff member once. Use their project role to describe their responsibility.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={
            !data.canEdit || save.isPending || draft.length >= 12 || !data.staffOptions.length
          }
          onClick={() =>
            setDraft((previous) => [...(previous ?? []), { staffUserId: "", roleTitle: "" }])
          }
        >
          <Plus className="size-4" aria-hidden />
          Add team member
        </Button>
        <Button
          type="button"
          disabled={!data.canEdit || !changed || hasDuplicateStaff || save.isPending}
          onClick={() =>
            save.mutate({
              data: {
                projectId,
                assignments: draft.map(({ staffUserId, roleTitle }) => ({
                  staffUserId,
                  roleTitle: roleTitle.trim(),
                })),
              },
            })
          }
        >
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {save.isPending ? "Saving…" : "Save project team"}
        </Button>
      </div>
      <p className="text-[12px] leading-relaxed text-ink/55">
        Clients see each assigned person’s preferred name and project role, and can contact the
        project through the in-app message thread. Personal email addresses and phone numbers are
        not shown.
      </p>
    </Panel>
  );
}
