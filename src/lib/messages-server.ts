// The conversation, on both sides of the portal.
//
// The client writes from the portal; the studio answers from the console. Both
// are gated: a client may only write on a project they own, proven by walking
// row → project → user_id rather than trusting a project id in the request, and
// every studio write goes through requireStaff.
//
// Read is recorded explicitly rather than as a side effect of listing, so the
// list stays a pure read and "seen" means somebody deliberately opened the
// thread. Opening the thread is what marks it read — there is no separate
// button, because asking a client to press "mark as read" after reading is the
// kind of thing that trains people to ignore the badge.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { accountMiddleware, authMiddleware } from "@/lib/auth/middleware";
import { requireStaff } from "@/lib/staff-session.server";
import { getSql, type Sql } from "@/lib/db";
import { notify, type NotificationInput } from "@/lib/notify";
import { serviceRoleConfigured } from "@/lib/supabase/config";
import {
  MAX_MESSAGE_ATTACHMENT_BYTES,
  MAX_MESSAGE_ATTACHMENTS,
  validateMessageAttachment,
  validateMessageAttachmentMetadata,
} from "@/lib/message-attachments";
import { getMessageStorage } from "@/lib/message-storage.server";
import {
  MESSAGE_REACTIONS,
  MESSAGE_MAX,
  validateMessage,
  validateMessageReaction,
  type MessageAttachment,
  type Message,
  type MessageRole,
} from "@/lib/messages";

const toMessage = (r: Record<string, unknown>): Message => ({
  id: String(r.id),
  projectId: String(r.project_id),
  ord: Number(r.ord ?? 0),
  authorRole: String(r.author_role ?? "client") as MessageRole,
  authorId: String(r.author_id ?? ""),
  authorLabel: String(r.author_label ?? ""),
  body: String(r.body ?? ""),
  createdAt: r.created_at ? String(r.created_at) : "",
  readAt: r.read_at ? String(r.read_at) : null,
  deletedAt: r.deleted_at ? String(r.deleted_at) : null,
  attachments: [],
  reactions: [],
  replyTo: r.reply_to_id
    ? {
        id: String(r.reply_to_id),
        authorRole: String(r.reply_author_role ?? "client") as MessageRole,
        authorLabel: String(r.reply_author_label ?? ""),
        body: r.reply_deleted_at
          ? "Message deleted"
          : String(r.reply_body ?? "")
              .replace(/^File attachment$/, "Attachment")
              .slice(0, 200) || "Attachment",
      }
    : null,
});

async function readThread(
  sql: Sql,
  projectId: string,
  viewer: { role: MessageRole; userId: string },
): Promise<Message[]> {
  const rows = await sql<Record<string, unknown>>`
    select message.id, message.project_id, message.ord, message.author_role,
      message.author_id, message.author_label, message.body, message.created_at,
      message.read_at, message.deleted_at, message.reply_to_id,
      reply.author_role as reply_author_role, reply.author_label as reply_author_label,
      reply.body as reply_body, reply.deleted_at as reply_deleted_at
    from portal_message message
    left join portal_message reply on reply.id = message.reply_to_id
    where message.project_id = ${projectId}
    order by message.ord
  `;
  const messages = rows.map(toMessage);
  if (messages.length === 0) return messages;
  const [attachmentRows, reactionRows] = await Promise.all([
    sql<Record<string, unknown>>`
    select id, message_id, filename, mime, size_bytes
    from portal_message_attachment
    where message_id = any(${messages.map((message) => message.id)}::uuid[])
      and deleted_at is null and status = 'ready'
    order by created_at, id
    `,
    sql<Record<string, unknown>>`
      select message_id, role, user_id, emoji
      from portal_message_reaction
      where message_id = any(${messages.map((message) => message.id)}::uuid[])
      order by created_at, id
    `,
  ]);
  const byMessage = new Map<string, MessageAttachment[]>();
  for (const row of attachmentRows) {
    const messageId = String(row.message_id);
    const attachments = byMessage.get(messageId) ?? [];
    attachments.push({
      id: String(row.id),
      filename: String(row.filename),
      mime: String(row.mime),
      sizeBytes: Number(row.size_bytes),
    });
    byMessage.set(messageId, attachments);
  }
  const activeMessageIds = new Set(
    messages.filter((message) => !message.deletedAt).map((message) => message.id),
  );
  const reactionsByMessage = new Map<
    string,
    Map<(typeof MESSAGE_REACTIONS)[number], { count: number; reactedByMe: boolean }>
  >();
  for (const row of reactionRows) {
    const messageId = String(row.message_id);
    if (!activeMessageIds.has(messageId)) continue;
    const emoji = String(row.emoji);
    if (!validateMessageReaction(emoji)) {
      throw new Error("An unsupported reaction was found in the project thread.");
    }
    const groups = reactionsByMessage.get(messageId) ?? new Map();
    const group = groups.get(emoji) ?? { count: 0, reactedByMe: false };
    group.count += 1;
    group.reactedByMe ||= row.role === viewer.role && row.user_id === viewer.userId;
    groups.set(emoji, group);
    reactionsByMessage.set(messageId, groups);
  }
  return messages.map((message) => ({
    ...message,
    body: message.deletedAt
      ? "Message deleted"
      : byMessage.get(message.id)?.length && message.body === "File attachment"
        ? ""
        : message.body,
    attachments: message.deletedAt ? [] : (byMessage.get(message.id) ?? []),
    reactions: message.deletedAt
      ? []
      : [...(reactionsByMessage.get(message.id) ?? [])].map(([emoji, value]) => ({
          emoji,
          ...value,
        })),
  }));
}

