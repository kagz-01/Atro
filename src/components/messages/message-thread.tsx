import { useState } from "react";
import { Loader2, MessageSquareReply, SmilePlus, Trash2, X } from "lucide-react";
import { MessageFileCard } from "@/components/messages/message-files";
import { authorLabel, MESSAGE_REACTIONS, type Message, type MessageRole } from "@/lib/messages";
import { cn } from "@/lib/utils";

const REACTION_LABELS: Record<(typeof MESSAGE_REACTIONS)[number], string> = {
  "👍": "Thumbs up",
  "❤️": "Heart",
  "😂": "Laugh",
  "😮": "Surprised",
  "🙏": "Thanks",
  "🎉": "Celebrate",
};

export function MessageThread({
  messages,
  viewerRole,
  clientName,
  onReply,
  onReact,
  onDelete,
  reactionPendingId,
  deletingId,
}: {
  messages: Message[];
  viewerRole: MessageRole;
  clientName?: string;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: (typeof MESSAGE_REACTIONS)[number]) => void;
  onDelete?: (message: Message) => void;
  reactionPendingId?: string | null;
  deletingId?: string | null;
}) {
  return (
    <ol className="space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          viewerRole={viewerRole}
          clientName={clientName}
          onReply={() => onReply(message)}
          onReact={(emoji) => onReact(message.id, emoji)}
          onDelete={onDelete ? () => onDelete(message) : undefined}
          reactionPending={reactionPendingId === message.id}
          deleting={deletingId === message.id}
        />
      ))}
    </ol>
  );
}

