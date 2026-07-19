import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { UpdateMembershipQuery } from "./type.ts";
import { toUpdateMembershipQuery } from "./validator.ts";
import { assertResponse } from "../error.ts";

/**
 * Update the membership of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Membership identifier
 * @param membership Membership attributes to update it
 */
export async function update(
  context: Context,
  id: number,
  membership: UpdateMembershipQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "memberships", `${id}.json`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({
      membership: parse(toUpdateMembershipQuery, membership),
    }),
  });
  await assertResponse(response);
}
