import {
  array,
  number,
  object,
  optional,
  partial,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { idName } from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { Group } from "./type.ts";

export const groupSchema = pipe(
  object({
    id: number(),
    name: string(),
    users: optional(array(idName)),
    memberships: optional(array(object({
      id: number(),
      project: idName,
      roles: array(idName),
    }))),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Group;
  }),
);

const createGroupQuerySchema = object({
  name: string(),
  userIds: optional(array(number())),
});

export const toCreateGroupQuery = pipe(
  createGroupQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);

export const toUpdateGroupQuery = pipe(
  partial(createGroupQuerySchema),
  transform((input) => {
    return objectToSnake(input);
  }),
);
