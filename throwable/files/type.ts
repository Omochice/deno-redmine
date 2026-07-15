import type { IdName } from "../../internal/type.ts";

export type ProjectFile = {
  id: number;
  filename: string;
  filesize: number;
  contentType: string;
  contentUrl: string;
  description?: string;
  version?: IdName;
  digest: string;
  downloads: number;
  author: IdName;
  createdOn: Date;
};

export type CreateFileQuery = {
  token: string;
  versionId?: number;
  filename?: string;
  description?: string;
};
