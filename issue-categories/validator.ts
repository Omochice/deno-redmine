import {
  nullish,
  number,
  object,
  optional,
  partial,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { idName, toUndefined } from "../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { IssueCategory } from "./type.ts";

export const issueCategorySchema = pipe(
  object({
    id: number(),
    project: idName,
    name: string(),
    assigned_to: pipe(nullish(idName), transform(toUndefined)),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies IssueCategory;
  }),
);

const createIssueCategoryQuerySchema = object({
  name: string(),
  assignedToId: optional(number()),
});

export const toCreateIssueCategoryQuery = pipe(
  createIssueCategoryQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);

export const toUpdateIssueCategoryQuery = pipe(
  partial(createIssueCategoryQuerySchema),
  transform((input) => {
    return objectToSnake(input);
  }),
);
