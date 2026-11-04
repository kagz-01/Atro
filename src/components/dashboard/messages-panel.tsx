import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Paperclip, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { EmojiPicker } from "@/components/messages/emoji-picker";
import { MessageFileCard } from "@/components/messages/message-files";
import { authorLabel, composerHint, MESSAGE_MAX, oldestFirst, type Message } from "@/lib/messages";
import {
  getMessageAttachmentAvailability,
  listMyMessages,
  markStudioMessagesRead,
  postMyMessage,
  deleteMyMessage,
} from "@/lib/messages-server";
import { supabaseBrowser } from "@/lib/supabase/browser";
import {
  formatMessageFileSize,
  MAX_MESSAGE_ATTACHMENT_BYTES,
  MAX_MESSAGE_ATTACHMENTS,
  MESSAGE_ATTACHMENT_ACCEPT,
  validateMessageAttachmentMetadata,
} from "@/lib/message-attachments";
import { uploadMessageFile } from "@/lib/message-upload";
import { cn } from "@/lib/utils";

/**
 * The conversation with the studio, kept on the project.
 *
 * Opening it marks the studio's replies as read — there is no "mark as read"
 * button, because a badge you have to clear after reading is one people learn
 * to ignore. The thread is ordered oldest first, like a conversation actually
 * reads, and each message carries who wrote it and when, so "we told you in
 * March" is a date on the record rather than a claim in an argument.
 */
