import {
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
import {
  dateLikeString,
  idName,
  toUndefined,
} from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { CreateVersionQuery, Version } from "./type.ts";

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

const createVersionQuerySchema = object({
  name: string(),
  status: optional(picklist(statusValues)),
  sharing: optional(picklist(sharingValues)),
  description: optional(string()),
  dueDate: optional(string()),
  wikiPageTitle: optional(string()),
});

export const toCreateVersionQuery = pipe(
  createVersionQuerySchema,
  transform((input: CreateVersionQuery) => {
    return objectToSnake(input);
  }),
);

export const toUpdateVersionQuery = pipe(
  partial(createVersionQuerySchema),
  transform((input) => {
    return objectToSnake(input);
  }),
);
