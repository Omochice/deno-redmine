import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { UpdateNewsQuery } from "./type.ts";
import { toUpdateNewsQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Update the news of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id News identifier
 * @param news News attributes to update it
 */
export async function update(
  context: Context,
  id: number,
  news: UpdateNewsQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "news", `${id}.json`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({
      news: parse(toUpdateNewsQuery, news),
    }),
  });
  await assertResponse(response);
}
