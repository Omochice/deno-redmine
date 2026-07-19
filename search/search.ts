import { array, number, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import { fetchAllPages } from "../internal/paging.ts";
import type { Context } from "../context.ts";
import type { SearchQuery, SearchResult } from "./type.ts";
import { searchResultSchema, toSearchParams } from "./validator.ts";
import { assertResponse } from "../error.ts";

const responseSchema = object({
  results: array(searchResultSchema),
  total_count: number(),
  offset: number(),
  limit: number(),
});

/**
 * Search across the resources indexed by Redmine.
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param query The search query, whose only required field is `q`
 * @returns Search results across every page
 */
export async function search(
  context: Context,
  query: SearchQuery,
): Promise<SearchResult[]> {
  const base = toSearchParams(query);
  return await fetchAllPages(async (limit, offset) => {
    const endpoint = buildUrl(context.endpoint, "search.json");
    const params = new URLSearchParams(base);
    params.set("limit", `${limit}`);
    params.set("offset", `${offset}`);
    endpoint.search = params.toString();
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    });
    await assertResponse(response);
    const parsed = parse(responseSchema, await response.json());
    return { items: parsed.results, totalCount: parsed.total_count };
  }, { pageSize: 25 });
}
