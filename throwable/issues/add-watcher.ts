import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

/**
 * Adds a watcher to the issue of given id.
 *
 * @param context REST endpoint context
 * @param issueId The issue id
 * @param userId The id of the user to add as a watcher
 */
export async function addWatcher(
  context: Context,
  issueId: number,
  userId: number,
): Promise<void> {
  const url = buildUrl(
    context.endpoint,
    "issues",
    `${issueId}`,
    "watchers.json",
  );
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({ user_id: userId }),
  });
  await assertResponse(response);
}
