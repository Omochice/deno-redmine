import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";

/**
 * Delete the group of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Group identifier
 */
export async function deleteGroup(
  context: Context,
  id: number,
): Promise<void> {
  const url = buildUrl(context.endpoint, "groups", `${id}.json`);
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
