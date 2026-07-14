import {
  array,
  number,
  object,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import type { News } from "./type.ts";
import { dateLikeString, idName } from "../../internal/validator.ts";
import { objectToCamel } from "npm:ts-case-convert@2.3.1";

const newsSchema = pipe(
  object({
    id: number(),
    project: idName,
    author: idName,
    title: string(),
    summary: string(),
    description: string(),
    created_on: dateLikeString,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies News;
  }),
);

export const listNewsResponse = object({
  news: array(newsSchema),
});
