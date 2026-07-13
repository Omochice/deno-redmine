import {
  array,
  boolean,
  number,
  object,
  optional,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { idName } from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { Membership } from "./type.ts";

const membershipRoleSchema = object({
  id: number(),
  name: string(),
  inherited: optional(boolean()),
});

export const membershipSchema = pipe(
  object({
    id: number(),
    project: idName,
    // A membership belongs to either a user or a group, never both, so both
    // are optional here.
    user: optional(idName),
    group: optional(idName),
    roles: array(membershipRoleSchema),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Membership;
  }),
);

const createMembershipQuerySchema = object({
  // Redmine names this field `user_id` even when the member is a group.
  userId: number(),
  roleIds: array(number()),
});

export const toCreateMembershipQuery = pipe(
  createMembershipQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);

const updateMembershipQuerySchema = object({
  roleIds: array(number()),
});

export const toUpdateMembershipQuery = pipe(
  updateMembershipQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);
