import type { IdName } from "../../internal/type.ts";

export type News = {
  id: number;
  project: IdName;
  author: IdName;
  title: string;
  summary: string;
  description: string;
  createdOn: Date;
};
