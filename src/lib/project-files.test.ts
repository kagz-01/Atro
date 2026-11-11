import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_PROJECT_FILE_BYTES,
  sanitizeProjectFilename,
  validateProjectFile,
  validateProjectFileMetadata,
} from "./project-files.ts";

describe("project document metadata", () => {
  it("sanitizes a path-like filename and accepts supported files", () => {
    assert.equal(sanitizeProjectFilename("C:\\fakepath\\land-title.pdf"), "land-title.pdf");
    assert.equal(validateProjectFileMetadata("plan.webp", "image/webp", 128).ok, true);
  });

  it("rejects unsupported, mismatched, empty, and oversized files", () => {
    assert.equal(validateProjectFileMetadata("plan.docx", "application/pdf", 128).ok, false);
    assert.equal(validateProjectFileMetadata("plan.pdf", "application/pdf", 0).ok, false);
    assert.equal(
      validateProjectFileMetadata("plan.pdf", "application/pdf", MAX_PROJECT_FILE_BYTES + 1).ok,
      false,
    );
    assert.equal(validateProjectFileMetadata("plan.pdf", "application/pdf", 128).ok, true);
  });
});

describe("project document content", () => {
  it("accepts a PDF only when its signature matches the declared type", () => {
    const pdf = new TextEncoder().encode("%PDF-1.7\nsynthetic test document");
    assert.equal(
      validateProjectFile({ filename: "plan.pdf", mime: "application/pdf", bytes: pdf }).ok,
      true,
    );
    assert.equal(
      validateProjectFile({
        filename: "plan.pdf",
        mime: "application/pdf",
        bytes: new TextEncoder().encode("not a PDF"),
      }).ok,
      false,
    );
  });

  it("accepts a valid PNG signature", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.equal(
      validateProjectFile({ filename: "scan.png", mime: "image/png", bytes: png }).ok,
      true,
    );
  });
});
