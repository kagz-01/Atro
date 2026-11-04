import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ENQUIRY_ATTACHMENT_ACCEPT,
  ENQUIRY_ATTACHMENT_BUCKET,
  MAX_ENQUIRY_ATTACHMENT_BYTES,
  MAX_ENQUIRY_ATTACHMENTS,
} from "./enquiry-attachments.ts";
import {
  hashEnquiryUploadToken,
  newEnquiryUploadGrant,
} from "./enquiry-upload-token.server.ts";

describe("enquiry attachment limits", () => {
  it("uses a private bucket and bounded attachment count and size", () => {
    assert.equal(ENQUIRY_ATTACHMENT_BUCKET, "atro-enquiry-attachments");
    assert.equal(MAX_ENQUIRY_ATTACHMENTS, 5);
    assert.equal(MAX_ENQUIRY_ATTACHMENT_BYTES, 10 * 1024 * 1024);
    assert.match(ENQUIRY_ATTACHMENT_ACCEPT, /\.pdf/);
    assert.match(ENQUIRY_ATTACHMENT_ACCEPT, /\.png/);
  });
});

describe("enquiry upload grants", () => {
  it("returns an unguessable token and only stores its one-way hash", () => {
    const grant = newEnquiryUploadGrant();
    assert.ok(grant.token.length >= 40);
    assert.notEqual(grant.token, grant.tokenHash);
    assert.equal(grant.tokenHash, hashEnquiryUploadToken(grant.token));
    assert.notEqual(grant.token, newEnquiryUploadGrant().token);
  });
});
