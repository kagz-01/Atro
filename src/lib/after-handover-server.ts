import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { accountMiddleware, authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  HANDOVER_DOCUMENT_CATEGORIES,
  type HandoverDocumentCategory,
} from "@/lib/defects";
import { getProjectFileStorage } from "@/lib/project-file-storage.server";
import {
  MAX_PROJECT_FILE_BYTES,
  validateProjectFile,
  validateProjectFileMetadata,
} from "@/lib/project-files";
import { currentStaff, requireStaff } from "@/lib/staff-session.server";
import { notify } from "@/lib/notify";

const categorySchema = z.enum(
  HANDOVER_DOCUMENT_CATEGORIES.map((item) => item.value) as [
    HandoverDocumentCategory,
    ...HandoverDocumentCategory[],
  ],
);

const fileInput = {
  filename: z.string().min(1).max(256),
  mime: z.string().min(1).max(120),
  sizeBytes: z.number().int().positive().max(MAX_PROJECT_FILE_BYTES),
};

async function prepareStorageUpload(path: string) {
  const signed = await (await getProjectFileStorage()).createSignedUploadUrl(path, {
    upsert: false,
  });
  if (signed.error) throw new Error(`Could not prepare secure upload: ${signed.error.message}`);
  return { path, token: signed.data.token };
}

async function verifyStoredFile(
  path: string,
  filename: string,
  mime: string,
  sizeBytes: number,
): Promise<void> {
  const storage = await getProjectFileStorage();
  const downloaded = await storage.download(path);
  if (downloaded.error || !downloaded.data) {
    throw new Error(`Could not verify uploaded file: ${downloaded.error?.message ?? "file not found"}`);
  }
  const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
  const validated = validateProjectFile({ filename, mime, bytes });
  if (validated.ok && validated.file.sizeBytes === sizeBytes) return;

  const removed = await storage.remove([path]);
  if (removed.error) {
    throw new Error(
      `${validated.ok ? "The uploaded file size did not match." : validated.reason} Could not remove the rejected file: ${removed.error.message}`,
    );
  }
  throw new Error(
    validated.ok
      ? "The uploaded file size did not match. Choose it again and retry."
      : validated.reason,
  );
}

