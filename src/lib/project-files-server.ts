import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { accountMiddleware, authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { notify } from "@/lib/notify";
import { requireStaff } from "@/lib/staff-session.server";
import {
  MAX_PROJECT_FILE_BYTES,
  MAX_PROJECT_FILES,
  PROJECT_FILE_CATEGORIES,
  PROJECT_FILE_STATUS_LABEL,
  validateProjectFile,
  validateProjectFileMetadata,
  type ProjectFileCategory,
  type ProjectFileStatus,
} from "@/lib/project-files";
import { getProjectFileStorage } from "@/lib/project-file-storage.server";

export type ProjectFile = {
  id: string;
  projectId: string;
  title: string;
  category: ProjectFileCategory;
  filename: string;
  mime: string;
  sizeBytes: number;
  status: ProjectFileStatus;
  staffNote: string;
  createdAt: string;
  reviewedAt: string | null;
};

function toProjectFile(row: Record<string, unknown>): ProjectFile {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    title: String(row.title),
    category: String(row.category) as ProjectFileCategory,
    filename: String(row.filename),
    mime: String(row.mime),
    sizeBytes: Number(row.size_bytes),
    status: String(row.status) as ProjectFileStatus,
    staffNote: String(row.staff_note ?? ""),
    createdAt: String(row.created_at),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
  };
}

const FILE_COLUMNS = `id, project_id, title, category, filename, mime, size_bytes,
  status, staff_note, created_at, reviewed_at`;
const categorySchema = z.enum(PROJECT_FILE_CATEGORIES);

async function ownedProject(sql: Sql, projectId: string, userId: string): Promise<boolean> {
  const [project] = await sql<{ id: string }>`
    select id from portal_projects where id = ${projectId} and user_id = ${userId}
  `;
  return Boolean(project);
}

export const listMyProjectFiles = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await ownedProject(sql, data.projectId, context.userId))) {
      throw new Error("Project not found.");
    }
    const rows = await sql.query<Record<string, unknown>>(
      `select ${FILE_COLUMNS} from portal_client_document
       where project_id = $1 and deleted_at is null and status <> 'pending'
       order by created_at desc`,
      [data.projectId],
    );
    return rows.map(toProjectFile);
  });

export const prepareMyProjectFile = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().uuid(),
      title: z.string().trim().min(2).max(100),
      category: categorySchema,
      filename: z.string().min(1).max(256),
      mime: z.string().min(1).max(120),
      sizeBytes: z.number().int().positive().max(MAX_PROJECT_FILE_BYTES),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await ownedProject(sql, data.projectId, context.userId))) {
      throw new Error("Project not found.");
    }
    const metadata = validateProjectFileMetadata(data.filename, data.mime, data.sizeBytes);
    if (!metadata.ok) throw new Error(metadata.reason);

    const [reserved] = await sql<{ id: string }>`
      with upload_lock as materialized (
        select pg_advisory_xact_lock(hashtextextended(${data.projectId}, 0))
      ),
      active_count as (
        select count(*)::int as n
        from portal_client_document cross join upload_lock
        where project_id = ${data.projectId} and deleted_at is null
      )
      insert into portal_client_document (
        project_id, user_id, title, category, filename, mime, size_bytes, storage_path, status
      )
      select ${data.projectId}, ${context.userId}, ${data.title.trim()}, ${data.category},
        ${metadata.filename}, ${metadata.mime}, ${metadata.sizeBytes},
        ${data.projectId} || '/' || gen_random_uuid()::text || '/' || ${metadata.filename},
        'pending'
      from active_count where n < ${MAX_PROJECT_FILES}
      returning id, storage_path
    `;
    if (!reserved) {
      throw new Error(`A project can have up to ${MAX_PROJECT_FILES} active uploaded documents.`);
    }

    const [file] = await sql<{ id: string; storage_path: string }>`
      select id, storage_path from portal_client_document where id = ${reserved.id}
    `;
    const storage = await getProjectFileStorage();
    const signed = await storage.createSignedUploadUrl(file.storage_path, { upsert: false });
    if (signed.error) {
      await sql`update portal_client_document set deleted_at = now() where id = ${file.id}`;
      throw new Error(`Could not prepare document upload: ${signed.error.message}`);
    }
    return { documentId: file.id, path: file.storage_path, token: signed.data.token };
  });

export const finishMyProjectFile = createServerFn({ method: "POST" })
  .validator(z.object({ documentId: z.string().uuid() }))
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [file] = await sql<Record<string, unknown>>`
      select d.id, d.project_id, d.filename, d.mime, d.size_bytes, d.storage_path
      from portal_client_document d
      join portal_projects p on p.id = d.project_id
      where d.id = ${data.documentId} and d.user_id = ${context.userId}
        and p.user_id = ${context.userId} and d.status = 'pending' and d.deleted_at is null
    `;
    if (!file) throw new Error("This document upload is no longer available.");

    const storage = await getProjectFileStorage();
    const downloaded = await storage.download(String(file.storage_path));
    if (downloaded.error || !downloaded.data) {
      throw new Error(
        `Could not verify uploaded document: ${downloaded.error?.message ?? "file not found"}`,
      );
    }
    const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
    const validated = validateProjectFile({
      filename: String(file.filename),
      mime: String(file.mime),
      bytes,
    });
    if (!validated.ok || validated.file.sizeBytes !== Number(file.size_bytes)) {
      const removed = await storage.remove([String(file.storage_path)]);
      if (removed.error) {
        throw new Error(
          `${validated.ok ? "The uploaded file size did not match." : validated.reason} Could not remove the rejected file: ${removed.error.message}`,
        );
      }
      await sql`update portal_client_document set deleted_at = now() where id = ${file.id}`;
      throw new Error(
        validated.ok
          ? "The uploaded file size did not match. Choose it again and retry."
          : validated.reason,
      );
    }

    await sql`
      update portal_client_document set status = 'submitted'
      where id = ${file.id} and status = 'pending' and deleted_at is null
    `;
    await notify({
      projectId: String(file.project_id),
      kind: "document",
      title: "Client document submitted",
      body: String(file.filename),
      audience: "studio",
    });
    return { ok: true as const };
  });

