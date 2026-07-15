import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { News } from "./type.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";
import { listNewsResponse } from "./validator.ts";

/**
 * Fetch news of the given project
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @return Array of News
 */
export async function fetchListByProject(
  context: Context,
  projectId: number,
): Promise<News[]> {
  const endpoint = buildUrl(
    context.endpoint,
    "projects",
    `${projectId}`,
    "news.json",
  );
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
