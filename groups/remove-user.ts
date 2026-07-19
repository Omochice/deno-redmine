import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";

/**
 * Remove a user from the group of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param groupId Group identifier
 * @param userId User identifier to remove from the group
 */
export async function removeUser(
  context: Context,
  groupId: number,
  userId: number,
): Promise<void> {
  const url = buildUrl(
    context.endpoint,
    "groups",
    `${groupId}`,
    "users",
    `${userId}.json`,
  );
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
