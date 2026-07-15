import { array, number, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { SearchQuery, SearchResult } from "./type.ts";
import { searchResultSchema, toSearchParams } from "./validator.ts";
import { assertResponse } from "../../error.ts";

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
  const limit = 25;
  const opts: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  };
  const base = toSearchParams(query);
  const n = await fetchNumberOfResults(context, base, opts);
  const promises: Promise<Response>[] = [];
  for (let i = 0; i < n; i += limit) {
    const endpoint = buildUrl(context.endpoint, "search.json");
    const params = new URLSearchParams(base);
    params.set("limit", `${limit}`);
    params.set("offset", `${i}`);
    endpoint.search = params.toString();
    promises.push(fetch(endpoint, opts));
  }
  const responses = await Promise.all(promises);
  const results: SearchResult[][] = [];
  for (const response of responses) {
    await assertResponse(response);
    results.push(parse(responseSchema, await response.json()).results);
  }
  return results.flat();
}

async function fetchNumberOfResults(
  context: Context,
  base: URLSearchParams,
  opts: RequestInit,
): Promise<number> {
  const endpoint = buildUrl(context.endpoint, "search.json");
  const params = new URLSearchParams(base);
  params.set("limit", "1");
  params.set("offset", "0");
  endpoint.search = params.toString();

  const response = await fetch(endpoint, opts);
  await assertResponse(response);
  return parse(responseSchema, await response.json()).total_count;
}
