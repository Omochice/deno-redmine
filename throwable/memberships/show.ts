import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { Membership } from "./type.ts";
import { membershipSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";
import { object, parse } from "jsr:@valibot/valibot@1.4.2";

const schema = object({
  membership: membershipSchema,
});

/**
 * Show the membership of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Membership identifier
 * @returns Membership object
 */
export async function show(
  context: Context,
  id: number,
): Promise<Membership> {
  const url = buildUrl(context.endpoint, "memberships", `${id}.json`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  await assertResponse(response);
  return parse(schema, await response.json()).membership;
}