/**
 * Who the message is attributed to.
 *
 * The studio side uses the member's name from the user record — a client
 * reading "Nanjala Oduor replied" is a different experience from an email
 * address, and the name is already there. Falls back to the address, then to a
 * role label, so an attribution is never an empty line.
 */
async function studioLabel(sql: Sql, staff: { userId: string; email: string }): Promise<string> {
  const [u] = await sql<{ name: string | null }>`
    select name from "user" where id = ${staff.userId}
  `;
  return u?.name?.trim() || staff.email;
}

async function clientLabel(sql: Sql, projectId: string): Promise<string> {
  const [p] = await sql<{ user_id: string; client_label: string }>`
    select user_id, client_label from portal_projects where id = ${projectId}
  `;
  const [profile] = p
    ? await sql<{ display_name: string }>`
        select display_name from client_profile where user_id = ${p.user_id}
      `
    : [];
  return profile?.display_name?.trim() || p?.client_label?.trim() || "";
}

async function insertMessage(
  sql: Sql,
  message: {
    projectId: string;
    authorRole: MessageRole;
    authorId: string;
    authorLabel: string;
    body: string;
    replyToMessageId?: string;
  },
): Promise<string> {
  const [inserted] = await sql<{ id: string }>`
    with project_lock as materialized (
      select pg_advisory_xact_lock(hashtextextended(${message.projectId}, 0))
    ),
    next_ord as (
      select coalesce(max(ord), 0)::int + 1 as ord
      from portal_message cross join project_lock
      where project_id = ${message.projectId}
    )
    insert into portal_message (
      project_id, ord, author_role, author_id, author_label, body, reply_to_id
    )
    select ${message.projectId}, ord, ${message.authorRole}, ${message.authorId},
      ${message.authorLabel}, ${message.body}, ${message.replyToMessageId ?? null}
    from next_ord
    returning id
  `;
  if (!inserted) throw new Error("Message could not be saved.");
  return inserted.id;
}

type MessageActor = { role: MessageRole; userId: string };

async function validateReplyTarget(sql: Sql, projectId: string, replyToMessageId?: string) {
  if (!replyToMessageId) return;
  const [target] = await sql<{ id: string }>`
    select id from portal_message
    where id = ${replyToMessageId} and project_id = ${projectId} and deleted_at is null
  `;
  if (!target) throw new Error("The message you are replying to is no longer available.");
}

async function authorizeMessage(
  sql: Sql,
  messageId: string,
  actor: MessageActor,
  ownMessagesOnly: boolean,
) {
  const [message] = await sql<{ id: string; project_id: string }>`
    select m.id, m.project_id
    from portal_message m
    join portal_projects p on p.id = m.project_id
    where m.id = ${messageId} and m.deleted_at is null
      and (
        ${ownMessagesOnly} = false
        or (m.author_role = ${actor.role} and m.author_id = ${actor.userId})
      )
      and (${actor.role === "studio"} = true or p.user_id = ${actor.userId})
  `;
  if (!message) throw new Error("Message not found.");
  return message;
}

