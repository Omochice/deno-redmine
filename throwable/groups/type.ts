import type { IdName } from "../../internal/type.ts";

export type GroupMembership = {
  id: number;
  project: IdName;
  roles: IdName[];
};

export type Group = {
  id: number;
  name: string;
  users?: IdName[];
  memberships?: GroupMembership[];
};

export type CreateGroupQuery = {
  name: string;
  userIds?: number[];
};

export type UpdateGroupQuery = Partial<CreateGroupQuery>;
