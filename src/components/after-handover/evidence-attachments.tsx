import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, Loader2, Paperclip, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { uploadDefectEvidence } from "@/lib/after-handover-upload";
import { getDefectEvidenceUrl } from "@/lib/after-handover-server";
import type { DefectEvidence } from "@/lib/defects";
import { PROJECT_FILE_ACCEPT } from "@/lib/project-files";

function dateLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-KE", {
        dateStyle: "medium",
        timeZone: "Africa/Nairobi",
      }).format(date);
}

export function EvidenceAttachments({
  projectId,
  defectId,
  evidence,
  onUploaded,
}: {
  projectId: string;
  defectId: string;
  evidence: DefectEvidence[];
  onUploaded: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const upload = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Choose a photo or document.");
      return uploadDefectEvidence(projectId, defectId, file);
    },
    onSuccess: () => {
      setFile(null);
      setFileInputKey((key) => key + 1);
      setError("");
      onUploaded();
    },
    onError: (reason) => {
      setError(reason instanceof Error ? reason.message : "The evidence could not be uploaded.");
      onUploaded();
    },
  });

  async function openEvidence(item: DefectEvidence) {
    const popup = window.open("", "_blank");
    if (!popup) {
      setError("Allow pop-ups to preview this evidence.");
      return;
    }
    popup.opener = null;
    try {
      const { url } = await getDefectEvidenceUrl({ data: { evidenceId: item.id } });
      popup.location.href = url;
    } catch (reason) {
      popup.close();
      setError(reason instanceof Error ? reason.message : "The evidence could not be opened.");
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-ink/8 bg-cream/60 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink/70">
        <Paperclip className="size-3.5" aria-hidden />
        Evidence ({evidence.length})
      </p>
      {evidence.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {evidence.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="min-w-0 break-all text-ink/65">
                {item.filename} · {item.uploadedBy === "staff" ? "ATRO" : "Client"} · {dateLabel(item.createdAt)}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="min-h-8"
                onClick={() => void openEvidence(item)}
              >
                <Eye className="size-3.5" aria-hidden />
                Preview
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-[11px] text-ink/50">No photos or files attached yet.</p>
      )}
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <Input
          key={fileInputKey}
          aria-label="Choose a photo or document as defect evidence"
          type="file"
          accept={PROJECT_FILE_ACCEPT}
          className="h-auto min-h-10 max-w-full py-1.5 text-[11px]"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setError("");
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!file || upload.isPending}
          onClick={() => upload.mutate()}
        >
          {upload.isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Upload className="size-3.5" aria-hidden />
          )}
          Add evidence
        </Button>
      </div>
      <p className="mt-1 text-[10px] text-ink/45">PDF, JPG, PNG or WebP · up to 10 MB per file.</p>
      {error ? (
        <p role="alert" className="mt-2 text-[12px] text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