async function toggleReaction(sql: Sql, messageId: string, actor: MessageActor, emoji: string) {
  if (!validateMessageReaction(emoji)) throw new Error("Choose a supported reaction.");
  const message = await authorizeMessage(sql, messageId, actor, false);
  const [current] = await sql<{ emoji: string }>`
    select emoji from portal_message_reaction
    where message_id = ${message.id} and role = ${actor.role} and user_id = ${actor.userId}
  `;
  if (current?.emoji === emoji) {
    await sql`
      delete from portal_message_reaction
      where message_id = ${message.id} and role = ${actor.role} and user_id = ${actor.userId}
    `;
    return { ok: true as const, active: false };
  }
  await sql`
    insert into portal_message_reaction (message_id, role, user_id, emoji)
    values (${message.id}, ${actor.role}, ${actor.userId}, ${emoji})
    on conflict (message_id, role, user_id)
    do update set emoji = excluded.emoji, created_at = now()
  `;
  return { ok: true as const, active: true };
}

async function prepareMessageAttachment(
  sql: Sql,
  storage: Awaited<ReturnType<typeof getMessageStorage>>,
  message: { id: string; project_id: string },
  filename: string,
  mime: string,
  sizeBytes: number,
) {
  const metadata = validateMessageAttachmentMetadata(filename, mime, sizeBytes);
  if (!metadata.ok) throw new Error(metadata.reason);

  const expired = await sql<{ id: string; storage_path: string }>`
    select id, storage_path from portal_message_attachment
    where message_id = ${message.id} and status = 'pending'
      and deleted_at is null and created_at < now() - interval '1 hour'
  `;
  if (expired.length) {
    const removed = await storage.remove(expired.map((attachment) => attachment.storage_path));
    if (removed.error) {
      throw new Error(`Could not clear an expired file upload: ${removed.error.message}`);
    }
    await sql`
      update portal_message_attachment set deleted_at = now()
      where id = any(${expired.map((attachment) => attachment.id)}::uuid[])
    `;
  }

  const attachmentId = crypto.randomUUID();
  const storagePath = `${message.project_id}/${message.id}/${attachmentId}/${metadata.filename}`;
  const [reserved] = await sql<{ id: string }>`
    with attachment_lock as materialized (
      select pg_advisory_xact_lock(hashtextextended(${message.id}, 0))
    ),
    active_count as (
      select count(*)::int as n
      from portal_message_attachment cross join attachment_lock
      where message_id = ${message.id} and deleted_at is null
    )
    insert into portal_message_attachment (
      id, message_id, filename, mime, size_bytes, storage_path, status
    )
    select ${attachmentId}, ${message.id}, ${metadata.filename}, ${metadata.mime},
      ${metadata.sizeBytes}, ${storagePath}, 'pending'
    from active_count where n < ${MAX_MESSAGE_ATTACHMENTS}
    returning id
  `;
  if (!reserved) {
    throw new Error(`A message can have up to ${MAX_MESSAGE_ATTACHMENTS} files.`);
  }

  const signed = await storage.createSignedUploadUrl(storagePath, { upsert: false });
  if (signed.error) {
    await sql`
      update portal_message_attachment
      set deleted_at = now()
      where id = ${attachmentId}
    `;
    throw new Error(`Could not prepare file upload: ${signed.error.message}`);
  }
  return { attachmentId, path: storagePath, token: signed.data.token };
}

