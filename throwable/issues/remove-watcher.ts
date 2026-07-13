import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

/**
 * Removes a watcher from the issue of given id.
 *
 * @param context REST endpoint context
 * @param issueId The issue id
 * @param userId The id of the user to remove from watchers
 */
export async function removeWatcher(
  context: Context,
  issueId: number,
  userId: number,
): Promise<void> {
  const url = buildUrl(
    context.endpoint,
    "issues",
    `${issueId}`,
    "watchers",
    `${userId}.json`,
  );
  assertResponse(
    await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
  );
}
