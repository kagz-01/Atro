import { useState } from "react";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MessageAttachment, MessageRole } from "@/lib/messages";
import { getMyMessageAttachmentUrl, getStaffMessageAttachmentUrl } from "@/lib/messages-server";
import { formatMessageFileSize } from "@/lib/message-attachments";
import { cn } from "@/lib/utils";

export function MessageFileCard({
  attachment,
  role,
}: {
  attachment: MessageAttachment;
  role: MessageRole;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const isImage = attachment.mime.startsWith("image/");
  const isVideo = attachment.mime.startsWith("video/");

  async function loadFileUrl(): Promise<string> {
    if (url) return url;
    const popup = isImage || isVideo ? null : window.open("about:blank", "_blank");
    setLoading(true);
    setError("");
    try {
      const { url } =
        role === "client"
          ? await getMyMessageAttachmentUrl({ data: { attachmentId: attachment.id } })
          : await getStaffMessageAttachmentUrl({ data: { attachmentId: attachment.id } });
      setUrl(url);
      if (popup) popup.location.href = url;
      return url;
    } catch (cause) {
      popup?.close();
      setError(cause instanceof Error ? cause.message : "Could not open this file.");
      throw cause;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      {isImage && url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt={attachment.filename}
            loading="lazy"
            className="max-h-64 max-w-full rounded-lg border border-ink/10 object-contain"
          />
        </a>
      ) : isVideo && url ? (
        <video
          controls
          preload="metadata"
          className="max-h-64 max-w-full rounded-lg"
          aria-label={attachment.filename}
        >
          <source src={url} type={attachment.mime} />
        </video>
      ) : null}
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-1 inline-flex items-center gap-2 text-[11px] underline",
            role === "studio" ? "text-white/75" : "text-maroon",
          )}
        >
          <Download className="size-3.5" />
          {attachment.filename}
        </a>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn("max-w-full justify-start gap-2", role === "studio" && "border-white/25")}
          disabled={loading}
          onClick={() => void loadFileUrl()}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isImage ? (
            <FileImage className="size-4" />
          ) : (
            <FileText className="size-4" />
          )}
          <span className="max-w-56 truncate">{attachment.filename}</span>
          <span className="shrink-0 text-[10px] opacity-60">
            {formatMessageFileSize(attachment.sizeBytes)}
          </span>
          {!loading ? <Download className="size-3.5 shrink-0" /> : null}
        </Button>
      )}
      {error ? (
        <p role="alert" className="mt-1 text-[11px] text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