async function finishMessageAttachment(
  sql: Sql,
  storage: Awaited<ReturnType<typeof getMessageStorage>>,
  attachmentId: string,
  messageId: string,
  actor: MessageActor,
  ownMessagesOnly: boolean,
) {
  const message = await authorizeMessage(sql, messageId, actor, ownMessagesOnly);
  const [attachment] = await sql<{
    id: string;
    filename: string;
    mime: string;
    size_bytes: number;
    storage_path: string;
  }>`
    select a.id, a.filename, a.mime, a.size_bytes, a.storage_path
    from portal_message_attachment a
    where a.id = ${attachmentId} and a.message_id = ${message.id}
      and a.status = 'pending' and a.deleted_at is null
  `;
  if (!attachment) throw new Error("This file upload is no longer available.");

  const downloaded = await storage.download(attachment.storage_path);
  if (downloaded.error || !downloaded.data) {
    throw new Error(
      `Could not verify uploaded file: ${downloaded.error?.message ?? "file not found"}`,
    );
  }
  const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
  if (bytes.byteLength !== Number(attachment.size_bytes)) {
    await storage.remove([attachment.storage_path]);
    await sql`
      update portal_message_attachment set deleted_at = now()
      where id = ${attachment.id}
    `;
    throw new Error("The uploaded file size did not match. Choose it again and retry.");
  }
  const verified = validateMessageAttachment({
    filename: attachment.filename,
    mime: attachment.mime,
    bytes,
  });
  if (!verified.ok) {
    await storage.remove([attachment.storage_path]);
    await sql`
      update portal_message_attachment set deleted_at = now()
      where id = ${attachment.id}
    `;
    throw new Error(verified.reason);
  }
  await sql`
    update portal_message_attachment set status = 'ready'
    where id = ${attachment.id} and message_id = ${message.id}
      and status = 'pending' and deleted_at is null
  `;
  return {
    id: attachment.id,
    filename: verified.attachment.filename,
    mime: verified.attachment.mime,
    sizeBytes: verified.attachment.sizeBytes,
  };
}

async function removePendingMessageAttachment(
  sql: Sql,
  storage: Awaited<ReturnType<typeof getMessageStorage>>,
  attachmentId: string,
  messageId: string,
  actor: MessageActor,
) {
  const [attachment] = await sql<{ id: string; storage_path: string }>`
    select a.id, a.storage_path
    from portal_message_attachment a
    join portal_message m on m.id = a.message_id
    join portal_projects p on p.id = m.project_id
    where a.id = ${attachmentId} and a.message_id = ${messageId}
      and a.status = 'pending'
      and m.author_role = ${actor.role} and m.author_id = ${actor.userId}
      and (${actor.role === "studio"} = true or p.user_id = ${actor.userId})
  `;
  if (!attachment) return { ok: true as const };

  const removed = await storage.remove([attachment.storage_path]);
  if (removed.error) throw new Error(`Could not cancel file upload: ${removed.error.message}`);
  await sql`
    update portal_message_attachment set deleted_at = coalesce(deleted_at, now())
    where id = ${attachment.id}
  `;
  return { ok: true as const };
}

async function notifyForMessage(input: NotificationInput): Promise<boolean> {
  try {
    await notify(input);
    return false;
  } catch (error) {
    console.error("Message was saved, but its notification could not be queued.", {
      projectId: input.projectId,
      audience: input.audience ?? "client",
      error: error instanceof Error ? error.message : String(error),
    });
    return true;
  }
}

async function softDeleteOwnMessage(
  sql: Sql,
  messageId: string,
  actor: MessageActor,
): Promise<{ ok: true; cleanupPending: boolean }> {
  const message = await authorizeMessage(sql, messageId, actor, true);
  const attachments = await sql<{ storage_path: string }>`
    select storage_path from portal_message_attachment
    where message_id = ${message.id} and deleted_at is null
  `;
  await sql`
    update portal_message
    set deleted_at = now(), body = 'Message deleted'
    where id = ${message.id} and deleted_at is null
  `;
  await sql`
    update portal_message_attachment set deleted_at = now()
    where message_id = ${message.id} and deleted_at is null
  `;

  if (attachments.length === 0) return { ok: true, cleanupPending: false };
  try {
    const storage = await getMessageStorage();
    const result = await storage.remove(attachments.map((attachment) => attachment.storage_path));
    if (result.error) throw new Error(result.error.message);
    return { ok: true, cleanupPending: false };
  } catch (error) {
    console.error("Could not remove chat attachments after message deletion.", {
      messageId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: true, cleanupPending: true };
  }
}

/* ── client ── */

export const getMessageAttachmentAvailability = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(() => ({ enabled: serviceRoleConfigured }));

export const listMyMessages = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");
    return readThread(sql, data.projectId, { role: "client", userId: context.userId });
  });

