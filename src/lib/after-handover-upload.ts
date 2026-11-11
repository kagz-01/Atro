import { supabaseBrowser } from "@/lib/supabase/browser";
import { PROJECT_FILE_BUCKET } from "@/lib/project-files";
import {
  cancelDefectEvidenceUpload,
  cancelHandoverDocumentUpload,
  finishDefectEvidenceUpload,
  finishHandoverDocumentUpload,
  prepareDefectEvidenceUpload,
  prepareHandoverDocumentUpload,
} from "@/lib/after-handover-server";
import type { HandoverDocumentCategory } from "@/lib/defects";

async function uploadToStorage(path: string, token: string, file: File): Promise<void> {
  const supabase = supabaseBrowser();
  if (!supabase) {
    throw new Error("Secure file uploads are not configured in this deployment.");
  }
  const result = await supabase.storage.from(PROJECT_FILE_BUCKET).uploadToSignedUrl(path, token, file, {
    contentType: file.type,
    upsert: false,
  });
  if (result.error) throw new Error(result.error.message);
}

export async function uploadHandoverDocument(
  projectId: string,
  title: string,
  category: HandoverDocumentCategory,
  file: File,
): Promise<void> {
  const prepared = await prepareHandoverDocumentUpload({
    data: {
      projectId,
      title,
      category,
      filename: file.name,
      mime: file.type,
      sizeBytes: file.size,
    },
  });
  try {
    await uploadToStorage(prepared.path, prepared.token, file);
    await finishHandoverDocumentUpload({ data: { documentId: prepared.documentId } });
  } catch (error) {
    try {
      await cancelHandoverDocumentUpload({ data: { documentId: prepared.documentId } });
    } catch (cleanupError) {
      throw new Error(
        `${error instanceof Error ? error.message : "The document upload failed."} Cleanup also failed: ${
          cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
        }`,
      );
    }
    throw error;
  }
}

export async function uploadDefectEvidence(
  projectId: string,
  defectId: string,
  file: File,
): Promise<void> {
  const prepared = await prepareDefectEvidenceUpload({
    data: {
      projectId,
      defectId,
      filename: file.name,
      mime: file.type,
      sizeBytes: file.size,
    },
  });
  try {
    await uploadToStorage(prepared.path, prepared.token, file);
    await finishDefectEvidenceUpload({ data: { evidenceId: prepared.evidenceId } });
  } catch (error) {
    try {
      await cancelDefectEvidenceUpload({ data: { evidenceId: prepared.evidenceId } });
    } catch (cleanupError) {
      throw new Error(
        `${error instanceof Error ? error.message : "The evidence upload failed."} Cleanup also failed: ${
          cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
        }`,
      );
    }
    throw error;
  }
}
