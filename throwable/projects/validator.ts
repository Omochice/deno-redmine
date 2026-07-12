import {
  array,
  boolean,
  nullish,
  number,
  object,
  omit,
  optional,
  partial,
  pipe,
  record,
  string,
  transform,
  unknown,
} from "jsr:@valibot/valibot@1.4.2";
import {
  dateLikeString,
  idName,
  toUndefined,
} from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { Project, ProjectQuery } from "./type.ts";

export const projectSchema = pipe(
  object({
    id: number(),
    name: string(),
    identifier: string(),
    description: pipe(nullish(string()), transform(toUndefined)),
    homepage: pipe(nullish(string()), transform(toUndefined)),
    status: number(),
    is_public: pipe(nullish(boolean()), transform(toUndefined)),
    inherit_members: boolean(),
    enable_new_ticket_message: pipe(nullish(number()), transform(toUndefined)),
    new_ticket_message: pipe(nullish(string()), transform(toUndefined)),
    default_version: pipe(nullish(idName), transform(toUndefined)),
    created_on: dateLikeString,
    updated_on: dateLikeString,
    parent: pipe(nullish(idName), transform(toUndefined)),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Project;
  }),
);

const projectQuerySchema = object({
  name: string(),
  identifier: string(),
  description: optional(string()),
  homepage: optional(string()),
  isPublic: optional(boolean()),
  parentId: optional(number()),
  inheritMembers: optional(boolean()),
  defaultAssignedToId: optional(number()),
  defaultVersionId: optional(string()),
  trackerIds: optional(array(number())),
  enableModuleNames: optional(array(string())),
  issueCustomFieldIds: optional(array(string())),
  customFieldValues: optional(record(string(), unknown())),
});

export const toProjectQuery = pipe(
  projectQuerySchema,
  transform((input: ProjectQuery) => {
    return objectToSnake(input);
  }),
);

export const toProjectUpdateQuery = pipe(
  partial(omit(projectQuerySchema, ["identifier"])),
  transform((input) => {
    return objectToSnake(input);
  }),
);
