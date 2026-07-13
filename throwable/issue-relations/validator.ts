import {
  nullish,
  number,
  object,
  optional,
  picklist,
  pipe,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { toUndefined } from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { Relation } from "./type.ts";

const relationTypeValues = [
  "relates",
  "duplicates",
  "duplicated",
  "blocks",
  "blocked",
  "precedes",
  "follows",
  "copied_to",
  "copied_from",
] as const;

export const relationSchema = pipe(
  object({
    id: number(),
    issue_id: number(),
    issue_to_id: number(),
    relation_type: picklist(relationTypeValues),
    delay: pipe(nullish(number()), transform(toUndefined)),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Relation;
  }),
);

const createRelationQuerySchema = object({
  issueToId: number(),
  relationType: picklist(relationTypeValues),
  delay: optional(number()),
});

export const toCreateRelationQuery = pipe(
  createRelationQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);
