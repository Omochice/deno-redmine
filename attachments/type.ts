import type { IdName } from "../internal/type.ts";

export type Attachment = {
  id: number;
  filename: string;
  filesize: number;
  contentType: string;
  description?: string;
  contentUrl: string;
  thumbnailUrl?: string;
  author: IdName;
  createdOn: Date;
};

/**
 * The content of an attachment together with the metadata describing it.
 *
 * The content is a stream so an attachment of any size can be consumed
 * without being held in memory.
 */
export type AttachmentContent = {
  filename: string;
  contentType: string;
  filesize: number;
  body: ReadableStream<Uint8Array>;
};

export type UpdateAttachmentQuery = {
  filename?: string;
  description?: string;
};
