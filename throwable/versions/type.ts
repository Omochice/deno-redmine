import type { IdName } from "../../internal/type.ts";

export type Version = {
  id: number;
  project: IdName;
  name: string;
  description?: string;
  status: "open" | "locked" | "closed";
  dueDate?: Date;
  sharing: "none" | "descendants" | "hierarchy" | "tree" | "system";
  wikiPageTitle?: string;
  createdOn: Date;
  updatedOn: Date;
};

export type CreateVersionQuery = {
  name: string;
  status?: "open" | "locked" | "closed";
  sharing?: "none" | "descendants" | "hierarchy" | "tree" | "system";
  description?: string;
  dueDate?: string;
  wikiPageTitle?: string;
};

export type UpdateVersionQuery = Partial<CreateVersionQuery>;
