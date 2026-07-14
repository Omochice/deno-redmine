import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { UpdateMyAccountQuery } from "./type.ts";
import { toUpdateMyAccountQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Update the authenticated user's account
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param account Account attributes to update it
 */
export async function update(
  context: Context,
  account: UpdateMyAccountQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "my", "account.json");
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({ user: parse(toUpdateMyAccountQuery, account) }),
  });
  assertResponse(response);
}
