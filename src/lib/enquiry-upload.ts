import {
  cancelEnquiryAttachment,
  finishEnquiryAttachment,
  prepareEnquiryAttachment,
} from "@/lib/enquiry-attachments-server";
import { ENQUIRY_ATTACHMENT_BUCKET } from "@/lib/enquiry-attachments";
import { supabaseBrowser } from "@/lib/supabase/browser";

export async function uploadEnquiryFile(
  enquiryId: string,
  uploadToken: string,
  file: File,
): Promise<void> {
  const supabase = supabaseBrowser();
  if (!supabase) {
    throw new Error("File uploads need Supabase storage configured in this deployment.");
  }

  const prepared = await prepareEnquiryAttachment({
    data: {
      enquiryId,
      token: uploadToken,
      filename: file.name,
      mime: file.type,
      sizeBytes: file.size,
    },
  });

  try {
    const uploaded = await supabase.storage
      .from(ENQUIRY_ATTACHMENT_BUCKET)
      .uploadToSignedUrl(prepared.path, prepared.token, file, {
        contentType: file.type,
        upsert: false,
      });
    if (uploaded.error) throw new Error(uploaded.error.message);

    await finishEnquiryAttachment({
      data: { enquiryId, token: uploadToken, attachmentId: prepared.attachmentId },
    });
  } catch (error) {
    try {
      await cancelEnquiryAttachment({
        data: { enquiryId, token: uploadToken, attachmentId: prepared.attachmentId },
      });
    } catch (cleanupError) {
      throw new Error(
        `${error instanceof Error ? error.message : "The file upload failed."} Cleanup also failed: ${
          cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
        }`,
      );
    }
    throw error;
  }
}