export const postMyMessage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      body: z.string().max(MESSAGE_MAX),
      hasAttachments: z.boolean().optional().default(false),
      replyToMessageId: z.string().min(1).optional(),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string; reference: string }>`
      select id, reference from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");

    const body = data.body.trim() ? validateMessage(data.body) : null;
    if (body && !body.ok) throw new Error(body.reason);
    if (!body && !data.hasAttachments) throw new Error("Write a message or attach a file first.");
    await validateReplyTarget(sql, data.projectId, data.replyToMessageId);

    const label = await clientLabel(sql, data.projectId);
    const messageId = await insertMessage(sql, {
      projectId: data.projectId,
      authorRole: "client",
      authorId: context.userId,
      authorLabel: label,
      body: body?.ok ? body.body : "File attachment",
      replyToMessageId: data.replyToMessageId,
    });

    const notificationWarning = await notifyForMessage({
      projectId: data.projectId,
      kind: "message",
      title: `New message from ${label || "the client"}`,
      body: (body?.ok ? body.body : "Shared a file on the project.").slice(0, 200),
      audience: "studio",
    });

    return { ok: true as const, messageId, notificationWarning };
  });

export const toggleMyMessageReaction = createServerFn({ method: "POST" })
  .validator(
    z.object({
      messageId: z.string().min(1),
      emoji: z.enum(MESSAGE_REACTIONS),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) =>
    toggleReaction(
      await getSql(),
      data.messageId,
      { role: "client", userId: context.userId },
      data.emoji,
    ),
  );

export const prepareMyMessageAttachment = createServerFn({ method: "POST" })
  .validator(
    z.object({
      messageId: z.string().min(1),
      filename: z.string().min(1).max(256),
      mime: z.string().min(1).max(120),
      sizeBytes: z.number().int().positive().max(MAX_MESSAGE_ATTACHMENT_BYTES),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const message = await authorizeMessage(
      sql,
      data.messageId,
      { role: "client", userId: context.userId },
      true,
    );
    return prepareMessageAttachment(
      sql,
      await getMessageStorage(),
      message,
      data.filename,
      data.mime,
      data.sizeBytes,
    );
  });

export const finishMyMessageAttachment = createServerFn({ method: "POST" })
  .validator(z.object({ messageId: z.string().min(1), attachmentId: z.string().min(1) }))
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) =>
    finishMessageAttachment(
      await getSql(),
      await getMessageStorage(),
      data.attachmentId,
      data.messageId,
      { role: "client", userId: context.userId },
      true,
    ),
  );

export const cancelMyMessageAttachment = createServerFn({ method: "POST" })
  .validator(z.object({ messageId: z.string().min(1), attachmentId: z.string().min(1) }))
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) =>
    removePendingMessageAttachment(
      await getSql(),
      await getMessageStorage(),
      data.attachmentId,
      data.messageId,
      { role: "client", userId: context.userId },
    ),
  );

export const getMyMessageAttachmentUrl = createServerFn({ method: "GET" })
  .validator(z.object({ attachmentId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [attachment] = await sql<{
      id: string;
      filename: string;
      mime: string;
      storage_path: string;
    }>`
      select a.id, a.filename, a.mime, a.storage_path
      from portal_message_attachment a
      join portal_message m on m.id = a.message_id
      join portal_projects p on p.id = m.project_id
      where a.id = ${data.attachmentId} and a.status = 'ready'
        and a.deleted_at is null and m.deleted_at is null
        and p.user_id = ${context.userId}
    `;
    if (!attachment) throw new Error("File not found.");
    const storage = await getMessageStorage();
    const signed = await storage.createSignedUrl(
      attachment.storage_path,
      3600,
      attachment.mime.startsWith("image/") || attachment.mime.startsWith("video/")
        ? { download: false }
        : { download: attachment.filename },
    );
    if (signed.error) throw new Error(`Could not open file: ${signed.error.message}`);
    return { url: signed.data.signedUrl };
  });

/** Opening the thread marks the studio's replies as seen. */
export const markStudioMessagesRead = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");
    await sql`
      update portal_message
      set read_at = coalesce(read_at, now())
      where project_id = ${data.projectId} and author_role = 'studio' and read_at is null
    `;
    return { ok: true as const };
  });

export const deleteMyMessage = createServerFn({ method: "POST" })
  .validator(z.object({ messageId: z.string().min(1) }))
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) =>
    softDeleteOwnMessage(await getSql(), data.messageId, {
      role: "client",
      userId: context.userId,
    }),
  );

/* ── studio ── */

export const readMessagesForStaff = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    return readThread(await getSql(), data.projectId, { role: "studio", userId: staff.userId });
  });

export const postStaffMessage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      body: z.string().max(MESSAGE_MAX),
      hasAttachments: z.boolean().optional().default(false),
      replyToMessageId: z.string().min(1).optional(),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();

    const body = data.body.trim() ? validateMessage(data.body) : null;
    if (body && !body.ok) throw new Error(body.reason);
    if (!body && !data.hasAttachments) throw new Error("Write a message or attach a file first.");
    await validateReplyTarget(sql, data.projectId, data.replyToMessageId);

    // The project id came from the console, but it is still checked as an
    // existing row: a reply to a project that does not exist should not create
    // an orphaned thread.
    const [project] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId}
    `;
    if (!project) throw new Error("Project not found.");

    const label = await studioLabel(sql, staff);
    const messageId = await insertMessage(sql, {
      projectId: data.projectId,
      authorRole: "studio",
      authorId: staff.userId,
      authorLabel: label,
      body: body?.ok ? body.body : "File attachment",
      replyToMessageId: data.replyToMessageId,
    });

    const notificationWarning = await notifyForMessage({
      projectId: data.projectId,
      kind: "message",
      title: `ATRO replied: ${label}`,
      body: (body?.ok ? body.body : "Shared a file on the project.").slice(0, 200),
    });

    return { ok: true as const, messageId, notificationWarning };
  });

