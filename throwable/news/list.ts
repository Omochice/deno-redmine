import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { News } from "./type.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";
import { listNewsResponse } from "./validator.ts";

/**
 * Fetch news across all projects
 *
 * @param context REST endpoint context
 * @return Array of News
 */
export async function fetchList(context: Context): Promise<News[]> {
  const endpoint = buildUrl(context.endpoint, "news.json");
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
  return parse(listNewsResponse, await response.json()).news;
}
