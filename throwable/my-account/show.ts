import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { MyAccount } from "./type.ts";
import { myAccountSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";
import { object, parse } from "jsr:@valibot/valibot@1.4.2";

const schema = object({
  user: myAccountSchema,
});

/**
 * Show the authenticated user's account
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @returns MyAccount object
 */
export async function show(
  context: Context,
): Promise<MyAccount> {
  const url = buildUrl(context.endpoint, "my", "account.json");
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
