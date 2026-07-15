import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { CreateGroupQuery } from "./type.ts";
import { toCreateGroupQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Create a group
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param group Group attributes to create it
 */
export async function create(
  context: Context,
  group: CreateGroupQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "groups.json");
  await assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ group: parse(toCreateGroupQuery, group) }),
    }),
  );
}
