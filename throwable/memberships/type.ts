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
  /**
   * The member's id. Redmine's field is `user_id`, but it accepts a group id
   * here too, so pass a group's id to create a group membership.
   */
  userId: number;
  roleIds: number[];
};

export type UpdateMembershipQuery = {
  roleIds: number[];
};
