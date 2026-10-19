/**
 * Evidence: the photographs that prove a stage happened.
 *
 * This is the product's whole argument. Aalis put it bluntly — "weekly WhatsApp
 * photos are not project management, they are documentation of what already
 * happened, without independent verification, quality assessment, or financial
 * accountability." A photograph tied to the milestone it proves, dated, with a
 * caption that says what is in the frame, is the cheapest possible way to close
 * that gap.
 *
 * Pure helpers only: how photographs group against milestones, what a caption
 * must say, and how many a stage will hold before it becomes a gallery.
 */

import { checkImageSize, MAX_BYTES } from "./image.ts";

export type EvidencePhoto = {
  id: string;
  projectId: string;
  milestoneId: string;
  ord: number;
  caption: string;
  detail: string;
  /** ISO date the photograph was taken, not the date it was uploaded. */
  takenOn: string;
  mime: string;
  /** Bytes live in the database; the list carries only whether there are any. */
  hasImage: boolean;
  uploadedBy: string;
  uploadedAt: string;
};

export const CAPTION_MIN = 3;
export const CAPTION_MAX = 160;
export const DETAIL_MAX = 600;

/**
 * Words that carry no information about what is in the frame.
 *
 * These are what a hurried foreman types. Rejecting them is the only moment
 * where the system insists on the difference between evidence and a file with a
 * date on it.
 */
const GENERIC = new Set([
  "photo",
  "photos",
  "pic",
  "pics",
  "picture",
  "pictures",
  "image",
  "images",
  "shot",
  "shots",
  "site",
  "sites",
  "upload",
  "uploads",
  "test",
  "untitled",
  "img",
  "dsc",
]);

/**
 * How many photographs one stage will hold.
 *
 * Enough to show a slab pour from three angles, few enough that a client opening
 * their phone does not download a gallery. The studio is told when they hit it
 * rather than being allowed to upload into silence.
 */
export const MAX_PER_MILESTONE = 12;

/**
 * A caption has to say something.
 *
 * "Photo 1" is not evidence — it is a file with a date on it. What is in the
 * frame, and where, is the difference between a record and a receipt.
 */
export function validateCaption(
  caption: string,
): { ok: true; caption: string } | { ok: false; reason: string } {
  const trimmed = caption.replace(/\s+/g, " ").trim();
  if (trimmed.length < CAPTION_MIN) {
    return {
      ok: false,
      reason: "Say what is in the photograph — “ring beam before the pour”, not “photo”.",
    };
  }
  // "Photo 1", "IMG_4821", "site" — a single word, possibly with digits, that
  // names the file rather than what is in it.
  const words = trimmed
    .toLowerCase()
    .replace(/[\d_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length > 0 && words.every((word) => GENERIC.has(word))) {
    return {
      ok: false,
      reason: "Say what is in the photograph — “ring beam before the pour”, not “photo”.",
    };
  }
  if (trimmed.length > CAPTION_MAX) {
    return { ok: false, reason: `Keep the caption under ${CAPTION_MAX} characters.` };
  }
  return { ok: true, caption: trimmed };
}

export function checkPhotoCount(
  existing: number,
  adding = 1,
): { ok: true } | { ok: false; reason: string } {
  if (existing + adding > MAX_PER_MILESTONE) {
    return {
      ok: false,
      reason: `This stage already holds ${existing} photographs. Remove one before adding another.`,
    };
  }
  return { ok: true };
}

export { checkImageSize, MAX_BYTES };

export type MilestoneGroup = { milestoneId: string; photos: EvidencePhoto[] };

/**
 * Photographs grouped by the milestone they prove.
 *
 * Only stages that have at least one photograph appear, so the client is not
 * shown nine empty headings waiting for pictures.
 */
export function groupByMilestone(photos: EvidencePhoto[]): MilestoneGroup[] {
  const groups = new Map<string, EvidencePhoto[]>();
  for (const photo of photos) {
    const list = groups.get(photo.milestoneId) ?? [];
    list.push(photo);
    groups.set(photo.milestoneId, list);
  }
  return [...groups.entries()]
    .map(([milestoneId, list]) => ({
      milestoneId,
      photos: [...list].sort((a, b) => a.ord - b.ord),
    }))
    .sort((a, b) => {
      const ao = a.photos[0]?.ord ?? 0;
      const bo = b.photos[0]?.ord ?? 0;
      return ao - bo;
    });
}

/** How many stages on a project have photographic proof at all. */
export function stagesWithProof(photos: EvidencePhoto[], milestoneCount: number): number {
  if (milestoneCount === 0) return 0;
  const withPhotos = new Set(photos.map((p) => p.milestoneId)).size;
  return Math.min(withPhotos, milestoneCount);
}

/**
 * The sentence under the milestone list.
 *
 * The honest version names the gap: saying nothing about a stage with no
 * photographs would imply every stage has them.
 */
export function proofLine(photos: EvidencePhoto[], milestoneCount: number): string {
  if (milestoneCount === 0) return "";
  const proven = stagesWithProof(photos, milestoneCount);
  if (proven === 0) {
    return "No photographs have been posted on this project yet.";
  }
  if (proven >= milestoneCount) {
    return `Every one of the ${milestoneCount} stages has photographic evidence.`;
  }
  return `${proven} of ${milestoneCount} stages have photographic evidence. The rest are still to come.`;
}