import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";

/**
 * Delete the issue of given id.
 *
 * @param context REST endpoint context
 * @param id The issue id
 */
export async function deleteIssue(
  context: Context,
  id: number,
): Promise<void> {
  const url = buildUrl(context.endpoint, "issues", `${id}.json`);
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
