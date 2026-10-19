import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authorLabel, composerHint, oldestFirst, type Message } from "@/lib/messages";
import {
  markClientMessagesRead,
  postStaffMessage,
  readMessagesForStaff,
} from "@/lib/messages-server";
import { cn } from "@/lib/utils";

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

  const { data, isLoading, error } = useQuery({
    queryKey: ["staff-messages", projectId],
    queryFn: () => readMessagesForStaff({ data: { projectId } }),
  });

  const markRead = useMutation({
    mutationFn: () => markClientMessagesRead({ data: { projectId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff-messages", projectId] });
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
    mutationFn: () => postStaffMessage({ data: { projectId, body: draft } }),
    onSuccess: () => {
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: ["staff-messages", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["my-messages", projectId] });
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
      <p className="px-1 py-4 text-[13px] text-red-700">
        We could not open the thread. Refresh and try again.
      </p>
    );
  }

  if (messages.length === 0) {
    return (
      <p className="px-1 py-4 text-[13px] leading-relaxed text-ink/55">
        No messages yet. The client can write to you from their portal — when
        they do, it appears here and on the studio overview until somebody
        opens it.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-ink/8 bg-cream/60 p-4">
        {oldestFirst(messages).map((m) => (
          <StudioMessageRow key={m.id} message={m} />
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim().length >= 2 && !send.isPending) send.mutate();
        }}
      >
        <div className="flex items-end gap-3">
          <label className="sr-only" htmlFor="staff-reply">
            Reply to the client
          </label>
          <textarea
            id="staff-reply"
            className="min-h-16 flex-1 resize-y rounded-xl border border-ink/15 bg-white px-3 py-2 text-[13px] focus:border-maroon focus:outline-none"
            placeholder="Answer the client — a date, a cost, what happens next…"
            value={draft}
            maxLength={4000}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={draft.trim().length < 2 || send.isPending}>
            {send.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            Reply
          </Button>
        </div>

        {send.error ? (
          <p className="mt-2 text-[12px] text-red-700">
            {send.error instanceof Error ? send.error.message : "That did not send."}
          </p>
        ) : null}

        <p className="mt-2 text-[11px] leading-relaxed text-ink/45">{composerHint("studio")}</p>
      </form>
    </div>
  );
}

function StudioMessageRow({ message }: { message: Message }) {
  const fromClient = message.authorRole === "client";
  const who = authorLabel(message);
  const when = formatWhen(message.createdAt);

  return (
    <article
      className={cn(
        "max-w-[88%] rounded-2xl px-4 py-3",
        fromClient
          ? "border border-ink/10 bg-white"
          : "ml-auto bg-maroon text-white",
      )}
    >
      <header className="mb-1 flex flex-wrap items-baseline gap-2">
        <span className={cn("font-display text-[13px]", fromClient ? "text-maroon" : "text-gold")}>
          {who}
        </span>
        <time
          dateTime={message.createdAt}
          className={cn("text-[10px] uppercase tracking-[0.08em]", fromClient ? "text-ink/40" : "text-white/60")}
        >
          {when}
        </time>
        {!message.readAt && fromClient ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-amber-800">
            Unread
          </span>
        ) : null}
      </header>
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{message.body}</p>
    </article>
  );
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
