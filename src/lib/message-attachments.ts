export const MAX_MESSAGE_ATTACHMENTS = 5;
export const MAX_MESSAGE_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MESSAGE_ATTACHMENT_BUCKET = "atro-message-attachments";
export const MESSAGE_ATTACHMENT_ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf,.docx,.xlsx,.mp4,.webm";

const MIME_EXTENSIONS: Record<string, readonly string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
};
export const MESSAGE_ATTACHMENT_MIME_TYPES = Object.keys(MIME_EXTENSIONS);

export type MessageAttachmentInput = {
  filename: string;
  mime: string;
  bytes: Uint8Array;
};

export type ValidatedMessageAttachment = MessageAttachmentInput & {
  sizeBytes: number;
};

export function formatMessageFileSize(size: number): string {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function sanitizeAttachmentFilename(filename: string): string {
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

export function validateMessageAttachment(
  input: MessageAttachmentInput,
): { ok: true; attachment: ValidatedMessageAttachment } | { ok: false; reason: string } {
  const metadata = validateMessageAttachmentMetadata(
    input.filename,
    input.mime,
    input.bytes.byteLength,
  );
  if (!metadata.ok) return metadata;
  if (!matchesFileSignature(metadata.mime, input.bytes)) {
    return { ok: false, reason: "The file contents do not match its file type." };
  }

  return {
    ok: true,
    attachment: {
      ...input,
      filename: metadata.filename,
      mime: metadata.mime,
      sizeBytes: metadata.sizeBytes,
    },
  };
}

export function validateMessageAttachmentMetadata(
  inputFilename: string,
  inputMime: string,
  sizeBytes: number,
): { ok: true; filename: string; mime: string; sizeBytes: number } | { ok: false; reason: string } {
  const filename = sanitizeAttachmentFilename(inputFilename);
  const mime = inputMime.toLowerCase();
  const extension = filename.includes(".") ? `.${filename.split(".").at(-1)?.toLowerCase()}` : "";
  const supportedExtensions = MIME_EXTENSIONS[mime];
  if (!filename || !supportedExtensions?.includes(extension)) {
    return { ok: false, reason: "That file type is not supported." };
  }
  if (!Number.isInteger(sizeBytes) || sizeBytes <= 0) {
    return { ok: false, reason: "That file is empty." };
  }
  if (sizeBytes > MAX_MESSAGE_ATTACHMENT_BYTES) {
    return { ok: false, reason: "Each attachment must be 10 MB or smaller." };
  }
  return { ok: true, filename, mime, sizeBytes };
}

function matchesFileSignature(mime: string, bytes: Uint8Array): boolean {
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
  if (mime === "application/pdf") {
    return ascii(bytes, 0, 5) === "%PDF-";
  }
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  }
  if (mime === "video/mp4") {
    return ascii(bytes, 4, 4) === "ftyp";
  }
  if (mime === "video/webm") {
    return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }
  return false;
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length));
}
