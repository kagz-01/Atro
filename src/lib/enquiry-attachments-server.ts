import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import {
  MAX_ENQUIRY_ATTACHMENT_BYTES,
  MAX_ENQUIRY_ATTACHMENTS,
  validateMessageAttachment,
  validateMessageAttachmentMetadata,
} from "@/lib/enquiry-attachments";
import { getEnquiryStorage } from "@/lib/enquiry-storage.server";
import { requireStaff } from "@/lib/staff-session.server";
import { hashEnquiryUploadToken } from "@/lib/enquiry-upload-token.server";

const UploadGrant = z.object({
  enquiryId: z.string().uuid(),
  token: z.string().min(40).max(100),
});

async function authorizeUpload(
  sql: Sql,
  enquiryId: string,
  token: string,
): Promise<void> {
  const [session] = await sql<{ enquiry_id: string }>`
    select enquiry_id from enquiry_upload_session
    where enquiry_id = ${enquiryId}
      and token_hash = ${hashEnquiryUploadToken(token)}
      and expires_at > now()
  `;
  if (!session) throw new Error("This enquiry's file-upload link has expired. Contact ATRO for help.");
}

export const prepareEnquiryAttachment = createServerFn({ method: "POST" })
  .validator(
    UploadGrant.extend({
      filename: z.string().min(1).max(256),
      mime: z.string().min(1).max(120),
      sizeBytes: z.number().int().positive().max(MAX_ENQUIRY_ATTACHMENT_BYTES),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await authorizeUpload(sql, data.enquiryId, data.token);
    const metadata = validateMessageAttachmentMetadata(
      data.filename,
      data.mime,
      data.sizeBytes,
    );
    if (!metadata.ok) throw new Error(metadata.reason);

    const storage = await getEnquiryStorage();
    const expired = await sql<{ id: string; storage_path: string }>`
      select id, storage_path from enquiry_attachment
      where enquiry_id = ${data.enquiryId} and status = 'pending'
        and deleted_at is null and created_at < now() - interval '1 hour'
    `;
    if (expired.length) {
      const removed = await storage.remove(expired.map((attachment) => attachment.storage_path));
      if (removed.error) {
        throw new Error(`Could not clear an expired file upload: ${removed.error.message}`);
      }
      await sql`
        update enquiry_attachment set deleted_at = now()
        where id = any(${expired.map((attachment) => attachment.id)}::uuid[])
      `;
    }

    const attachmentId = crypto.randomUUID();
    const storagePath = `${data.enquiryId}/${attachmentId}/${metadata.filename}`;
    const [reserved] = await sql<{ id: string }>`
      with upload_lock as materialized (
        select pg_advisory_xact_lock(hashtextextended(${data.enquiryId}, 0))
      ),
      active_count as (
        select count(*)::int as n
        from enquiry_attachment cross join upload_lock
        where enquiry_id = ${data.enquiryId} and deleted_at is null
      ),
      valid_session as materialized (
        select enquiry_id from enquiry_upload_session
        where enquiry_id = ${data.enquiryId}
          and token_hash = ${hashEnquiryUploadToken(data.token)}
          and expires_at > now()
      )
      insert into enquiry_attachment (
        id, enquiry_id, filename, mime, size_bytes, storage_path, status
      )
      select ${attachmentId}, ${data.enquiryId}, ${metadata.filename}, ${metadata.mime},
        ${metadata.sizeBytes}, ${storagePath}, 'pending'
      from active_count, valid_session
      where active_count.n < ${MAX_ENQUIRY_ATTACHMENTS}
      returning id
    `;
    if (!reserved) {
      throw new Error(`An enquiry can have up to ${MAX_ENQUIRY_ATTACHMENTS} files.`);
    }

    const signed = await storage.createSignedUploadUrl(storagePath, { upsert: false });
    if (signed.error) {
      await sql`
        update enquiry_attachment set deleted_at = now()
        where id = ${attachmentId}
      `;
      throw new Error(`Could not prepare file upload: ${signed.error.message}`);
    }
    return { attachmentId, path: storagePath, token: signed.data.token };
  });

export const finishEnquiryAttachment = createServerFn({ method: "POST" })
  .validator(UploadGrant.extend({ attachmentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await authorizeUpload(sql, data.enquiryId, data.token);
    const [attachment] = await sql<{
      id: string;
      filename: string;
      mime: string;
      size_bytes: number;
      storage_path: string;
    }>`
      select id, filename, mime, size_bytes, storage_path
      from enquiry_attachment
      where id = ${data.attachmentId} and enquiry_id = ${data.enquiryId}
        and status = 'pending' and deleted_at is null
    `;
    if (!attachment) throw new Error("This file upload is no longer available.");

    const storage = await getEnquiryStorage();
    const downloaded = await storage.download(attachment.storage_path);
    if (downloaded.error || !downloaded.data) {
      throw new Error(`Could not verify uploaded file: ${downloaded.error?.message ?? "file not found"}`);
    }
    const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
    const validated = validateMessageAttachment({
      filename: attachment.filename,
      mime: attachment.mime,
      bytes,
    });
    if (!validated.ok || validated.attachment.sizeBytes !== attachment.size_bytes) {
      const removed = await storage.remove([attachment.storage_path]);
      if (removed.error) {
        throw new Error(
          `${validated.ok ? "The uploaded file size did not match." : validated.reason} Could not remove the rejected file: ${removed.error.message}`,
        );
      }
      await sql`
        update enquiry_attachment set deleted_at = now()
        where id = ${attachment.id}
      `;
      throw new Error(
        validated.ok ? "The uploaded file size did not match the selected file." : validated.reason,
      );
    }

    await sql`
      update enquiry_attachment set status = 'ready'
      where id = ${attachment.id} and status = 'pending' and deleted_at is null
    `;
    return { ok: true as const };
  });

export const cancelEnquiryAttachment = createServerFn({ method: "POST" })
  .validator(UploadGrant.extend({ attachmentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await authorizeUpload(sql, data.enquiryId, data.token);
    const [attachment] = await sql<{ id: string; storage_path: string }>`
      select id, storage_path from enquiry_attachment
      where id = ${data.attachmentId} and enquiry_id = ${data.enquiryId}
        and status = 'pending' and deleted_at is null
    `;
    if (!attachment) return { ok: true as const };
    const storage = await getEnquiryStorage();
    const removed = await storage.remove([attachment.storage_path]);
    if (removed.error) throw new Error(`Could not remove incomplete upload: ${removed.error.message}`);
    await sql`
      update enquiry_attachment set deleted_at = now()
      where id = ${attachment.id} and status = 'pending'
    `;
    return { ok: true as const };
  });

export const getEnquiryAttachmentUrl = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(z.object({ attachmentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const [attachment] = await sql<{
      filename: string;
      mime: string;
      storage_path: string;
    }>`
      select filename, mime, storage_path from enquiry_attachment
      where id = ${data.attachmentId} and status = 'ready' and deleted_at is null
    `;
    if (!attachment) throw new Error("File not found.");
    const storage = await getEnquiryStorage();
    const signed = await storage.createSignedUrl(
      attachment.storage_path,
      3600,
      attachment.mime.startsWith("image/")
        ? { download: false }
        : { download: attachment.filename },
    );
    if (signed.error) throw new Error(`Could not open file: ${signed.error.message}`);
    return { url: signed.data.signedUrl };
  });
