import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { uploadProjectFile } from "@/lib/project-file-upload";
import {
  deleteMyProjectFile,
  getMyProjectFileUrl,
  listMyProjectFiles,
  type ProjectFile,
} from "@/lib/project-files-server";
import {
  PROJECT_FILE_ACCEPT,
  PROJECT_FILE_CATEGORIES,
  PROJECT_FILE_STATUS_LABEL,
} from "@/lib/project-files";

const TONE = {
  submitted: "gold",
  reviewing: "stone",
  accepted: "live",
  needs_changes: "maroon",
} as const;

function sizeLabel(size: number): string {
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function issuedDate(value: string): string {
  return new Date(value).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ClientProjectFilesPanel({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof PROJECT_FILE_CATEGORIES)[number]>("Other");
  const [file, setFile] = useState<File | null>(null);
  const [actionError, setActionError] = useState("");

  const queryKey = ["my-project-files", projectId];
  const query = useQuery({
    queryKey,
    queryFn: () => listMyProjectFiles({ data: { projectId } }),
  });

  const upload = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Choose a document to upload.");
      return uploadProjectFile(projectId, title.trim(), category, file);
    },
    onSuccess: async () => {
      setTitle("");
      setFile(null);
      formRef.current?.reset();
      setActionError("");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) =>
      setActionError(error instanceof Error ? error.message : "The document was not uploaded."),
  });

  const remove = useMutation({
    mutationFn: deleteMyProjectFile,
    onSuccess: async () => {
      setActionError("");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) =>
      setActionError(error instanceof Error ? error.message : "The document could not be removed."),
  });

  async function openFile(document: ProjectFile) {
    const popup = window.open("", "_blank");
    if (!popup) {
      setActionError("Allow pop-ups to preview this document.");
      return;
    }
    popup.opener = null;
    try {
      const { url } = await getMyProjectFileUrl({ data: { documentId: document.id } });
      popup.location.href = url;
    } catch (error) {
      popup.close();
      setActionError(error instanceof Error ? error.message : "The document could not be opened.");
    }
  }

  const documents = query.data ?? [];
  const canUpload = documents.length < 20;

  return (
    <Panel
      title="Your uploaded documents"
      subtitle="Upload records for the project team to review. These are separate from invoices and certificates issued by ATRO."
    >
      <form
        ref={formRef}
        className="rounded-2xl border border-ink/10 bg-cream p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!file || upload.isPending) return;
          upload.mutate();
        }}
      >
        <h3 className="font-display text-base text-maroon">Send a document to your team</h3>
        <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
          PDF, JPG, PNG or WebP · up to 10 MB. Remove a submission before review starts, or after
          the team asks for changes.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor={`client-file-title-${projectId}`}>Document title</Label>
            <Input
              id={`client-file-title-${projectId}`}
              required
              minLength={2}
              maxLength={100}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Land title deed"
            />
          </div>
          <div>
            <Label htmlFor={`client-file-category-${projectId}`}>What is it?</Label>
            <Select
              id={`client-file-category-${projectId}`}
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as (typeof PROJECT_FILE_CATEGORIES)[number])
              }
            >
              {PROJECT_FILE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`client-file-input-${projectId}`}>Choose a file</Label>
            <Input
              id={`client-file-input-${projectId}`}
              type="file"
              accept={PROJECT_FILE_ACCEPT}
              required
              className="h-auto min-h-12 py-2"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="mt-1 text-[11px] text-ink/55">
                {file.name} · {sizeLabel(file.size)}
              </p>
            ) : null}
          </div>
        </div>
        <Button type="submit" className="mt-4 min-h-11" disabled={!canUpload || upload.isPending}>
          {upload.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Upload className="size-4" aria-hidden />
          )}
          {canUpload ? "Upload for review" : "Document limit reached"}
        </Button>
      </form>

      {actionError ? (
        <p role="alert" className="mt-3 text-[13px] text-red-700">
          {actionError}
        </p>
      ) : null}
      {query.isLoading ? (
        <div className="flex min-h-20 items-center justify-center" aria-busy="true">
          <Loader2 className="size-5 animate-spin text-gold" />
        </div>
      ) : query.error ? (
        <p role="alert" className="mt-4 text-[13px] text-red-700">
          {query.error instanceof Error ? query.error.message : "Could not load your documents."}
        </p>
      ) : documents.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-ink/15 p-5 text-center">
          <FileText className="mx-auto size-5 text-ink/35" aria-hidden />
          <p className="mt-2 text-[13px] text-ink/65">
            No documents submitted yet. Your team's review and any follow-up will appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {documents.map((document) => (
            <li key={document.id} className="rounded-xl border border-ink/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-[14px] font-medium text-maroon">
                    {document.title}
                  </p>
                  <p className="mt-1 text-[12px] text-ink/55">
                    {document.category} · {document.filename} · {sizeLabel(document.sizeBytes)}
                  </p>
                  <p className="mt-1 text-[11px] text-ink/45">
                    Sent {issuedDate(document.createdAt)}
                  </p>
                </div>
                <Badge tone={TONE[document.status]}>
                  {PROJECT_FILE_STATUS_LABEL[document.status]}
                </Badge>
              </div>
              {document.staffNote ? (
                <div className="mt-3 rounded-lg bg-cream p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    Note from your team
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-ink/75">
                    {document.staffNote}
                  </p>
                </div>
              ) : null}
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
                {document.status === "accepted" ? (
                  <span className="inline-flex min-h-10 items-center gap-1.5 px-2 text-[11px] text-ink/55">
                    <CheckCircle2 className="size-4 text-emerald-700" aria-hidden />
                    Kept as a project record
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="min-h-10 text-red-800"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (!window.confirm(`Remove "${document.title}" from this project?`)) return;
                      remove.mutate({ data: { documentId: document.id } });
                    }}
                  >
                    {remove.isPending ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="size-4" aria-hidden />
                    )}
                    Remove
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
