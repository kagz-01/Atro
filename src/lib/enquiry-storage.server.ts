import { supabaseAdmin } from "@/lib/supabase/server";
import {
  ENQUIRY_ATTACHMENT_BUCKET,
  MAX_ENQUIRY_ATTACHMENT_BYTES,
  MESSAGE_ATTACHMENT_MIME_TYPES,
} from "@/lib/enquiry-attachments";

export async function getEnquiryStorage() {
  const admin = supabaseAdmin();
  if (!admin) {
    throw new Error(
      "Enquiry file uploads need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY configured on the server.",
    );
  }

  const current = await admin.storage.getBucket(ENQUIRY_ATTACHMENT_BUCKET);
  if (!current.data) {
    const created = await admin.storage.createBucket(ENQUIRY_ATTACHMENT_BUCKET, {
      public: false,
      fileSizeLimit: MAX_ENQUIRY_ATTACHMENT_BYTES,
      allowedMimeTypes: MESSAGE_ATTACHMENT_MIME_TYPES,
    });
    if (created.error) {
      const retry = await admin.storage.getBucket(ENQUIRY_ATTACHMENT_BUCKET);
      if (!retry.data) {
        throw new Error(`Could not prepare private enquiry file storage: ${created.error.message}`);
      }
    }
  } else if (
    current.data.public ||
    current.data.file_size_limit !== MAX_ENQUIRY_ATTACHMENT_BYTES ||
    !sameMimeTypes(current.data.allowed_mime_types)
  ) {
    const updated = await admin.storage.updateBucket(ENQUIRY_ATTACHMENT_BUCKET, {
      public: false,
      fileSizeLimit: MAX_ENQUIRY_ATTACHMENT_BYTES,
      allowedMimeTypes: MESSAGE_ATTACHMENT_MIME_TYPES,
    });
    if (updated.error) {
      throw new Error(`Could not secure private enquiry file storage: ${updated.error.message}`);
    }
  }

  return admin.storage.from(ENQUIRY_ATTACHMENT_BUCKET);
}

function sameMimeTypes(current: string[] | null | undefined): boolean {
  return Boolean(
    current &&
      current.length === MESSAGE_ATTACHMENT_MIME_TYPES.length &&
      MESSAGE_ATTACHMENT_MIME_TYPES.every((mime) => current.includes(mime)),
  );
}
