import {
  cancelDecisionVisuals,
  finishDecisionVisual,
  prepareDecisionVisual,
} from "@/lib/decision-visuals-server";
import { DECISION_IMAGE_MIME_TYPES, validateDecisionImageMetadata } from "@/lib/decision-visuals";
import { PROJECT_FILE_BUCKET } from "@/lib/project-files";
import { supabaseBrowser } from "@/lib/supabase/browser";

export async function uploadDecisionVisual(input: {
  projectId: string;
  draftKey: string;
  optionIndex: number;
  caption: string;
  file: File;
}): Promise<void> {
  const supabase = supabaseBrowser();
  if (!supabase) {
    throw new Error(
      "Decision image uploads need Supabase sign-in and storage configured in this deployment.",
    );
  }

  const mime = DECISION_IMAGE_MIME_TYPES.find((type) => type === input.file.type);
  if (!mime) throw new Error("Choose a JPG, PNG or WebP image.");
  const metadata = validateDecisionImageMetadata({
    filename: input.file.name,
    mime,
    sizeBytes: input.file.size,
  });
  if (!metadata.ok) throw new Error(metadata.reason);

  const prepared = await prepareDecisionVisual({
    data: {
      projectId: input.projectId,
      draftKey: input.draftKey,
      optionIndex: input.optionIndex,
      caption: input.caption,
      filename: metadata.filename,
      mime,
      sizeBytes: metadata.sizeBytes,
    },
  });

  try {
    const uploaded = await supabase.storage
      .from(PROJECT_FILE_BUCKET)
      .uploadToSignedUrl(prepared.path, prepared.token, input.file, {
        contentType: mime,
        upsert: false,
      });
    if (uploaded.error) throw new Error(uploaded.error.message);
    await finishDecisionVisual({ data: { visualId: prepared.visualId } });
  } catch (error) {
    try {
      await cancelDecisionVisuals({
        data: { projectId: input.projectId, draftKey: input.draftKey },
      });
    } catch (cleanupError) {
      throw new Error(
        `${error instanceof Error ? error.message : "The decision image upload failed."} Cleanup also failed: ${
          cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
        }`,
      );
    }
    throw error;
  }
}
