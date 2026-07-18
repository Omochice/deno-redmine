import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { CreateNewsQuery } from "./type.ts";
import { toCreateNewsQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Create a news for the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param news News attributes to create it
 */
export async function create(
  context: Context,
  projectId: number,
  news: CreateNewsQuery,
): Promise<void> {
  const url = buildUrl(
    context.endpoint,
    "projects",
    `${projectId}`,
    "news.json",
  );
  await assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({
        news: parse(toCreateNewsQuery, news),
      }),
    }),
  );
}
