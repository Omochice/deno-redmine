import type { IdName } from "../../internal/type.ts";

export type VersionStatus = "open" | "locked" | "closed";

export type VersionSharing =
  | "none"
  | "descendants"
  | "hierarchy"
  | "tree"
  | "system";

export type Version = {
  id: number;
  project: IdName;
  name: string;
  description?: string;
  status: VersionStatus;
  sharing: VersionSharing;
  dueDate?: Date;
  wikiPageTitle?: string;
  estimatedHours?: number;
  spentHours?: number;
  createdOn: Date;
  updatedOn: Date;
};

export type VersionQuery = {
  name: string;
  status?: VersionStatus;
  sharing?: VersionSharing;
  description?: string;
  dueDate?: string;
  wikiPageTitle?: string;
};
