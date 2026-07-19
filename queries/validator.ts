import {
  array,
  boolean,
  nullish,
  number,
  object,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { Query } from "./type.ts";
import { toUndefined } from "../internal/validator.ts";
import { objectToCamel } from "npm:ts-case-convert@2.3.1";

const querySchema = pipe(
  object({
    id: number(),
    name: string(),
    is_public: boolean(),
    // Global queries have no associated project, so Redmine returns
    // `project_id: null` for them.
    project_id: pipe(nullish(number()), transform(toUndefined)),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Query;
  }),
);

export const listQueryResponse = object({
  queries: array(querySchema),
});
