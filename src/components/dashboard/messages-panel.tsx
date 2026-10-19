import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { authorLabel, composerHint, oldestFirst, type Message } from "@/lib/messages";
import {
  listMyMessages,
  markStudioMessagesRead,
  postMyMessage,
} from "@/lib/messages-server";
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
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-messages", projectId],
    queryFn: () => listMyMessages({ data: { projectId } }),
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
    mutationFn: () => postMyMessage({ data: { projectId, body: draft } }),
    onSuccess: () => {
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: ["my-messages", projectId] });
      void queryClient.invalidateQueries({ queryKey: ["ops-overview"] });
      onChanged?.();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
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
            empty && "hidden",
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
                <MessageRow key={m.id} message={m} clientName={clientName} />
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {error ? (
          <p className="pb-4 text-[13px] text-red-700">
            We could not open the thread. Refresh the page and try again.
          </p>
        ) : null}

        {empty && !isLoading && !error ? (
          <p className="pb-4 text-[13px] leading-relaxed text-ink/55">
            No messages on this project yet. Ask your project manager anything —
            a delivery date, a cost, whether the roof covering has arrived — and
            it stays here, on the project, with a date on it.
          </p>
        ) : null}
      </div>

      <form
        className="border-t border-ink/8 px-5 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim().length >= 2 && !send.isPending) send.mutate();
        }}
      >
        <div className="flex items-end gap-3">
          <label className="sr-only" htmlFor="msg-draft">
            Write a message to the studio
          </label>
          <textarea
            id="msg-draft"
            className="min-h-16 flex-1 resize-y rounded-xl border border-ink/15 bg-white px-3 py-2 text-[13px] focus:border-maroon focus:outline-none"
            placeholder="Ask about the roof covering, a payment, a date…"
            value={draft}
            maxLength={4000}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (draft.trim().length >= 2 && !send.isPending) send.mutate();
              }
            }}
          />
          <Button type="submit" size="sm" disabled={draft.trim().length < 2 || send.isPending}>
            {send.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            Send
          </Button>
        </div>

        {send.error ? (
          <p className="mt-2 text-[12px] text-red-700">
            {send.error instanceof Error ? send.error.message : "That did not send."}
          </p>
        ) : null}

        <p className="mt-2 text-[11px] leading-relaxed text-ink/45">{composerHint("client")}</p>
      </form>
    </Panel>
  );
}

function MessageRow({ message, clientName }: { message: Message; clientName?: string }) {
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
        <span
          className={cn(
            "font-display text-[13px]",
            mine ? "text-gold" : "text-maroon",
          )}
        >
          {who}
        </span>
        <time
          dateTime={message.createdAt}
          className={cn("text-[10px] uppercase tracking-[0.08em]", mine ? "text-white/60" : "text-ink/40")}
        >
          {formatWhen(message.createdAt)}
        </time>
      </header>
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{message.body}</p>
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
