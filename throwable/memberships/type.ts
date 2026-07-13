import type { IdName } from "../../internal/type.ts";

export type MembershipRole = {
  id: number;
  name: string;
  inherited?: boolean;
};

export type Membership = {
  id: number;
  project: IdName;
  user?: IdName;
  group?: IdName;
  roles: MembershipRole[];
};

export type CreateMembershipQuery = {
  userId: number;
  roleIds: number[];
};

export type UpdateMembershipQuery = {
  roleIds: number[];
};
