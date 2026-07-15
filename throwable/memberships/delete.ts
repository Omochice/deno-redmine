import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

/**
 * Delete the membership of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Membership identifier
 */
export async function deleteMembership(
  context: Context,
  id: number,
): Promise<void> {
  const url = buildUrl(context.endpoint, "memberships", `${id}.json`);
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
