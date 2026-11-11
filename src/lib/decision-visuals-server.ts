import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { accountMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  DECISION_IMAGE_MIME_TYPES,
  MAX_DECISION_IMAGE_BYTES,
  validateDecisionImage,
  validateDecisionImageMetadata,
} from "@/lib/decision-visuals";
import { getProjectFileStorage } from "@/lib/project-file-storage.server";
import { requireStaff } from "@/lib/staff-session.server";

const draftSchema = z.object({
  projectId: z.string().uuid(),
  draftKey: z.string().uuid(),
});

async function assertActiveProject(projectId: string) {
  const [project] = await (await getSql())<{ id: string }>`
    select id from portal_projects
    where id = ${projectId} and deleted_at is null and source <> 'sample'
      and lifecycle_state not in ('closed', 'archived')
  `;
  if (!project) throw new Error("Decision visuals can only be added to an active project.");
}

export const prepareDecisionVisual = createServerFn({ method: "POST" })
  .validator(
    draftSchema.extend({
      optionIndex: z.number().int().min(0).max(5),
      caption: z.string().trim().max(200).default(""),
      filename: z.string().min(1).max(256),
      mime: z.enum(DECISION_IMAGE_MIME_TYPES),
      sizeBytes: z.number().int().positive().max(MAX_DECISION_IMAGE_BYTES),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    await assertActiveProject(data.projectId);
    const metadata = validateDecisionImageMetadata(data);
    if (!metadata.ok) throw new Error(metadata.reason);

    const sql = await getSql();
    const [reserved] = await sql<{ id: string; storage_path: string }>`
      with draft_lock as materialized (
        select pg_advisory_xact_lock(hashtextextended(${data.projectId} || ${data.draftKey}, 0))
      ),
      active_count as (
        select count(*)::int as n
        from portal_decision_visual cross join draft_lock
        where project_id = ${data.projectId} and draft_key = ${data.draftKey}
          and decision_id is null
      )
      insert into portal_decision_visual (
        project_id, draft_key, option_index, caption, filename, mime, size_bytes,
        storage_path, created_by
      )
      select ${data.projectId}, ${data.draftKey}, ${data.optionIndex}, ${data.caption},
        ${metadata.filename}, ${metadata.mime}, ${metadata.sizeBytes},
        ${data.projectId} || '/' || ${data.draftKey} || '/' || gen_random_uuid()::text,
        ${staff.email}
      from active_count where n < 6
      returning id, storage_path
    `;
    if (!reserved) {
      throw new Error("A decision can have at most one image for each of its six options.");
    }

    try {
      const storage = await getProjectFileStorage();
      const signed = await storage.createSignedUploadUrl(reserved.storage_path, { upsert: false });
      if (signed.error)
        throw new Error(`Could not prepare decision image upload: ${signed.error.message}`);
      return { visualId: reserved.id, path: reserved.storage_path, token: signed.data.token };
    } catch (error) {
      await sql`delete from portal_decision_visual where id = ${reserved.id}`;
      throw error;
    }
  });

export const finishDecisionVisual = createServerFn({ method: "POST" })
  .validator(z.object({ visualId: z.string().uuid() }))
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();
    const [visual] = await sql<Record<string, unknown>>`
      select v.id, v.project_id, v.filename, v.mime, v.size_bytes, v.storage_path
      from portal_decision_visual v
      join portal_projects p on p.id = v.project_id
      where v.id = ${data.visualId} and v.created_by = ${staff.email}
        and v.status = 'pending' and v.decision_id is null
        and p.deleted_at is null and p.source <> 'sample'
        and p.lifecycle_state not in ('closed', 'archived')
    `;
    if (!visual) throw new Error("This decision image upload is no longer available.");

    const storage = await getProjectFileStorage();
    const downloaded = await storage.download(String(visual.storage_path));
    if (downloaded.error || !downloaded.data) {
      throw new Error(
        `Could not verify decision image: ${downloaded.error?.message ?? "file not found"}`,
      );
    }
    const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
    const validated = validateDecisionImage({
      filename: String(visual.filename),
      mime: String(visual.mime),
      bytes,
    });
    if (!validated.ok || validated.file.sizeBytes !== Number(visual.size_bytes)) {
      const removed = await storage.remove([String(visual.storage_path)]);
      if (removed.error) {
        throw new Error(
          `${validated.ok ? "The uploaded image size did not match." : validated.reason} Could not remove the rejected image: ${removed.error.message}`,
        );
      }
      await sql`delete from portal_decision_visual where id = ${visual.id} and decision_id is null`;
      throw new Error(
        validated.ok
          ? "The uploaded image size did not match. Choose it again and retry."
          : validated.reason,
      );
    }

    const [ready] = await sql<{ id: string }>`
      update portal_decision_visual set status = 'ready'
      where id = ${visual.id} and status = 'pending' and decision_id is null
      returning id
    `;
    if (!ready) throw new Error("This decision image upload is no longer available.");
    return { ok: true as const };
  });

export const cancelDecisionVisuals = createServerFn({ method: "POST" })
  .validator(draftSchema)
  .middleware([accountMiddleware])
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();
    const visuals = await sql<{ id: string; storage_path: string }>`
      update portal_decision_visual set status = 'deleting'
      where project_id = ${data.projectId} and draft_key = ${data.draftKey}
        and created_by = ${staff.email} and decision_id is null
        and status in ('pending', 'ready', 'deleting')
      returning id, storage_path
    `;
    if (!visuals.length) return { ok: true as const };
    let removeError: string | null = null;
    try {
      const removed = await (
        await getProjectFileStorage()
      ).remove(visuals.map((visual) => visual.storage_path));
      removeError = removed.error?.message ?? null;
    } catch (error) {
      removeError = error instanceof Error ? error.message : String(error);
    }
    if (removeError) {
      for (const visual of visuals) {
        await sql`
          update portal_decision_visual set status = 'pending'
          where id = ${visual.id} and status = 'deleting' and decision_id is null
        `;
      }
      throw new Error(`Could not cancel decision image uploads: ${removeError}`);
    }
    for (const visual of visuals) {
      await sql`
        delete from portal_decision_visual
        where id = ${visual.id} and status = 'deleting' and decision_id is null
      `;
    }
    return { ok: true as const };
  });

export const getMyDecisionVisualUrl = createServerFn({ method: "GET" })
  .validator(
    z.object({
      projectId: z.string().uuid(),
      decisionId: z.string().uuid(),
      optionIndex: z.number().int().min(0).max(5),
    }),
  )
  .middleware([accountMiddleware])
  .handler(async ({ context, data }) => {
    const [visual] = await (await getSql())<{ storage_path: string }>`
      select v.storage_path
      from portal_decision_visual v
      join portal_projects p on p.id = v.project_id
      where v.project_id = ${data.projectId} and v.decision_id = ${data.decisionId}
        and v.option_index = ${data.optionIndex} and v.status = 'ready'
        and p.user_id = ${context.userId} and p.deleted_at is null
    `;
    if (!visual) throw new Error("Decision image not found.");
    const signed = await (
      await getProjectFileStorage()
    ).createSignedUrl(visual.storage_path, 300, {
      download: false,
    });
    if (signed.error) throw new Error(`Could not open decision image: ${signed.error.message}`);
    return { url: signed.data.signedUrl };
  });