export function ReplyingTo({
  message,
  clientName,
  onCancel,
}: {
  message: Message;
  clientName?: string;
  onCancel: () => void;
}) {
  const label = authorLabel({
    authorRole: message.authorRole,
    authorLabel: message.authorRole === "client" && clientName ? clientName : message.authorLabel,
  });
  return (
    <div className="mb-3 flex items-start gap-3 rounded-xl border-l-4 border-gold bg-cream px-3 py-2.5">
      <MessageSquareReply className="mt-0.5 size-4 shrink-0 text-maroon" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-maroon">Replying to {label}</p>
        <p className="mt-0.5 truncate text-[12px] text-ink/60">
          {message.deletedAt ? "Message deleted" : message.body || "Attachment"}
        </p>
      </div>
      <button
        type="button"
        className="grid size-8 shrink-0 place-items-center rounded-lg text-ink/50 hover:bg-white hover:text-maroon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon"
        aria-label="Cancel reply"
        onClick={onCancel}
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function MessageBubble({
  message,
  viewerRole,
  clientName,
  onReply,
  onReact,
  onDelete,
  reactionPending,
  deleting,
}: {
  message: Message;
  viewerRole: MessageRole;
  clientName?: string;
  onReply: () => void;
  onReact: (emoji: (typeof MESSAGE_REACTIONS)[number]) => void;
  onDelete?: () => void;
  reactionPending: boolean;
  deleting: boolean;
}) {
  const [reactionMenuOpen, setReactionMenuOpen] = useState(false);
  const mine = message.authorRole === viewerRole;
  const name = authorLabel({
    ...message,
    authorLabel: message.authorRole === "client" && clientName ? clientName : message.authorLabel,
  });
  const replyName = message.replyTo
    ? authorLabel({
        authorRole: message.replyTo.authorRole,
        authorLabel:
          message.replyTo.authorRole === "client" && clientName
            ? clientName
            : message.replyTo.authorLabel,
      })
    : "";
  const when = formatWhen(message.createdAt);

  return (
    <li className={cn("flex min-w-0", mine ? "justify-end" : "justify-start")}>
      <article
        className={cn(
          "group min-w-0 max-w-[92%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[82%]",
          mine
            ? "rounded-br-md bg-maroon text-white"
            : "rounded-bl-md border border-ink/10 bg-white text-ink",
        )}
      >
        <header className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className={cn("font-display text-[13px]", mine ? "text-gold" : "text-maroon")}>
            {name}
          </span>
          {viewerRole === "studio" && message.authorRole === "client" && !message.readAt ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-amber-800">
              Unread
            </span>
          ) : null}
          <time
            dateTime={message.createdAt}
            className={cn("text-[10px]", mine ? "text-white/60" : "text-ink/40")}
          >
            {when}
          </time>
        </header>

        {message.replyTo ? (
          <div
            className={cn(
              "mb-2 rounded-lg border-l-2 px-2.5 py-1.5",
              mine ? "border-gold/70 bg-black/15" : "border-gold bg-cream/70",
            )}
          >
            <p className={cn("text-[10px] font-semibold", mine ? "text-gold" : "text-maroon")}>
              {replyName}
            </p>
            <p
              className={cn(
                "mt-0.5 line-clamp-2 whitespace-pre-wrap text-[11px]",
                mine ? "text-white/75" : "text-ink/55",
              )}
            >
              {message.replyTo.body}
            </p>
          </div>
        ) : null}

        {message.body ? (
          <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
            {message.body}
          </p>
        ) : null}
        {message.attachments.map((attachment) => (
          <MessageFileCard key={attachment.id} attachment={attachment} role={viewerRole} />
        ))}

        {!message.deletedAt ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                aria-label={`${REACTION_LABELS[reaction.emoji]}${reaction.reactedByMe ? ", remove your reaction" : `, ${reaction.count} reactions`}`}
                aria-pressed={reaction.reactedByMe}
                disabled={reactionPending}
                onClick={() => onReact(reaction.emoji)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1 rounded-full border px-2.5 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  reaction.reactedByMe
                    ? "border-gold bg-gold/20"
                    : mine
                      ? "border-white/20 bg-white/10 hover:bg-white/20"
                      : "border-ink/10 bg-cream hover:bg-gold/15",
                )}
              >
                <span aria-hidden>{reaction.emoji}</span>
                <span className={mine ? "text-white/80" : "text-ink/65"}>{reaction.count}</span>
              </button>
            ))}

            <div className="relative">
              <button
                type="button"
                aria-label={`React to ${name}'s message`}
                aria-expanded={reactionMenuOpen}
                disabled={reactionPending}
                onClick={() => setReactionMenuOpen((open) => !open)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1 rounded-full border px-2.5 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  mine
                    ? "border-white/20 text-white/75 hover:bg-white/10"
                    : "border-ink/10 text-ink/55 hover:bg-cream",
                )}
              >
                <SmilePlus className="size-3.5" aria-hidden />
                React
              </button>
              {reactionMenuOpen ? (
                <div
                  role="group"
                  aria-label="Choose a reaction"
                  className="absolute bottom-full left-0 z-30 mb-2 flex rounded-xl border border-ink/10 bg-white p-1.5 shadow-lg"
                >
                  {MESSAGE_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={REACTION_LABELS[emoji]}
                      title={REACTION_LABELS[emoji]}
                      className="grid size-11 place-items-center rounded-lg text-xl hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon"
                      onClick={() => {
                        onReact(emoji);
                        setReactionMenuOpen(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onReply}
              className={cn(
                "inline-flex min-h-11 items-center gap-1 rounded-full px-2.5 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                mine ? "text-white/75 hover:bg-white/10" : "text-ink/55 hover:bg-cream",
              )}
            >
              <MessageSquareReply className="size-3.5" aria-hidden />
              Reply
            </button>

            {onDelete ? (
              <button
                type="button"
                aria-label="Delete your message"
                disabled={deleting}
                onClick={onDelete}
                className={cn(
                  "ml-auto inline-flex min-h-11 items-center gap-1 rounded-full px-2.5 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  mine ? "text-white/70 hover:bg-white/10" : "text-ink/45 hover:bg-cream",
                )}
              >
                {deleting ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="size-3.5" aria-hidden />
                )}
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </article>
    </li>
  );
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
