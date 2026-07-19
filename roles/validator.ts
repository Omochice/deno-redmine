import {
  array,
  boolean,
  number,
  object,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { idName } from "../internal/validator.ts";
import { objectToCamel } from "npm:ts-case-convert@2.3.1";
import type { Role } from "./type.ts";

export const roleListResponse = object({
  roles: array(idName),
});

export const roleSchema = pipe(
  object({
    id: number(),
    name: string(),
    assignable: boolean(),
    // Not restricted to a picklist: Redmine stores this as a free varchar
    // column, so a fixed enum here would break parsing whenever Redmine
    // adds a new visibility option.
    issues_visibility: string(),
    time_entries_visibility: string(),
    users_visibility: string(),
    permissions: array(string()),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Role;
  }),
);

export const roleShowResponse = object({
  role: roleSchema,
});
