export const MAX_PROJECT_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_PROJECT_FILES = 20;
export const PROJECT_FILE_BUCKET = "atro-project-files";
export const PROJECT_FILE_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp";

export const PROJECT_FILE_CATEGORIES = [
  "Identity",
  "Ownership",
  "Plans",
  "Permits",
  "Payment",
  "Other",
] as const;

export const PROJECT_FILE_STATUS_LABEL: Record<ProjectFileStatus, string> = {
  submitted: "Document received",
  reviewing: "Document under review",
  accepted: "Document accepted",
  needs_changes: "More information needed",
};

export type ProjectFileCategory = (typeof PROJECT_FILE_CATEGORIES)[number];
export type ProjectFileStatus = "submitted" | "reviewing" | "accepted" | "needs_changes";

const MIME_EXTENSIONS: Record<string, readonly string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export const PROJECT_FILE_MIME_TYPES = Object.keys(MIME_EXTENSIONS);

export type ProjectFileInput = {
  filename: string;
  mime: string;
  bytes: Uint8Array;
};

export type ValidatedProjectFile = ProjectFileInput & {
  sizeBytes: number;
};

export function sanitizeProjectFilename(filename: string): string {
  const basename = filename.split(/[\\/]/).at(-1) ?? "";
  return [...basename]
    .map((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint < 32 || codePoint === 127 ? "_" : character;
    })
    .join("")
    .replace(/[<>:"|?*]/g, "_")
    .replace(/^\.+/, "")
    .trim()
    .slice(0, 160);
}

export function validateProjectFileMetadata(
  inputFilename: string,
  inputMime: string,
  sizeBytes: number,
): { ok: true; filename: string; mime: string; sizeBytes: number } | { ok: false; reason: string } {
  const filename = sanitizeProjectFilename(inputFilename);
  const mime = inputMime.toLowerCase();
  const extension = filename.includes(".") ? `.${filename.split(".").at(-1)?.toLowerCase()}` : "";
  if (!filename || !MIME_EXTENSIONS[mime]?.includes(extension)) {
    return { ok: false, reason: "Choose a PDF, JPG, PNG or WebP file." };
  }
  if (!Number.isInteger(sizeBytes) || sizeBytes <= 0) {
    return { ok: false, reason: "That file is empty." };
  }
  if (sizeBytes > MAX_PROJECT_FILE_BYTES) {
    return { ok: false, reason: "Each document must be 10 MB or smaller." };
  }
  return { ok: true, filename, mime, sizeBytes };
}

export function validateProjectFile(
  input: ProjectFileInput,
): { ok: true; file: ValidatedProjectFile } | { ok: false; reason: string } {
  const metadata = validateProjectFileMetadata(input.filename, input.mime, input.bytes.byteLength);
  if (!metadata.ok) return metadata;
  if (!matchesSignature(metadata.mime, input.bytes)) {
    return { ok: false, reason: "The file contents do not match its file type." };
  }
  return {
    ok: true,
    file: {
      ...input,
      filename: metadata.filename,
      mime: metadata.mime,
      sizeBytes: metadata.sizeBytes,
    },
  };
}

function matchesSignature(mime: string, bytes: Uint8Array): boolean {
  if (mime === "application/pdf") return ascii(bytes, 0, 5) === "%PDF-";
  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mime === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => bytes[index] === byte,
    );
  }
  if (mime === "image/webp") {
    return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP";
  }
  return false;
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length));
}