export const toggleStaffMessageReaction = createServerFn({ method: "POST" })
  .validator(
    z.object({
      messageId: z.string().min(1),
      emoji: z.enum(MESSAGE_REACTIONS),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    return toggleReaction(
      await getSql(),
      data.messageId,
      { role: "studio", userId: staff.userId },
      data.emoji,
    );
  });

export const prepareStaffMessageAttachment = createServerFn({ method: "POST" })
  .validator(
    z.object({
      messageId: z.string().min(1),
      filename: z.string().min(1).max(256),
      mime: z.string().min(1).max(120),
      sizeBytes: z.number().int().positive().max(MAX_MESSAGE_ATTACHMENT_BYTES),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();
    const message = await authorizeMessage(
      sql,
      data.messageId,
      { role: "studio", userId: staff.userId },
      true,
    );
    return prepareMessageAttachment(
      sql,
      await getMessageStorage(),
      message,
      data.filename,
      data.mime,
      data.sizeBytes,
    );
  });

export const finishStaffMessageAttachment = createServerFn({ method: "POST" })
  .validator(z.object({ messageId: z.string().min(1), attachmentId: z.string().min(1) }))
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    return finishMessageAttachment(
      await getSql(),
      await getMessageStorage(),
      data.attachmentId,
      data.messageId,
      { role: "studio", userId: staff.userId },
      true,
    );
  });

export const cancelStaffMessageAttachment = createServerFn({ method: "POST" })
  .validator(z.object({ messageId: z.string().min(1), attachmentId: z.string().min(1) }))
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();
    return removePendingMessageAttachment(
      sql,
      await getMessageStorage(),
      data.attachmentId,
      data.messageId,
      { role: "studio", userId: staff.userId },
    );
  });