export function MessagesPanel({
  projectId,
  clientName,
  onChanged,
}: {
  projectId: string;
  clientName?: string;
  onChanged?: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileProblem, setFileProblem] = useState("");
  const [uploadProblem, setUploadProblem] = useState("");
  const [notificationWarning, setNotificationWarning] = useState(false);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: attachmentAvailability,
    error: attachmentAvailabilityError,
    isLoading: availabilityLoading,
  } = useQuery({
    queryKey: ["message-attachment-availability"],
    queryFn: () => getMessageAttachmentAvailability(),
    staleTime: 60_000,
  });
  const browserStorageAvailable = typeof window !== "undefined" && Boolean(supabaseBrowser());
  const fileUploadAvailable = browserStorageAvailable && attachmentAvailability?.enabled === true;
  const attachmentAvailabilityHint = attachmentAvailabilityError
    ? "Could not check file sharing. Try reloading this conversation."
    : availabilityLoading
      ? "Checking file-sharing availability…"
      : attachmentAvailability?.enabled === false
        ? "File sharing is not configured on the server."
        : !browserStorageAvailable
          ? "File sharing is not configured in this browser environment."
          : null;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-messages", projectId],
    queryFn: () => listMyMessages({ data: { projectId } }),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const markRead = useMutation({
    mutationFn: () => markStudioMessagesRead({ data: { projectId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-messages", projectId] });
      onChanged?.();
    },
  });

  // Reading the thread clears the badge. Only run once there is something to
  // clear, or an empty thread would fire a write on every visit.
  const hasUnread = (data ?? []).some((m) => m.authorRole === "studio" && !m.readAt);
  useEffect(() => {
    if (hasUnread && !markRead.isPending) markRead.mutate();
    // markRead is a stable mutation object from react-query; re-running on every
    // render would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnread, data]);

  const send = useMutation({
    mutationFn: async () => {
      const posted = pendingMessageId
        ? null
        : await postMyMessage({
            data: { projectId, body: draft, hasAttachments: files.length > 0 },
          });
      const messageId = pendingMessageId ?? posted?.messageId;
      if (!messageId) throw new Error("Message could not be saved.");
      const failedFiles: { file: File; reason: string }[] = [];
      for (const file of files) {
        try {
          await uploadMessageFile("client", messageId, file);
        } catch (error) {
          failedFiles.push({
            file,
            reason: error instanceof Error ? error.message : "Upload failed.",
          });
        }
      }
      return { messageId, failedFiles, notificationWarning: posted?.notificationWarning ?? false };
    },
    onSuccess: ({ messageId, failedFiles, notificationWarning: warning }) => {
      setDraft("");
      setNotificationWarning(warning);
      setFiles(failedFiles.map(({ file }) => file));
      setUploadProblem(failedFiles.map(({ file, reason }) => `${file.name}: ${reason}`).join(" "));
      setPendingMessageId(failedFiles.length ? messageId : null);
      void queryClient.invalidateQueries({ queryKey: ["my-messages", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["ops-overview"] });
      onChanged?.();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    },
  });

  const remove = useMutation({
    mutationFn: (messageId: string) => deleteMyMessage({ data: { messageId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-messages", projectId] });
      onChanged?.();
    },
  });

  const messages = data ?? [];
  const empty = messages.length === 0;

  return (
    <Panel
      title="Messages"
      subtitle={empty ? "Nothing here yet" : `${messages.length} on this project`}
      bodyClassName="p-0"
    >
      <div className="px-5 pt-5">
        <div
          className={cn(
            "max-h-[420px] space-y-4 overflow-y-auto rounded-2xl border border-ink/8 bg-cream/60 p-4",
            empty && !isLoading && "hidden",
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-[13px] text-ink/50">
              <Loader2 className="size-4 animate-spin" />
              Opening the thread…
            </div>
          ) : null}

          {!isLoading && empty ? null : (
            <>
              {oldestFirst(messages).map((m) => (
                <MessageRow
                  key={m.id}
                  message={m}
                  clientName={clientName}
                  onDelete={
                    m.authorRole === "client" && !m.deletedAt
                      ? () => {
                          if (
                            window.confirm(
                              "Delete this message? The project record will show that it was deleted.",
                            )
                          ) {
                            remove.mutate(m.id);
                          }
                        }
                      : undefined
                  }
                  deleting={remove.isPending && remove.variables === m.id}
                  role="client"
                />
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <p role="alert" className="text-[13px] text-red-700">
              We could not open the thread.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : null}
        {remove.error ? (
          <p role="alert" className="pb-3 text-[12px] text-red-700">
            {remove.error instanceof Error
              ? remove.error.message
              : "The message could not be deleted."}
          </p>
        ) : null}
        {remove.data?.cleanupPending ? (
          <p role="alert" className="pb-3 text-[12px] text-amber-800">
            The message was deleted, but its stored file cleanup needs staff attention.
          </p>
        ) : null}

        {empty && !isLoading && !error ? (
          <p className="pb-4 text-[13px] leading-relaxed text-ink/55">
            No messages on this project yet. Ask your project manager anything — a delivery date, a
            cost, whether the roof covering has arrived — and it stays here, on the project, with a
            date on it.
          </p>
        ) : null}
      </div>

      <form
        className="border-t border-ink/8 px-5 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          if ((draft.trim().length >= 2 || files.length > 0) && !send.isPending) send.mutate();
        }}
      >
        <div className="flex flex-wrap items-end gap-3">
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            multiple
            accept={MESSAGE_ATTACHMENT_ACCEPT}
            disabled={!fileUploadAvailable}
            onChange={(event) => {
              const picked = Array.from(event.target.files ?? []);
              event.target.value = "";
              send.reset();
              setFileProblem("");
              const next = [...files];
              for (const file of picked) {
                const valid = validateMessageAttachmentMetadata(file.name, file.type, file.size);
                if (!valid.ok) {
                  setFileProblem(`${file.name}: ${valid.reason}`);
                  continue;
                }
                if (next.length >= MAX_MESSAGE_ATTACHMENTS) {
                  setFileProblem(`A message can have up to ${MAX_MESSAGE_ATTACHMENTS} files.`);
                  break;
                }
                next.push(file);
              }
              setFiles(next);
            }}
          />
          <label className="sr-only" htmlFor="msg-draft">
            Write a message to the studio
          </label>
          <textarea
            id="msg-draft"
            className="min-h-16 flex-1 resize-y rounded-xl border border-ink/15 bg-white px-3 py-2 text-[13px] focus:border-maroon focus:outline-none"
            placeholder="Ask about the roof covering, a payment, a date…"
            value={draft}
            maxLength={MESSAGE_MAX}
            disabled={Boolean(pendingMessageId) || send.isPending}
            onChange={(e) => {
              send.reset();
              setDraft(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (draft.trim().length >= 2 && !send.isPending) send.mutate();
              }
            }}
          />
          <Button
            type="submit"
            size="sm"
            disabled={(draft.trim().length < 2 && files.length === 0) || send.isPending}
          >
            {send.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            Send
          </Button>
        </div>
        <div className="mt-2">
          <div className="flex flex-wrap items-center gap-2">
            <EmojiPicker
              onPick={(emoji) => {
                send.reset();
                setDraft((current) => `${current}${emoji}`);
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={
                !fileUploadAvailable ||
                Boolean(pendingMessageId) ||
                send.isPending ||
                files.length >= MAX_MESSAGE_ATTACHMENTS
              }
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="size-4" />
              Attach files
            </Button>
            <span className="text-[10px] text-ink/45">
              {fileUploadAvailable
                ? `Up to ${MAX_MESSAGE_ATTACHMENTS} files · ${Math.round(MAX_MESSAGE_ATTACHMENT_BYTES / (1024 * 1024))} MB each`
                : attachmentAvailabilityHint}
            </span>
          </div>
        </div>
        {files.length ? (
          <ul className="mt-3 space-y-1">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center gap-2 text-[12px]"
              >
                <Paperclip className="size-3.5 text-ink/45" />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="text-ink/45">{formatMessageFileSize(file.size)}</span>
                {!pendingMessageId ? (
                  <button
                    type="button"
                    className="text-ink/45 hover:text-red-700"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => {
                      send.reset();
                      setFiles((current) => current.filter((_, i) => i !== index));
                    }}
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {fileProblem ? (
          <p role="alert" className="mt-2 text-[12px] text-red-700">
            {fileProblem}
          </p>
        ) : null}

        {send.error ? (
          <p role="alert" className="mt-2 text-[12px] text-red-700">
            {send.error instanceof Error ? send.error.message : "That did not send."}
          </p>
        ) : null}
        {send.isSuccess && files.length === 0 ? (
          <p role="status" className="mt-2 text-[12px] text-green-800">
            {notificationWarning
              ? "Your message is saved in the project thread, but the team alert could not be queued. If it is urgent, contact the office directly."
              : "Sent. Your project team can reply here."}
          </p>
        ) : null}
        {send.isSuccess && notificationWarning ? (
          <p role="alert" className="mt-1 text-[12px] text-amber-800">
            Your message is safely saved; the staff inbox will still show it.
          </p>
        ) : null}
        {pendingMessageId ? (
          <div
            role="alert"
            className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-amber-800"
          >
            <span>
              Your message was saved, but {files.length} file{files.length === 1 ? "" : "s"} did not
              upload. {uploadProblem} Retry to finish attaching them.
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(pendingMessageId, {
                  onSuccess: () => {
                    setPendingMessageId(null);
                    setFiles([]);
                    setUploadProblem("");
                  },
                })
              }
            >
              Cancel this message
            </Button>
          </div>
        ) : null}

        <p className="mt-2 text-[11px] leading-relaxed text-ink/45">{composerHint("client")}</p>
      </form>
    </Panel>
  );
}

function MessageRow({
  message,
  clientName,
  onDelete,
  deleting,
  role,
}: {
  message: Message;
  clientName?: string;
  onDelete?: () => void;
  deleting: boolean;
  role: "client";
}) {
  const mine = message.authorRole === "client";
  const who = authorLabel({
    ...message,
    authorLabel: message.authorRole === "client" && clientName ? clientName : message.authorLabel,
  });

  return (
    <article
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3",
        mine ? "ml-auto bg-maroon text-white" : "bg-white border border-ink/10 text-ink",
      )}
    >
      <header className="mb-1 flex flex-wrap items-baseline gap-2">
        <span className={cn("font-display text-[13px]", mine ? "text-gold" : "text-maroon")}>
          {who}
        </span>
        <time
          dateTime={message.createdAt}
          className={cn(
            "text-[10px] uppercase tracking-[0.08em]",
            mine ? "text-white/60" : "text-ink/40",
          )}
        >
          {formatWhen(message.createdAt)}
        </time>
        {onDelete ? (
          <button
            type="button"
            className="ml-auto inline-flex items-center gap-1 text-[10px] text-white/70 hover:text-white"
            aria-label="Delete your message"
            disabled={deleting}
            onClick={onDelete}
          >
            {deleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
            Delete
          </button>
        ) : null}
      </header>
      {message.body ? (
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{message.body}</p>
      ) : null}
      {message.attachments.map((attachment) => (
        <MessageFileCard key={attachment.id} attachment={attachment} role={role} />
      ))}
    </article>
  );
}

/** A date the client can compare with their own records. */
function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
