import type { IdName } from "../../internal/type.ts";
import type { Attachment } from "../attachments/type.ts";

export type News = {
  id: number;
  project: IdName;
  author: IdName;
  title: string;
  summary: string;
  description: string;
  createdOn: Date;
};

export type Comment = {
  id: number;
  author?: IdName;
  content: string;
};

export type ShowNews = {
  id: number;
  project: IdName;
  author: IdName;
  title: string;
  // Redmine omits the summary from the show response when it is blank, unlike
  // the list response which renders it as an empty string.
  summary?: string;
  description: string;
  createdOn: Date;
  attachments?: Attachment[];
  comments?: Comment[];
};

export type NewsUpload = {
  token: string;
  filename?: string;
  contentType?: string;
  description?: string;
};

export type CreateNewsQuery = {
  title: string;
  description: string;
  summary?: string;
  uploads?: NewsUpload[];
};

export type UpdateNewsQuery = Partial<CreateNewsQuery>;
