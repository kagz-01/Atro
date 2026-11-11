import { validateProjectFile, validateProjectFileMetadata } from "./project-files.ts";

export const MAX_DECISION_IMAGE_BYTES = 10 * 1024 * 1024;
export const DECISION_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type DecisionImageInput = {
  filename: string;
  mime: string;
  sizeBytes: number;
};

export function validateDecisionImageMetadata(input: DecisionImageInput) {
  if (
    !DECISION_IMAGE_MIME_TYPES.includes(
      input.mime.toLowerCase() as (typeof DECISION_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return { ok: false as const, reason: "Choose a JPG, PNG or WebP image." };
  }
  if (input.sizeBytes > MAX_DECISION_IMAGE_BYTES) {
    return { ok: false as const, reason: "Each decision image must be 10 MB or smaller." };
  }
  return validateProjectFileMetadata(input.filename, input.mime, input.sizeBytes);
}

export function validateDecisionImage(input: {
  filename: string;
  mime: string;
  bytes: Uint8Array;
}) {
  if (
    !DECISION_IMAGE_MIME_TYPES.includes(
      input.mime.toLowerCase() as (typeof DECISION_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return { ok: false as const, reason: "Choose a JPG, PNG or WebP image." };
  }
  if (input.bytes.byteLength > MAX_DECISION_IMAGE_BYTES) {
    return { ok: false as const, reason: "Each decision image must be 10 MB or smaller." };
  }
  return validateProjectFile(input);
}
