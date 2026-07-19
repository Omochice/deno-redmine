import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { UpdateUserQuery } from "./type.ts";
import { toUpdateUserQuery } from "./validator.ts";
import { assertResponse } from "../error.ts";

/**
 * Update the user of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id User identifier
 * @param user User attributes to update it
 */
export async function update(
  context: Context,
  id: number,
  user: UpdateUserQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "users", `${id}.json`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({ user: parse(toUpdateUserQuery, user) }),
  });
  await assertResponse(response);
}
