import {
  array,
  boolean,
  nullish,
  number,
  object,
  optional,
  pipe,
  record,
  regex,
  string,
  transform,
  unknown,
} from "jsr:@valibot/valibot@1.2.0";
import {
  dateLikeString,
  idName,
  toUndefined,
} from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.1.0";
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

export const toProjectQuery = pipe(
  object({
    name: pipe(
      string(),
      /** need match /^[a-zA-Z0-9\-_]{1,100}$/ */
      regex(/^[a-zA-Z0-9\-_]{1,100}$/),
    ),
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
  }),
  transform((input: ProjectQuery) => {
    return objectToSnake(input);
  }),
);
