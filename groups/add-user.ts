import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";

/**
 * Add a user to the group of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param groupId Group identifier
 * @param userId User identifier to add to the group
 */
export async function addUser(
  context: Context,
  groupId: number,
  userId: number,
): Promise<void> {
  const url = buildUrl(context.endpoint, "groups", `${groupId}`, "users.json");
  await assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ user_id: userId }),
    }),
  );
}
