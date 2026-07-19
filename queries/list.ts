import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import { type Query } from "./type.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";
import { listQueryResponse } from "./validator.ts";

/**
 * Fetch queries
 *
 * @param context REST endpoint context
 * @return Array of Query
 */
export async function fetchList(context: Context): Promise<Query[]> {
  const endpoint = buildUrl(context.endpoint, "queries.json");
  const response = await fetch(
    endpoint,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    },
  );
  await assertResponse(response);
  return parse(listQueryResponse, await response.json()).queries;
}
