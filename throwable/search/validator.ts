import {
  number,
  object,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { dateLikeString } from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { SearchQuery, SearchResult } from "./type.ts";

export const searchResultSchema = pipe(
  object({
    id: number(),
    title: string(),
    type: string(),
    url: string(),
    description: string(),
    datetime: dateLikeString,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies SearchResult;
  }),
);

/**
 * Build the query string parameters for a search request.
 *
 * The pagination controls (`offset`, `limit`) are excluded because
 * {@link search} owns pagination and sets them per page. Boolean flags follow
 * Redmine's convention of `"1"` for enabled and being omitted otherwise, except
 * `attachments`, which Redmine treats as a tri-state scope and therefore
 * serializes to `"1"`/`"0"` for booleans or passes a raw string through.
 *
 * @param query The search query
 * @returns The query parameters without `offset`/`limit`
 */
export function toSearchParams(query: SearchQuery): URLSearchParams {
  const { q, offset: _offset, limit: _limit, attachments, ...flags } = query;
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
