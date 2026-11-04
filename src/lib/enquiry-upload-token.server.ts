import { createHash, randomBytes } from "node:crypto";

export function hashEnquiryUploadToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newEnquiryUploadGrant(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashEnquiryUploadToken(token) };
}
