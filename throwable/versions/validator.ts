import {
  nullish,
  number,
  object,
  optional,
  picklist,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.2.0";
import {
  dateLikeString,
  idName,
  toUndefined,
} from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.1.0";
import type { Version, VersionQuery } from "./type.ts";

export const versionSchema = pipe(
  object({
    id: number(),
    project: idName,
    name: string(),
    description: pipe(nullish(string()), transform(toUndefined)),
    status: picklist(["open", "locked", "closed"]),
    sharing: picklist(["none", "descendants", "hierarchy", "tree", "system"]),
    due_date: pipe(nullish(dateLikeString), transform(toUndefined)),
    wiki_page_title: pipe(nullish(string()), transform(toUndefined)),
    estimated_hours: pipe(nullish(number()), transform(toUndefined)),
    spent_hours: pipe(nullish(number()), transform(toUndefined)),
    created_on: dateLikeString,
    updated_on: dateLikeString,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Version;
  }),
);

export const toVersionQuery = pipe(
  object({
    name: string(),
    status: optional(picklist(["open", "locked", "closed"])),
    sharing: optional(
      picklist(["none", "descendants", "hierarchy", "tree", "system"]),
    ),
    description: optional(string()),
    dueDate: optional(string()),
    wikiPageTitle: optional(string()),
  }),
  transform((input: VersionQuery) => {
    return objectToSnake(input);
  }),
);
