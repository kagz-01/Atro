// Evidence photographs, on both sides of the portal.
//
// The studio uploads against a milestone; the client looks at the picture. Every
// write is staff-gated, because a photograph posted by the person paying for the
// work proves nothing — the whole argument of this product is independent
// verification, and that argument is made by who is allowed to post.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireStaff } from "@/lib/staff-session.server";
import { getSql, type Sql } from "@/lib/db";
import {
  DETAIL_MAX,
  checkPhotoCount,
  groupByMilestone,
  validateCaption,
  type EvidencePhoto,
  type MilestoneGroup,
} from "@/lib/evidence";
import { IMAGE_MIME, checkImageSize, MAX_BYTES } from "@/lib/image";

const toPhoto = (r: Record<string, unknown>): EvidencePhoto => ({
  id: String(r.id),
  projectId: String(r.project_id),
  milestoneId: String(r.milestone_id),
  ord: Number(r.ord ?? 0),
  caption: String(r.caption ?? ""),
  detail: String(r.detail ?? ""),
  takenOn: String(r.taken_on ?? ""),
  mime: String(r.mime ?? "image/jpeg"),
  hasImage: Boolean(r.has_image),
  uploadedBy: String(r.uploaded_by ?? ""),
  uploadedAt: r.uploaded_at ? String(r.uploaded_at) : "",
});

/** Every photograph on a project, ordered for reading. */
export async function readPhotos(sql: Sql, projectId: string): Promise<EvidencePhoto[]> {
  const rows = await sql<Record<string, unknown>>`
    select id, project_id, milestone_id, ord, caption, detail, taken_on, mime,
      bytes is not null as has_image, uploaded_by, uploaded_at
    from portal_evidence_photo
    where project_id = ${projectId}
    order by milestone_id, ord
  `;
  return rows.map(toPhoto);
}

/* ── client ── */

export type MilestoneEvidence = {
  milestoneId: string;
  name: string;
  stage: string;
  status: string;
  photos: EvidencePhoto[];
};

export type EvidenceResult = {
  /**
   * Every milestone on the project, including the ones with no photographs yet.
   *
   * Only stages with a photograph are listed below, so the coverage line needs
   * the full count from here — otherwise "1 of 1" would read as complete when
   * seven stages are still unphotographed.
   */
  total: number;
  stages: MilestoneEvidence[];
};

/**
 * The client's own project: each stage that has photographs, with the picture
 * itself.
 *
 * Only stages that actually have a photograph appear, so nine empty headings
 * are not shown waiting for pictures that have not been taken.
 */
export const listMyEvidence = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<EvidenceResult> => {
    const sql = await getSql();
    const [owned] = await sql<{ id: string }>`
      select id from portal_projects where id = ${data.projectId} and user_id = ${context.userId}
    `;
    if (!owned) throw new Error("Project not found.");

    const milestones = await sql<Record<string, unknown>>`
      select id, name, stage, status
      from portal_milestones
      where project_id = ${data.projectId}
      order by ord
    `;
    const total = milestones.length;

    const photos = await readPhotos(sql, data.projectId);
    if (photos.length === 0) return { total, stages: [] };

    const byId = new Map(
      milestones.map((m) => [
        String(m.id),
        { name: String(m.name ?? ""), stage: String(m.stage ?? ""), status: String(m.status ?? "") },
      ]),
    );

    const groups = groupByMilestone(photos);
    const filled = new Map<string, MilestoneGroup>();
    for (const group of groups) {
      const milestone = byId.get(group.milestoneId);
      // A photograph whose stage has been deleted should not appear at all —
      // the row is cascade-deleted, but a race is not worth a crash.
      if (!milestone) continue;
      filled.set(group.milestoneId, group);
    }

    const stages = milestones
      .map((m) => {
        const id = String(m.id);
        const group = filled.get(id);
        return group
          ? {
              milestoneId: id,
              name: String(m.name ?? ""),
              stage: String(m.stage ?? ""),
              status: String(m.status ?? ""),
              photos: group.photos,
            }
          : null;
      })
      .filter((x): x is MilestoneEvidence => x !== null);

    return { total, stages };
  });

/** A single photograph's image, as a `data:` URL. */
export const getMyEvidencePhoto = createServerFn({ method: "GET" })
  .validator(z.object({ photoId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<{ dataUrl: string | null }> => {
    const sql = await getSql();
    const [r] = await sql<Record<string, unknown>>`
      select p.mime, p.bytes
      from portal_evidence_photo p
      join portal_projects pr on pr.id = p.project_id
      where p.id = ${data.photoId} and pr.user_id = ${context.userId}
    `;
    if (!r?.bytes) return { dataUrl: null };
    return {
      dataUrl: `data:${String(r.mime)};base64,${Buffer.from(r.bytes as Uint8Array).toString("base64")}`,
    };
  });

/* ── studio ── */

export const readPhotosForStaff = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    return readPhotos(await getSql(), data.projectId);
  });

/**
 * Post a photograph against a stage.
 *
 * The caption is checked here rather than only in the browser, because a
 * hurried foreman will bypass the form and the caption is the whole point.
 * The bytes are re-checked for the same reason the avatar's are.
 */
export const addEvidencePhoto = createServerFn({ method: "POST" })
  .validator(
    z.object({
      projectId: z.string().min(1),
      milestoneId: z.string().min(1),
      caption: z.string().min(1).max(400),
      detail: z.string().max(DETAIL_MAX).optional().default(""),
      takenOn: z.string().max(40).optional().default(""),
      mime: z.enum(IMAGE_MIME),
      dataUrl: z.string().min(32).max(Math.ceil(MAX_BYTES * 1.5)),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();

    const caption = validateCaption(data.caption);
    if (!caption.ok) throw new Error(caption.reason);

    const [milestone] = await sql<{ id: string }>`
      select id from portal_milestones where id = ${data.milestoneId} and project_id = ${data.projectId}
    `;
    if (!milestone) throw new Error("That stage is not on this project.");

    const [count] = await sql<{ n: number }>`
      select count(*)::int as n from portal_evidence_photo where milestone_id = ${data.milestoneId}
    `;
    const room = checkPhotoCount(Number(count?.n ?? 0));
    if (!room.ok) throw new Error(room.reason);

    const [existing] = await sql<{ ord: number }>`
      select coalesce(max(ord), 0)::int as ord
      from portal_evidence_photo where milestone_id = ${data.milestoneId}
    `;
    const ord = Number(existing?.ord ?? 0) + 1;

    const base64 = data.dataUrl.split(",")[1] ?? "";
    const bytes = Buffer.from(base64, "base64");
    const size = checkImageSize(bytes.byteLength);
    if (!size.ok) throw new Error(size.reason);

    const staff = await requireStaff();

    await sql`
      insert into portal_evidence_photo (
        project_id, milestone_id, ord, caption, detail, taken_on, mime, bytes, uploaded_by
      ) values (
        ${data.projectId}, ${data.milestoneId}, ${ord}, ${caption.caption},
        ${data.detail.trim()}, ${data.takenOn}, ${data.mime}, ${bytes}, ${staff.email}
      )
    `;
    return { ok: true as const, id: null as string | null };
  });

export const deleteEvidencePhoto = createServerFn({ method: "POST" })
  .validator(z.object({ photoId: z.string().min(1) }))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await requireStaff();
    const sql = await getSql();
    // The photograph's own project is the scope; a client-supplied project id is
    // never trusted, because a client is not in this path at all.
    await sql`
      delete from portal_evidence_photo where id = ${data.photoId}
    `;
    return { ok: true as const };
  });