export const prepareHandoverDocumentUpload = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().uuid(),
      title: z.string().trim().min(2).max(120),
      category: categorySchema,
      ...fileInput,
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const metadata = validateProjectFileMetadata(data.filename, data.mime, data.sizeBytes);
    if (!metadata.ok) throw new Error(metadata.reason);
    const sql = await getSql();
    const [project] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId}
    `;
    if (!project) throw new Error("Project not found.");
    const path = `handover/${data.projectId}/${crypto.randomUUID()}/${metadata.filename}`;
    const [document] = await sql<{ id: string }>`
      insert into portal_handover_document (
        project_id, title, category, filename, mime, size_bytes, storage_path, uploaded_by
      ) values (
        ${data.projectId}, ${data.title}, ${data.category}, ${metadata.filename},
        ${metadata.mime}, ${metadata.sizeBytes}, ${path}, ${staff.email}
      ) returning id
    `;
    try {
      return { documentId: document.id, ...(await prepareStorageUpload(path)) };
    } catch (error) {
      await sql`delete from portal_handover_document where id = ${document.id} and status = 'pending'`;
      throw error;
    }
  });

export const finishHandoverDocumentUpload = createServerFn({ method: "POST" })
  .validator(z.object({ documentId: z.string().uuid() }))
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    const [document] = await sql<{
      id: string;
      project_id: string;
      title: string;
      filename: string;
      mime: string;
      size_bytes: number;
      storage_path: string;
      uploaded_by: string;
    }>`
      select id, project_id, title, filename, mime, size_bytes, storage_path, uploaded_by
      from portal_handover_document where id = ${data.documentId} and status = 'pending'
    `;
    if (!document) throw new Error("This handover upload is no longer available.");
    const staff = await requireStaff();
    if (document.uploaded_by !== staff.email) {
      throw new Error("Only the staff member who started this upload can finalize it.");
    }
    await verifyStoredFile(
      document.storage_path,
      document.filename,
      document.mime,
      Number(document.size_bytes),
    );
    const [ready] = await sql<{ id: string }>`
      update portal_handover_document set status = 'ready'
      where id = ${document.id} and status = 'pending' returning id
    `;
    if (!ready) throw new Error("The document could not be finalized; please upload it again.");
    await notify({
      projectId: document.project_id,
      kind: "handover",
      title: "A handover document is available",
      body: document.title,
      audience: "client",
    });
    return { ok: true as const };
  });

export const cancelHandoverDocumentUpload = createServerFn({ method: "POST" })
  .validator(z.object({ documentId: z.string().uuid() }))
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();
    const [file] = await sql<{ id: string; storage_path: string; uploaded_by: string }>`
      select id, storage_path, uploaded_by from portal_handover_document
      where id = ${data.documentId} and status = 'pending'
    `;
    if (!file) return { ok: true as const };
    if (file.uploaded_by !== staff.email) {
      throw new Error("Only the staff member who started this upload can cancel it.");
    }
    const removed = await (await getProjectFileStorage()).remove([file.storage_path]);
    if (removed.error) throw new Error(`Could not clean up upload: ${removed.error.message}`);
    await sql`delete from portal_handover_document where id = ${file.id} and status = 'pending'`;
    return { ok: true as const };
  });

export const acknowledgeHandoverDocument = createServerFn({ method: "POST" })
  .validator(z.object({ documentId: z.string().uuid() }))
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [document] = await sql<{ id: string; project_id: string; received_at: string | null }>`
      select d.id, d.project_id, d.received_at
      from portal_handover_document d
      join portal_projects p on p.id = d.project_id
      where d.id = ${data.documentId} and d.status = 'ready' and p.user_id = ${context.userId}
    `;
    if (!document) throw new Error("That handover document is not on your project.");
    if (document.received_at) return { ok: true as const };
    await sql`
      update portal_handover_document set received_at = now(), received_by = ${context.userId}
      where id = ${document.id} and received_at is null
    `;
    await notify({
      projectId: document.project_id,
      kind: "handover",
      title: "Client confirmed document receipt",
      body: "Receipt only; this is not a signature or acceptance of terms.",
      audience: "studio",
    });
    return { ok: true as const };
  });

export const getHandoverDocumentUrl = createServerFn({ method: "GET" })
  .validator(z.object({ documentId: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [document] = await sql<{ storage_path: string; project_id: string }>`
      select d.storage_path, d.project_id from portal_handover_document d
      where d.id = ${data.documentId} and d.status = 'ready'
    `;
    if (!document) throw new Error("Handover document not found.");
    const [project] = await sql<{ id: string }>`
      select id from portal_projects where id = ${document.project_id} and user_id = ${context.userId}
    `;
    if (!project) await requireStaff();
    const signed = await (
      await getProjectFileStorage()
    ).createSignedUrl(document.storage_path, 300, { download: false });
    if (signed.error) throw new Error(`Could not open handover document: ${signed.error.message}`);
    return { url: signed.data.signedUrl };
  });

export const prepareDefectEvidenceUpload = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().uuid(),
      defectId: z.string().uuid(),
      ...fileInput,
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const staff = await currentStaff();
    const [owned] = staff
      ? await sql<{ id: string }>`select id from portal_projects where id = ${data.projectId}`
      : await sql<{ id: string }>`
          select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
        `;
    if (!owned) throw new Error("Project not found.");
    const [defect] = await sql<{ id: string }>`
      select id from portal_defect where id = ${data.defectId} and project_id = ${data.projectId}
    `;
    if (!defect) throw new Error("That report is not on this project.");
    const metadata = validateProjectFileMetadata(data.filename, data.mime, data.sizeBytes);
    if (!metadata.ok) throw new Error(metadata.reason);
    const uploadedBy = staff?.email ?? context.userId;
    const role = staff ? "staff" : "client";
    const path = `defects/${data.projectId}/${data.defectId}/${crypto.randomUUID()}/${metadata.filename}`;
    const [evidence] = await sql<{ id: string }>`
      insert into portal_defect_evidence (
        project_id, defect_id, filename, mime, size_bytes, storage_path, uploaded_by, uploaded_by_role
      ) values (
        ${data.projectId}, ${data.defectId}, ${metadata.filename}, ${metadata.mime},
        ${metadata.sizeBytes}, ${path}, ${uploadedBy}, ${role}
      ) returning id
    `;
    try {
      return { evidenceId: evidence.id, ...(await prepareStorageUpload(path)) };
    } catch (error) {
      await sql`delete from portal_defect_evidence where id = ${evidence.id} and status = 'pending'`;
      throw error;
    }
  });

export const finishDefectEvidenceUpload = createServerFn({ method: "POST" })
  .validator(z.object({ evidenceId: z.string().uuid() }))
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [file] = await sql<{
      id: string;
      project_id: string;
      defect_id: string;
      filename: string;
      mime: string;
      size_bytes: number;
      storage_path: string;
      uploaded_by: string;
      uploaded_by_role: string;
    }>`
      select id, project_id, defect_id, filename, mime, size_bytes, storage_path,
        uploaded_by, uploaded_by_role
      from portal_defect_evidence where id = ${data.evidenceId} and status = 'pending'
    `;
    if (!file) throw new Error("This evidence upload is no longer available.");
    if (file.uploaded_by_role === "client" && file.uploaded_by !== context.userId) {
      throw new Error("That upload does not belong to your account.");
    }
    if (file.uploaded_by_role === "staff") {
      const staff = await requireStaff();
      if (file.uploaded_by !== staff.email) {
        throw new Error("Only the staff member who started this upload can finalize it.");
      }
    }
    else {
      const [owned] = await sql<{ id: string }>`
        select id from portal_projects where id = ${file.project_id} and user_id = ${context.userId}
      `;
      if (!owned) throw new Error("Project not found.");
    }
    await verifyStoredFile(file.storage_path, file.filename, file.mime, Number(file.size_bytes));
    const [ready] = await sql<{ id: string }>`
      update portal_defect_evidence set status = 'ready'
      where id = ${file.id} and status = 'pending' returning id
    `;
    if (!ready) throw new Error("Evidence could not be finalized; please upload it again.");
    const [defect] = await sql<{ title: string }>`
      select title from portal_defect where id = ${file.defect_id}
    `;
    await notify({
      projectId: file.project_id,
      kind: "defect",
      title: "Evidence added to a defect report",
      body: defect?.title ?? file.filename,
      audience: file.uploaded_by_role === "client" ? "studio" : "client",
    });
    return { ok: true as const };
  });

export const cancelDefectEvidenceUpload = createServerFn({ method: "POST" })
  .validator(z.object({ evidenceId: z.string().uuid() }))
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [file] = await sql<{ id: string; storage_path: string; uploaded_by: string; uploaded_by_role: string }>`
      select id, storage_path, uploaded_by, uploaded_by_role
      from portal_defect_evidence where id = ${data.evidenceId} and status = 'pending'
    `;
    if (!file) return { ok: true as const };
    if (file.uploaded_by_role === "client" && file.uploaded_by !== context.userId) {
      throw new Error("That upload does not belong to your account.");
    }
    if (file.uploaded_by_role === "staff") {
      const staff = await requireStaff();
      if (file.uploaded_by !== staff.email) {
        throw new Error("Only the staff member who started this upload can cancel it.");
      }
    }
    const removed = await (await getProjectFileStorage()).remove([file.storage_path]);
    if (removed.error) throw new Error(`Could not clean up evidence upload: ${removed.error.message}`);
    await sql`delete from portal_defect_evidence where id = ${file.id} and status = 'pending'`;
    return { ok: true as const };
  });

export const getDefectEvidenceUrl = createServerFn({ method: "GET" })
  .validator(z.object({ evidenceId: z.string().uuid() }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [file] = await sql<{ storage_path: string; project_id: string }>`
      select storage_path, project_id from portal_defect_evidence
      where id = ${data.evidenceId} and status = 'ready'
    `;
    if (!file) throw new Error("Evidence not found.");
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects where id = ${file.project_id} and user_id = ${context.userId}
    `;
    if (!owned) await requireStaff();
    const signed = await (
      await getProjectFileStorage()
    ).createSignedUrl(file.storage_path, 300, { download: false });
    if (signed.error) throw new Error(`Could not open evidence: ${signed.error.message}`);
    return { url: signed.data.signedUrl };
  });
