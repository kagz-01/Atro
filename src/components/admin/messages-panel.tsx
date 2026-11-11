import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/messages/emoji-picker";
import { MessageThread, ReplyingTo } from "@/components/messages/message-thread";
import {
  composerHint,
  MESSAGE_MAX,
  MESSAGE_REACTIONS,
  oldestFirst,
  type Message,
} from "@/lib/messages";
import {
  getMessageAttachmentAvailability,
  markClientMessagesRead,
  postStaffMessage,
  readMessagesForStaff,
  deleteStaffMessage,
  toggleStaffMessageReaction,
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

/**
 * The thread, in the studio console.
 *
 * Opening it marks the client's messages as read, so the badge clears when
 * somebody has actually looked — not when they clicked past it. The thread
 * opens itself when the client is waiting for an answer, because the whole
 * point of putting this in the console is that a message from a client in
 * another country does not sit unheard for a week.
 *
 * The reply is sent as the member who is signed in, under their name.
 */
export function StudioMessagesPanel({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileProblem, setFileProblem] = useState("");
  const [uploadProblem, setUploadProblem] = useState("");
  const [notificationWarning, setNotificationWarning] = useState(false);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);

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
    queryKey: ["staff-messages", projectId],
    queryFn: () => readMessagesForStaff({ data: { projectId } }),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const react = useMutation({
    mutationFn: ({
      messageId,
      emoji,
    }: {
      messageId: string;
      emoji: (typeof MESSAGE_REACTIONS)[number];
    }) => toggleStaffMessageReaction({ data: { messageId, emoji } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff-messages", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["my-messages", projectId] });
    },
  });

  const markRead = useMutation({
    mutationFn: () => markClientMessagesRead({ data: { projectId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff-messages", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["staff-message-threads"] });
      void queryClient.invalidateQueries({ queryKey: ["ops-overview"] });
      // Also clear the client's badge view of this thread.
      void queryClient.invalidateQueries({ queryKey: ["my-messages", projectId] });
    },
  });

  const hasUnread = (data ?? []).some((m) => m.authorRole === "client" && !m.readAt);
  useEffect(() => {
    if (hasUnread && !markRead.isPending) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnread, data]);

  const send = useMutation({
    mutationFn: async () => {
      const posted = pendingMessageId
        ? null
        : await postStaffMessage({
            data: {
              projectId,
              body: draft,
              hasAttachments: files.length > 0,
              replyToMessageId: replyTo?.id,
            },
          });
      const messageId = pendingMessageId ?? posted?.messageId;
      if (!messageId) throw new Error("Message could not be saved.");
      const failedFiles: { file: File; reason: string }[] = [];
      for (const file of files) {
        try {
          await uploadMessageFile("studio", messageId, file);
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
      setReplyTo(null);
      setNotificationWarning(warning);
      setFiles(failedFiles.map(({ file }) => file));
      setUploadProblem(failedFiles.map(({ file, reason }) => `${file.name}: ${reason}`).join(" "));
      setPendingMessageId(failedFiles.length ? messageId : null);
      void queryClient.invalidateQueries({ queryKey: ["staff-messages", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["staff-message-threads"] });
      void queryClient.invalidateQueries({ queryKey: ["my-messages", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["ops-overview"] });
    },
  });

  const remove = useMutation({
    mutationFn: (messageId: string) => deleteStaffMessage({ data: { messageId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff-messages", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["staff-message-threads"] });
      void queryClient.invalidateQueries({ queryKey: ["ops-overview"] });
    },
  });

  const messages = data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-1 py-6 text-[13px] text-ink/50">
        <Loader2 className="size-4 animate-spin" />
        Opening the thread…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-4">
        <p role="alert" className="text-[13px] text-red-700">
          We could not open the thread.
        </p>
        <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.length > 0 ? (
        <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-ink/8 bg-cream/60 p-4">
          <MessageThread
            messages={oldestFirst(messages)}
            viewerRole="studio"
            onReply={(message) => {
              setReplyTo(message);
              requestAnimationFrame(() => draftRef.current?.focus());
            }}
            onReact={(messageId, emoji) => react.mutate({ messageId, emoji })}
            onDelete={(message) => {
              if (
                message.authorRole === "studio" &&
                window.confirm(
                  "Delete this message? The project record will show that it was deleted.",
                )
              ) {
                remove.mutate(message.id);
              }
            }}
            reactionPendingId={react.isPending ? react.variables?.messageId : null}
            deletingId={remove.isPending ? remove.variables : null}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-ink/15 px-4 py-5 text-[13px] leading-relaxed text-ink/55">
          No messages yet. Start the project conversation here; the client will see your message in
          their portal.
        </p>
      )}

      <form
        className="rounded-2xl bg-white"
        onSubmit={(e) => {
          e.preventDefault();
          if ((draft.trim().length >= 2 || files.length > 0) && !send.isPending) send.mutate();
        }}
      >
        {replyTo ? <ReplyingTo message={replyTo} onCancel={() => setReplyTo(null)} /> : null}
        <div className="flex flex-col gap-1">
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
          <label className="sr-only" htmlFor="staff-reply">
            Reply to the client
          </label>
          <div className="flex min-w-0 items-end gap-1 rounded-2xl border border-ink/15 bg-white p-1.5 shadow-sm transition-colors focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
            <EmojiPicker
              onPick={(emoji) => {
                send.reset();
                setDraft((current) => `${current}${emoji}`);
                draftRef.current?.focus();
              }}
            />
            <button
              type="button"
              aria-label="Attach files"
              title={
                fileUploadAvailable
                  ? "Attach files"
                  : (attachmentAvailabilityHint ?? "File attachments are unavailable")
              }
              disabled={
                !fileUploadAvailable ||
                Boolean(pendingMessageId) ||
                send.isPending ||
                files.length >= MAX_MESSAGE_ATTACHMENTS
              }
              onClick={() => fileInputRef.current?.click()}
              className="grid size-11 shrink-0 place-items-center rounded-full text-maroon transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon disabled:cursor-not-allowed disabled:text-ink/25 disabled:hover:bg-transparent"
            >
              <Paperclip className="size-5" aria-hidden />
            </button>
            <textarea
              ref={draftRef}
              id="staff-reply"
              className="max-h-32 min-h-11 min-w-0 flex-1 resize-y border-0 bg-transparent px-2 py-2.5 text-[13px] leading-5 outline-none placeholder:text-ink/40 focus:border-transparent focus:outline-none focus:ring-0"
              placeholder={
                messages.length ? "Reply to the client…" : "Start the project conversation…"
              }
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
            <button
              type="submit"
              aria-label="Send reply"
              title="Send reply"
              disabled={(draft.trim().length < 2 && files.length === 0) || send.isPending}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-burgundy text-white transition-colors hover:bg-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:bg-ink/15"
            >
              {send.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
            </button>
          </div>
          <p className="mt-1.5 min-h-4 pl-2 text-[10px] text-ink/40">
            {fileUploadAvailable
              ? `Attach up to ${MAX_MESSAGE_ATTACHMENTS} files · ${Math.round(MAX_MESSAGE_ATTACHMENT_BYTES / (1024 * 1024))} MB each`
              : availabilityLoading
                ? "Checking file sharing…"
                : attachmentAvailabilityError
                  ? "Could not check file sharing. Try reloading this conversation."
                  : "File attachments are unavailable right now."}
          </p>
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
        {react.error ? (
          <p role="alert" className="mt-2 text-[12px] text-red-700">
            {react.error instanceof Error
              ? react.error.message
              : "The reaction could not be saved."}
          </p>
        ) : null}

        {send.error ? (
          <p role="alert" className="mt-2 text-[12px] text-red-700">
            {send.error instanceof Error ? send.error.message : "That did not send."}
          </p>
        ) : null}
        {send.isSuccess ? (
          <p role="status" className="mt-2 text-[12px] text-green-800">
            {pendingMessageId
              ? "Your message was saved, but some files could not be uploaded. Retry to finish attaching them."
              : notificationWarning
                ? "Your reply is saved in the client’s project portal, but their alert could not be queued."
                : "Sent to the client’s project portal."}
          </p>
        ) : null}
        {send.isSuccess && notificationWarning ? (
          <p role="alert" className="mt-1 text-[12px] text-amber-800">
            The client can still see the reply in their portal.
          </p>
        ) : null}
        {pendingMessageId && uploadProblem ? (
          <div
            role="alert"
            className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-amber-800"
          >
            <span>{uploadProblem}</span>
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
        {remove.error ? (
          <p role="alert" className="mt-2 text-[12px] text-red-700">
            {remove.error instanceof Error
              ? remove.error.message
              : "The message could not be deleted."}
          </p>
        ) : null}
        {remove.data?.cleanupPending ? (
          <p role="alert" className="mt-2 text-[12px] text-amber-800">
            The message was deleted, but its stored file cleanup needs staff attention.
          </p>
        ) : null}

        <p className="mt-2 text-[11px] leading-relaxed text-ink/45">{composerHint("studio")}</p>
      </form>
    </div>
  );
}
