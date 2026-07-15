import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { User } from "./type.ts";
import { userSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";
import { object, parse } from "jsr:@valibot/valibot@1.4.2";

const schema = object({
  user: userSchema,
});

/**
 * Show the user of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id User identifier
 * @returns User object
 */
export async function show(
  context: Context,
  id: number,
): Promise<User> {
  const url = buildUrl(context.endpoint, "users", `${id}.json`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  await assertResponse(response);
  return parse(schema, await response.json()).user;
}
