import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateDecisionImage, validateDecisionImageMetadata } from "./decision-visuals.ts";

describe("decision option image validation", () => {
  it("accepts supported image metadata", () => {
    assert.equal(
      validateDecisionImageMetadata({
        filename: "tile.jpg",
        mime: "image/jpeg",
        sizeBytes: 1200,
      }).ok,
      true,
    );
    assert.equal(
      validateDecisionImageMetadata({
        filename: "finish.webp",
        mime: "image/webp",
        sizeBytes: 1200,
      }).ok,
      true,
    );
  });

  it("rejects unsupported types, mismatched extensions, and oversized images", () => {
    assert.equal(
      validateDecisionImageMetadata({
        filename: "plan.pdf",
        mime: "application/pdf",
        sizeBytes: 1200,
      }).ok,
      false,
    );
    assert.equal(
      validateDecisionImageMetadata({
        filename: "photo.png",
        mime: "image/jpeg",
        sizeBytes: 1200,
      }).ok,
      false,
    );
    assert.equal(
      validateDecisionImageMetadata({
        filename: "photo.png",
        mime: "image/png",
        sizeBytes: 10 * 1024 * 1024 + 1,
      }).ok,
      false,
    );
  });

  it("checks the content signature, not just the extension", () => {
    assert.equal(
      validateDecisionImage({
        filename: "photo.png",
        mime: "image/png",
        bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      }).ok,
      true,
    );
    assert.equal(
      validateDecisionImage({
        filename: "fake.png",
        mime: "image/png",
        bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
      }).ok,
      false,
    );
  });
});