export const cancelMyProjectFile = createServerFn({ method: "POST" })
  .validator(z.object({ documentId: z.string().uuid() }))
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [file] = await sql<{ id: string; storage_path: string }>`
      select id, storage_path from portal_client_document
      where id = ${data.documentId} and user_id = ${context.userId}
        and status = 'pending' and deleted_at is null
        and project_id in (
          select id from portal_projects where user_id = ${context.userId}
        )
    `;
    if (!file) return { ok: true as const };
    const removed = await (await getProjectFileStorage()).remove([file.storage_path]);
    if (removed.error)
      throw new Error(`Could not cancel document upload: ${removed.error.message}`);
    await sql`update portal_client_document set deleted_at = now() where id = ${file.id}`;
    return { ok: true as const };
  });

export const getMyProjectFileUrl = createServerFn({ method: "GET" })
  .validator(z.object({ documentId: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [file] = await sql<{ storage_path: string; mime: string }>`
      select d.storage_path, d.mime
      from portal_client_document d
      join portal_projects p on p.id = d.project_id
      where d.id = ${data.documentId} and d.user_id = ${context.userId}
        and p.user_id = ${context.userId} and d.deleted_at is null and d.status <> 'pending'
    `;
    if (!file) throw new Error("Document not found.");
    const signed = await (
      await getProjectFileStorage()
    ).createSignedUrl(file.storage_path, 300, {
      download: false,
    });
    if (signed.error) throw new Error(`Could not open document: ${signed.error.message}`);
    return { url: signed.data.signedUrl };
  });

export const deleteMyProjectFile = createServerFn({ method: "POST" })
  .validator(z.object({ documentId: z.string().uuid() }))
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [file] = await sql<{ id: string; storage_path: string }>`
      update portal_client_document d set deleted_at = now()
      from portal_projects p
      where d.id = ${data.documentId} and d.project_id = p.id
        and p.user_id = ${context.userId} and d.user_id = ${context.userId}
        and d.status in ('submitted', 'needs_changes') and d.deleted_at is null
      returning d.id, d.storage_path
    `;
    if (!file) {
      throw new Error("Only documents awaiting review or changes can be removed.");
    }
    const removed = await (await getProjectFileStorage()).remove([file.storage_path]);
    if (removed.error) {
      const [restored] = await sql<{ id: string }>`
        update portal_client_document set deleted_at = null
        where id = ${file.id} and deleted_at is not null
        returning id
      `;
      throw new Error(
        restored
          ? `Could not remove the stored file, so the document remains available: ${removed.error.message}`
          : `Could not remove the stored file or restore the document record: ${removed.error.message}`,
      );
    }
    return { ok: true as const };
  });

export const listProjectFilesForStaff = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const rows = await (
      await getSql()
    ).query<Record<string, unknown>>(
      `select ${FILE_COLUMNS} from portal_client_document
       where project_id = $1 and deleted_at is null and status <> 'pending'
       order by created_at desc`,
      [data.projectId],
    );
    return rows.map(toProjectFile);
  });

export const getStaffProjectFileUrl = createServerFn({ method: "GET" })
  .validator(z.object({ documentId: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const [file] = await (await getSql())<{ storage_path: string }>`
      select storage_path from portal_client_document
      where id = ${data.documentId} and deleted_at is null and status <> 'pending'
    `;
    if (!file) throw new Error("Document not found.");
    const signed = await (
      await getProjectFileStorage()
    ).createSignedUrl(file.storage_path, 300, {
      download: false,
    });
    if (signed.error) throw new Error(`Could not open document: ${signed.error.message}`);
    return { url: signed.data.signedUrl };
  });

export const reviewProjectFile = createServerFn({ method: "POST" })
  .validator(
    z.object({
      documentId: z.string().uuid(),
      status: z.enum(["reviewing", "accepted", "needs_changes"]),
      note: z.string().trim().max(600).optional(),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const note = data.note?.trim() ?? "";
    if (data.status === "needs_changes" && !note) {
      throw new Error("Explain what the client should change or provide.");
    }
    const sql = await getSql();
    const [file] = await sql<{ id: string; project_id: string; title: string }>`
      update portal_client_document set
        status = ${data.status}, staff_note = ${note}, reviewed_by = ${staff.email},
        reviewed_at = now(), updated_at = now()
      where id = ${data.documentId} and deleted_at is null and status <> 'pending'
      returning id, project_id, title
    `;
    if (!file) throw new Error("Document not found.");
    await notify({
      projectId: file.project_id,
      kind: "document",
      title: PROJECT_FILE_STATUS_LABEL[data.status],
      body: note || file.title,
      audience: "client",
    });
    return { ok: true as const };
  });
