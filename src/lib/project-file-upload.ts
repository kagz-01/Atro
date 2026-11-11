import {
  cancelMyProjectFile,
  finishMyProjectFile,
  prepareMyProjectFile,
} from "@/lib/project-files-server";
import { PROJECT_FILE_BUCKET, type ProjectFileCategory } from "@/lib/project-files";
import { supabaseBrowser } from "@/lib/supabase/browser";

export async function uploadProjectFile(
  projectId: string,
  title: string,
  category: ProjectFileCategory,
  file: File,
): Promise<void> {
  const supabase = supabaseBrowser();
  if (!supabase) {
    throw new Error(
      "Document uploads need Supabase sign-in and storage configured in this deployment.",
    );
  }

  const prepared = await prepareMyProjectFile({
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
    const uploaded = await supabase.storage
      .from(PROJECT_FILE_BUCKET)
      .uploadToSignedUrl(prepared.path, prepared.token, file, {
        contentType: file.type,
        upsert: false,
      });
    if (uploaded.error) throw new Error(uploaded.error.message);

    await finishMyProjectFile({ data: { documentId: prepared.documentId } });
  } catch (error) {
    try {
      await cancelMyProjectFile({ data: { documentId: prepared.documentId } });
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
