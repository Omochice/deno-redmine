import type { IdName } from "../internal/type.ts";

export type IssueCategory = {
  id: number;
  project: IdName;
  name: string;
  assignedTo?: IdName;
};

export type CreateIssueCategoryQuery = {
  name: string;
  assignedToId?: number;
};

export type UpdateIssueCategoryQuery = Partial<CreateIssueCategoryQuery>;
