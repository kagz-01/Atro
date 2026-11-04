import {
  formatMessageFileSize,
  MAX_MESSAGE_ATTACHMENT_BYTES,
  MAX_MESSAGE_ATTACHMENTS,
  MESSAGE_ATTACHMENT_ACCEPT,
  MESSAGE_ATTACHMENT_MIME_TYPES,
  validateMessageAttachment,
  validateMessageAttachmentMetadata,
} from "./message-attachments.ts";

export const MAX_ENQUIRY_ATTACHMENTS = MAX_MESSAGE_ATTACHMENTS;
export const MAX_ENQUIRY_ATTACHMENT_BYTES = MAX_MESSAGE_ATTACHMENT_BYTES;
export const ENQUIRY_ATTACHMENT_ACCEPT = MESSAGE_ATTACHMENT_ACCEPT;
export const ENQUIRY_ATTACHMENT_BUCKET = "atro-enquiry-attachments";

export {
  formatMessageFileSize,
  MESSAGE_ATTACHMENT_MIME_TYPES,
  validateMessageAttachment,
  validateMessageAttachmentMetadata,
};
