/**
 * The conversation, kept on the record.
 *
 * A client building from Manchester messages their project manager from inside
 * the portal instead of WhatsApp. Two things make that different from a chat
 * app: the thread belongs to the project, so nothing is lost when staff change
 * or a phone is replaced, and who has read what is recorded, so "we replied" is
 * something the client can see rather than something the studio claims.
 *
 * Read tracking is recipient-side on purpose. A message is read by the person
 * who did not write it, so one timestamp per message answers both questions —
 * has the studio seen the client's question, and has the client seen the answer
 * — without storing two flags that could disagree.
 */

export const ROLES = ["client", "studio"] as const;
export type MessageRole = (typeof ROLES)[number];

export type Message = {
  id: string;
  projectId: string;
  /** Position in the thread, so the order never depends on a clock. */
  ord: number;
  authorRole: MessageRole;
  authorId: string;
  /** Who to show as the author. Empty means fall back to the role label. */
  authorLabel: string;
  body: string;
  createdAt: string;
  /** When the other side opened it. Null means still unread. */
  readAt: string | null;
};

export const MESSAGE_MIN = 2;
export const MESSAGE_MAX = 2000;

/**
 * A message has to be a message.
 *
 * Whitespace-only is refused rather than stored as an empty bubble, and the
 * cap keeps the thread readable on a phone and bounded in the database. The
 * minimum is deliberately low — "ok, thanks" is a real thing a client says and
 * a portal that demands an essay is a portal people go back to WhatsApp to
 * avoid.
 */
export function validateMessage(
  body: string,
): { ok: true; body: string } | { ok: false; reason: string } {
  const trimmed = body.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (trimmed.length < MESSAGE_MIN) {
    return { ok: false, reason: "Write a message first." };
  }
  if (trimmed.length > MESSAGE_MAX) {
    return {
      ok: false,
      reason: `That is ${trimmed.length} characters — keep it under ${MESSAGE_MAX}.`,
    };
  }
  return { ok: true, body: trimmed };
}

/** What the author is called in the thread. */
export function authorLabel(message: Pick<Message, "authorRole" | "authorLabel">): string {
  const named = message.authorLabel.trim();
  if (named) return named;
  return message.authorRole === "studio" ? "ATRO studio" : "The client";
}

/** Messages the given role has not opened yet — that is, written by the other side. */
export function unreadFor(messages: Message[], role: MessageRole): number {
  return messages.filter((m) => m.authorRole !== role && m.readAt === null).length;
}

export type ThreadSummary = {
  /** The newest message, whatever side wrote it. Null on an empty thread. */
  last: Message | null;
  unread: number;
  /** Short one-line preview of the newest message, for a nav badge or list. */
  preview: string;
};

export function summariseThread(messages: Message[], role: MessageRole): ThreadSummary {
  const ordered = [...messages].sort((a, b) => a.ord - b.ord);
  const last = ordered[ordered.length - 1] ?? null;
  return {
    last,
    unread: unreadFor(messages, role),
    preview: last ? oneLine(last.body) : "No messages yet.",
  };
}

/** Newest first, for rendering a thread. */
export function newestFirst(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => b.ord - a.ord);
}

/** Oldest first — the order a conversation is actually read in. */
export function oldestFirst(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => a.ord - b.ord);
}

function oneLine(body: string): string {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > 90 ? `${flat.slice(0, 89)}…` : flat;
}

/**
 * The sentence under the composer.
 *
 * It says where the message goes. The alternative — an empty box with no
 * context — is how a client ends up unsure whether they have just written
 * something private into a form that nobody reads.
 */
export function composerHint(role: MessageRole): string {
  return role === "client"
    ? "Goes to your project manager. They see it in the studio console with your project open — nothing here is a WhatsApp message that scrolls away."
    : "The client sees this in their portal, on the project, with a date on it.";
}