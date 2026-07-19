import {
  date,
  nullish,
  number,
  object,
  optional,
  partial,
  picklist,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { dateLikeString, idName, toUndefined } from "../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { Version } from "./type.ts";

const statusValues = ["open", "locked", "closed"] as const;
const sharingValues = [
  "none",
  "descendants",
  "hierarchy",
  "tree",
  "system",
] as const;

export const versionSchema = pipe(
  object({
    id: number(),
    project: idName,
    name: string(),
    description: pipe(nullish(string()), transform(toUndefined)),
    status: picklist(statusValues),
    due_date: pipe(nullish(dateLikeString), transform(toUndefined)),
    sharing: picklist(sharingValues),
    wiki_page_title: pipe(nullish(string()), transform(toUndefined)),
    created_on: dateLikeString,
    updated_on: dateLikeString,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Version;
  }),
);

// Redmine expects dates as YYYY-MM-DD strings. The UTC date part is used
// rather than the local calendar fields because dateLikeString parses
// Redmine's date-only strings as UTC midnight, so only UTC keeps a
// show() -> update() round-trip on the same calendar day. The trade-off:
// a Date built from local calendar fields (e.g. new Date(2026, 6, 1) in
// UTC+9) serializes to the previous day.
const toRedmineDate = pipe(
  date(),
  transform((input: Date) => input.toISOString().slice(0, 10)),
);

const createVersionQuerySchema = object({
  name: string(),
  status: optional(picklist(statusValues)),
  sharing: optional(picklist(sharingValues)),
  description: optional(string()),
  dueDate: optional(toRedmineDate),
  wikiPageTitle: optional(string()),
});

export const toCreateVersionQuery = pipe(
  createVersionQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);

export const toUpdateVersionQuery = pipe(
  partial(createVersionQuerySchema),
  transform((input) => {
    return objectToSnake(input);
  }),
);
