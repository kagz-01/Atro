import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ACCEPTED,
  checkImageSize,
  isImageMime,
  MAX_BYTES,
  MAX_EDGE,
  parseImageDataUrl,
} from "./image.ts";

const PNG_1PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("accepted formats", () => {
  it("takes JPEG, PNG and WebP, and nothing else", () => {
    assert.equal(isImageMime("image/jpeg"), true);
    assert.equal(isImageMime("image/png"), true);
    assert.equal(isImageMime("image/webp"), true);
    assert.equal(isImageMime("image/gif"), false);
    assert.equal(isImageMime("application/pdf"), false);
  });

  it("offers all three to the file picker", () => {
    assert.equal(ACCEPTED, "image/jpeg,image/png,image/webp");
  });
});

describe("checkImageSize", () => {
  it("accepts a photograph that came back under the limit", () => {
    assert.equal(checkImageSize(400 * 1024).ok, true);
  });

  it("accepts one exactly at the limit", () => {
    assert.equal(checkImageSize(MAX_BYTES).ok, true);
  });

  it("refuses one over it, and says how big it is", () => {
    const r = checkImageSize(MAX_BYTES + 1);
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.match(r.reason, /KB/);
    assert.match(r.reason, /smaller photo/);
  });

  it("refuses an empty file", () => {
    const r = checkImageSize(0);
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.match(r.reason, /empty/);
  });
});

describe("parseImageDataUrl", () => {
  it("reads a real image out of a data url", () => {
    const r = parseImageDataUrl(PNG_1PX);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.mime, "image/png");
    assert.ok(r.bytes.byteLength > 0);
  });

  it("refuses a url that is not an image", () => {
    const r = parseImageDataUrl("data:text/html;base64,PGgxPngh0bWw+PC9oMT4=");
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.match(r.reason, /JPEG, PNG or WebP/);
  });

  it("refuses something that is not a data url", () => {
    assert.equal(parseImageDataUrl("https://example.com/photo.jpg").ok, false);
  });

  it("refuses an image that is too big to store", () => {
    const big = `data:image/jpeg;base64,${"A".repeat(Math.ceil(MAX_BYTES * 1.4))}`;
    const r = parseImageDataUrl(big);
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.match(r.reason, /KB/);
  });
});

describe("the edge we keep", () => {
  it("is large enough to judge work on, and bounded", () => {
    assert.ok(MAX_EDGE >= 1280 && MAX_EDGE <= 2000, `unexpected max edge ${MAX_EDGE}`);
  });
});
