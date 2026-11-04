import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_MESSAGE_ATTACHMENT_BYTES,
  MAX_MESSAGE_ATTACHMENTS,
  sanitizeAttachmentFilename,
  validateMessageAttachment,
} from "./message-attachments.ts";

describe("message attachment validation", () => {
  it("defines the agreed upload limits", () => {
    assert.equal(MAX_MESSAGE_ATTACHMENTS, 5);
    assert.equal(MAX_MESSAGE_ATTACHMENT_BYTES, 10 * 1024 * 1024);
  });

  it("accepts supported document data and normalizes its filename", () => {
    const result = validateMessageAttachment({
      filename: "C:\\Users\\client\\plan.pdf",
      mime: "application/pdf",
      bytes: new TextEncoder().encode("%PDF-1.7"),
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.attachment.filename, "plan.pdf");
    assert.equal(result.attachment.sizeBytes, 8);
  });

  it("rejects extensions that do not match the declared content type", () => {
    const result = validateMessageAttachment({
      filename: "invoice.exe",
      mime: "application/pdf",
      bytes: new TextEncoder().encode("%PDF-1.7"),
    });
    assert.equal(result.ok, false);
  });

  it("rejects spoofed MIME types and signatures", () => {
    const result = validateMessageAttachment({
      filename: "image.jpg",
      mime: "image/jpeg",
      bytes: new TextEncoder().encode("not an image"),
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.reason, /contents do not match/);
  });

  it("rejects files that exceed the per-file limit", () => {
    const result = validateMessageAttachment({
      filename: "big.pdf",
      mime: "application/pdf",
      bytes: new Uint8Array(MAX_MESSAGE_ATTACHMENT_BYTES + 1),
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.reason, /10 MB or smaller/);
  });

  it("removes path components and unsafe filename characters", () => {
    assert.equal(sanitizeAttachmentFilename("../bad:name?.pdf"), "bad_name_.pdf");
  });

  it("replaces control characters instead of allowing them in stored names", () => {
    assert.equal(sanitizeAttachmentFilename("plan\u0000\u001f.pdf"), "plan__.pdf");
  });
});
