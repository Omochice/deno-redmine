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

export type UpdateAttachmentQuery = {
  filename?: string;
  description?: string;
};
