import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { ShowNews } from "./type.ts";
import { showNewsResponse } from "./validator.ts";
import { assertResponse } from "../error.ts";

export type Include = "attachments" | "comments";

/**
 * Show the news of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id News identifier
 * @param includes Associations to include in the response
 * @returns News object
 */
export async function show(
  context: Context,
  id: number,
  includes?: Include[],
): Promise<ShowNews> {
  const url = buildUrl(context.endpoint, "news", `${id}.json`);
  if (includes !== undefined) {
    url.search = new URLSearchParams({ include: includes.join(",") })
      .toString();
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  await assertResponse(response);
  return parse(showNewsResponse, await response.json()).news;
}
