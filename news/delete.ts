import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";

/**
 * Delete the news of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id News identifier
 */
export async function deleteNews(
  context: Context,
  id: number,
): Promise<void> {
  const url = buildUrl(context.endpoint, "news", `${id}.json`);
  await assertResponse(
    await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
  );
}
