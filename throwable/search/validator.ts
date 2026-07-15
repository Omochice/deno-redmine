import {
  nullish,
  number,
  object,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { dateLikeString, toUndefined } from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { SearchQuery, SearchResult } from "./type.ts";

export const searchResultSchema = pipe(
  object({
    id: number(),
    title: string(),
    type: string(),
    url: string(),
    // Redmine returns `null` here for results whose object has no description
    // (e.g. a project without one).
    description: pipe(nullish(string()), transform(toUndefined)),
    datetime: dateLikeString,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies SearchResult;
  }),
);

/**
 * Build the query string parameters for a search request.
 *
 * {@link search} owns pagination and sets `offset`/`limit` per page, so they
 * are not part of {@link SearchQuery}. Boolean flags follow Redmine's
 * convention of `"1"` for enabled and being omitted otherwise, except
 * `attachments`, which Redmine treats as a tri-state scope and therefore
 * serializes to `"1"`/`"0"` for booleans or passes a raw string through.
 *
 * @param query The search query
 * @returns The query parameters (pagination is added later by {@link search})
 */
export function toSearchParams(query: SearchQuery): URLSearchParams {
  const { q, attachments, ...flags } = query;
  const params = new URLSearchParams({ q });
  if (attachments !== undefined) {
    params.set(
      "attachments",
      typeof attachments === "boolean"
        ? (attachments ? "1" : "0")
        : attachments,
    );
  }
  for (const [key, value] of Object.entries(objectToSnake(flags))) {
    if (value === undefined || value === false) {
      continue;
    }
    params.set(key, value === true ? "1" : `${value}`);
  }
  return params;
}
