import { supabaseAdmin } from "@/lib/supabase/server";
import {
  MAX_PROJECT_FILE_BYTES,
  PROJECT_FILE_BUCKET,
  PROJECT_FILE_MIME_TYPES,
} from "@/lib/project-files";

export async function getProjectFileStorage() {
  const admin = supabaseAdmin();
  if (!admin) {
    throw new Error(
      "Project document uploads need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY configured on the server.",
    );
  }

  const current = await admin.storage.getBucket(PROJECT_FILE_BUCKET);
  if (!current.data) {
    const created = await admin.storage.createBucket(PROJECT_FILE_BUCKET, {
      public: false,
      fileSizeLimit: MAX_PROJECT_FILE_BYTES,
      allowedMimeTypes: PROJECT_FILE_MIME_TYPES,
    });
    if (created.error) {
      const retry = await admin.storage.getBucket(PROJECT_FILE_BUCKET);
      if (!retry.data) {
        throw new Error(
          `Could not prepare private project document storage: ${created.error.message}`,
        );
      }
    }
  } else if (
    current.data.public ||
    current.data.file_size_limit !== MAX_PROJECT_FILE_BYTES ||
    !sameMimeTypes(current.data.allowed_mime_types)
  ) {
    const updated = await admin.storage.updateBucket(PROJECT_FILE_BUCKET, {
      public: false,
      fileSizeLimit: MAX_PROJECT_FILE_BYTES,
      allowedMimeTypes: PROJECT_FILE_MIME_TYPES,
    });
    if (updated.error) {
      throw new Error(
        `Could not secure private project document storage: ${updated.error.message}`,
      );
    }
  }

  return admin.storage.from(PROJECT_FILE_BUCKET);
}

function sameMimeTypes(current: string[] | null | undefined): boolean {
  return Boolean(
    current &&
    current.length === PROJECT_FILE_MIME_TYPES.length &&
    PROJECT_FILE_MIME_TYPES.every((mime) => current.includes(mime)),
  );
}
