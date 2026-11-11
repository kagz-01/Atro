import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/field";
import {
  getStaffProjectFileUrl,
  listProjectFilesForStaff,
  reviewProjectFile,
  type ProjectFile,
} from "@/lib/project-files-server";
import { PROJECT_FILE_STATUS_LABEL, type ProjectFileStatus } from "@/lib/project-files";

const TONE = {
  submitted: "gold",
  reviewing: "stone",
  accepted: "live",
  needs_changes: "maroon",
} as const;

const REVIEW_STATES: ProjectFileStatus[] = ["reviewing", "accepted", "needs_changes"];

function dateLabel(value: string): string {
  return new Date(value).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ClientProjectFilesPanel({
  projectId,
  onChanged,
}: {
  projectId: string;
  onChanged?: () => void;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["staff-project-files", projectId];
  const [nextStatus, setNextStatus] = useState<Record<string, ProjectFileStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const query = useQuery({
    queryKey,
    queryFn: () => listProjectFilesForStaff({ data: { projectId } }),
  });
  const review = useMutation({
    mutationFn: reviewProjectFile,
    onSuccess: async () => {
      setError("");
      toast.success("Client document review saved.");
      await queryClient.invalidateQueries({ queryKey });
      onChanged?.();
    },
    onError: (reason) =>
      setError(reason instanceof Error ? reason.message : "The review could not be saved."),
  });

  async function openFile(document: ProjectFile) {
    const popup = window.open("", "_blank");
    if (!popup) {
      setError("Allow pop-ups to preview this document.");
      return;
    }
    popup.opener = null;
    try {
      const { url } = await getStaffProjectFileUrl({ data: { documentId: document.id } });
      popup.location.href = url;
    } catch (reason) {
      popup.close();
      setError(reason instanceof Error ? reason.message : "The document could not be opened.");
    }
  }

  const documents = query.data ?? [];
  return (
    <section>
      <div className="mb-4">
        <h3 className="font-display text-lg text-maroon">Client-submitted documents</h3>
        <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
          Review each upload, mark it accepted, or explain what is missing so the client knows what
          to do next.
        </p>
      </div>
      {error ? (
        <p role="alert" className="mb-3 text-[13px] text-red-700">
          {error}
        </p>
      ) : null}
      {query.isLoading ? (
        <div className="flex min-h-20 items-center justify-center" aria-busy="true">
          <Loader2 className="size-5 animate-spin text-gold" />
        </div>
      ) : query.error ? (
        <p role="alert" className="text-[13px] text-red-700">
          {query.error instanceof Error
            ? query.error.message
            : "Could not load client-submitted documents."}
        </p>
      ) : documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink/15 p-5 text-center">
          <FileText className="mx-auto size-5 text-ink/35" aria-hidden />
          <p className="mt-2 text-[13px] text-ink/60">No client documents have been submitted.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {documents.map((document) => {
            const status = nextStatus[document.id] ?? document.status;
            const note = notes[document.id] ?? document.staffNote;
            const changed = status !== document.status || note !== document.staffNote;
            return (
              <li key={document.id} className="rounded-xl border border-ink/10 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-[14px] font-medium text-maroon">
                      {document.title}
                    </p>
                    <p className="mt-1 break-all text-[12px] text-ink/55">
                      {document.category} · {document.filename}
                    </p>
                    <p className="mt-1 text-[11px] text-ink/45">
                      Submitted {dateLabel(document.createdAt)}
                    </p>
                  </div>
                  <Badge tone={TONE[document.status]}>
                    {PROJECT_FILE_STATUS_LABEL[document.status]}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`client-doc-status-${document.id}`}>Review status</Label>
                    <Select
                      id={`client-doc-status-${document.id}`}
                      value={status}
                      onChange={(event) =>
                        setNextStatus((current) => ({
                          ...current,
                          [document.id]: event.target.value as ProjectFileStatus,
                        }))
                      }
                    >
                      {document.status === "submitted" ? (
                        <option value="submitted">Submitted — not yet reviewed</option>
                      ) : null}
                      {REVIEW_STATES.map((state) => (
                        <option key={state} value={state}>
                          {PROJECT_FILE_STATUS_LABEL[state]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`client-doc-note-${document.id}`}>Note for the client</Label>
                    <Textarea
                      id={`client-doc-note-${document.id}`}
                      className="min-h-12"
                      maxLength={600}
                      value={note}
                      onChange={(event) =>
                        setNotes((current) => ({ ...current, [document.id]: event.target.value }))
                      }
                      placeholder="What should they know or provide?"
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="min-h-10"
                    onClick={() => void openFile(document)}
                  >
                    <Eye className="size-4" aria-hidden />
                    Preview
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="min-h-10"
                    disabled={review.isPending || !changed || status === "submitted"}
                    onClick={() => {
                      if (status === "submitted") return;
                      review.mutate({
                        data: {
                          documentId: document.id,
                          status,
                          note: note.trim() || undefined,
                        },
                      });
                    }}
                  >
                    {review.isPending ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : null}
                    Save review and notify client
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
