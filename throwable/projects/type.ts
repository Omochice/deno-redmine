import type { IdName } from "../../internal/type.ts";

export type Project = {
  id: number;
  name: string;
  identifier: string;
  description?: string;
  homepage?: string;
  status: number;
  isPublic?: boolean;
  inheritMembers: boolean;
  enableNewTicketMessage?: number;
  newTicketMessage?: string;
  defaultVersion?: IdName;
  createdOn: Date;
  updatedOn: Date;
  parent?: IdName;
};

export type ProjectQuery = {
  name: string;
  identifier: string;
  description?: string;
  homepage?: string;
  isPublic?: boolean;
  parentId?: number;
  inheritMembers?: boolean;
  defaultAssignedToId?: number;
  defaultVersionId?: string;
  trackerids?: number[];
  enableModuleNames?: string[];
  issueCustomFieldIds?: string[];
  customFieldValues?: Record<string, unknown>;
};
