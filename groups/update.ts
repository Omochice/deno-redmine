import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { UpdateGroupQuery } from "./type.ts";
import { toUpdateGroupQuery } from "./validator.ts";
import { assertResponse } from "../error.ts";

/**
 * Update the group of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Group identifier
 * @param group Group attributes to update it
 */
export async function update(
  context: Context,
  id: number,
  group: UpdateGroupQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "groups", `${id}.json`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({ group: parse(toUpdateGroupQuery, group) }),
  });
  await assertResponse(response);
}
