import {
  cancelMyMessageAttachment,
  cancelStaffMessageAttachment,
  finishMyMessageAttachment,
  finishStaffMessageAttachment,
  prepareMyMessageAttachment,
  prepareStaffMessageAttachment,
} from "@/lib/messages-server";
import {
  MESSAGE_ATTACHMENT_BUCKET,
} from "@/lib/message-attachments";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { MessageRole } from "@/lib/messages";

export async function uploadMessageFile(
  role: MessageRole,
  messageId: string,
  file: File,
): Promise<void> {
  const supabase = supabaseBrowser();
  if (!supabase) {
    throw new Error("File uploads need Supabase sign-in and storage configured in this deployment.");
  }

  const details = {
    messageId,
    filename: file.name,
    mime: file.type,
    sizeBytes: file.size,
  };
  const prepared =
    role === "client"
      ? await prepareMyMessageAttachment({ data: details })
      : await prepareStaffMessageAttachment({ data: details });

  try {
    const uploaded = await supabase.storage
      .from(MESSAGE_ATTACHMENT_BUCKET)
      .uploadToSignedUrl(prepared.path, prepared.token, file, {
        contentType: file.type,
        upsert: false,
      });
    if (uploaded.error) throw new Error(uploaded.error.message);

    if (role === "client") {
      await finishMyMessageAttachment({
        data: { messageId, attachmentId: prepared.attachmentId },
      });
    } else {
      await finishStaffMessageAttachment({
        data: { messageId, attachmentId: prepared.attachmentId },
      });
    }
  } catch (error) {
    try {
      if (role === "client") {
        await cancelMyMessageAttachment({
          data: { messageId, attachmentId: prepared.attachmentId },
        });
      } else {
        await cancelStaffMessageAttachment({
          data: { messageId, attachmentId: prepared.attachmentId },
        });
      }
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