export const getStaffMessageAttachmentUrl = createServerFn({ method: "GET" })
  .validator(z.object({ attachmentId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const [attachment] = await sql<{
      id: string;
      filename: string;
      mime: string;
      storage_path: string;
    }>`
      select a.id, a.filename, a.mime, a.storage_path
      from portal_message_attachment a
      join portal_message m on m.id = a.message_id
      where a.id = ${data.attachmentId} and a.status = 'ready'
        and a.deleted_at is null and m.deleted_at is null
    `;
    if (!attachment) throw new Error("File not found.");
    const storage = await getMessageStorage();
    const signed = await storage.createSignedUrl(
      attachment.storage_path,
      3600,
      attachment.mime.startsWith("image/") || attachment.mime.startsWith("video/")
        ? { download: false }
        : { download: attachment.filename },
    );
    if (signed.error) throw new Error(`Could not open file: ${signed.error.message}`);
    return { url: signed.data.signedUrl };
  });

/** Opening the thread marks the client's messages as seen. */
export const markClientMessagesRead = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    await sql`
      update portal_message
      set read_at = coalesce(read_at, now())
      where project_id = ${data.projectId} and author_role = 'client' and read_at is null
    `;
    return { ok: true as const };
  });

export const deleteStaffMessage = createServerFn({ method: "POST" })
  .validator(z.object({ messageId: z.string().min(1) }))
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    return softDeleteOwnMessage(await getSql(), data.messageId, {
      role: "studio",
      userId: staff.userId,
    });
  });

export type StaffMessageThreadSummary = {
  projectId: string;
  reference: string;
  title: string;
  clientLabel: string;
  latestMessage: string;
  latestAuthorRole: MessageRole | null;
  lastActivityAt: string | null;
  messageCount: number;
  unreadCount: number;
};

/**
 * One row per live project keeps the studio inbox usable as the portfolio
 * grows. Threads stay attached to jobs; projects without messages are included
 * so staff can start the conversation from the client's project record.
 */
export const listStaffMessageThreads = createServerFn({ method: "GET" }).handler(
  async (): Promise<StaffMessageThreadSummary[]> => {
    await requireStaff();
    const sql = await getSql();
    const rows = await sql<{
      project_id: string;
      reference: string;
      title: string;
      client_label: string;
      latest_message: string | null;
      latest_author_role: MessageRole | null;
      last_activity_at: unknown;
      message_count: number;
      unread_count: number;
    }>`
      select p.id as project_id, p.reference, p.title, p.client_label,
        latest.body as latest_message, latest.author_role as latest_author_role,
        latest.created_at as last_activity_at,
        count(m.id) filter (where m.deleted_at is null)::int as message_count,
        count(m.id) filter (
          where m.author_role = 'client' and m.read_at is null and m.deleted_at is null
        )::int as unread_count
      from portal_projects p
      left join portal_message m on m.project_id = p.id
      left join portal_message latest on latest.id = (
        select last_message.id from portal_message last_message
        where last_message.project_id = p.id and last_message.deleted_at is null
        order by last_message.ord desc limit 1
      )
      where p.source <> 'sample' and p.deleted_at is null
        and p.lifecycle_state not in ('closed', 'archived')
      group by p.id, latest.body, latest.author_role, latest.created_at
      order by latest.created_at desc nulls last, p.updated_at desc
    `;
    return rows.map((row) => ({
      projectId: row.project_id,
      reference: row.reference,
      title: row.title,
      clientLabel: row.client_label,
      latestMessage: row.latest_message ?? "",
      latestAuthorRole: row.latest_author_role,
      lastActivityAt: row.last_activity_at ? String(row.last_activity_at) : null,
      messageCount: Number(row.message_count),
      unreadCount: Number(row.unread_count),
    }));
  },
);

/**
 * Unread client messages, across every project, oldest first.
 *
 * This is the studio's badge: which projects have somebody waiting for an
 * answer, and for how long. It is deliberately not a list of every message —
 * the console's job is to say "three clients are waiting", not to become an
 * email client.
 */
export async function unreadClientMessages(
  sql: Sql,
): Promise<{ projectId: string; reference: string; title: string; body: string; age: number }[]> {
  const rows = await sql<Record<string, unknown>>`
    select m.project_id, p.reference, p.title, m.body,
      floor(extract(epoch from (now() - m.created_at)) / 86400) as age
    from portal_message m
    join portal_projects p on p.id = m.project_id
    where m.author_role = 'client' and m.read_at is null and m.deleted_at is null
    order by m.created_at asc
  `;
  return rows.map((r) => ({
    projectId: String(r.project_id),
    reference: String(r.reference ?? ""),
    title: String(r.title ?? ""),
    body: String(r.body ?? ""),
    age: Number(r.age ?? 0),
  }));
}
