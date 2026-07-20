import { array, number, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import { walkPages } from "../internal/paging.ts";
import type { Context } from "../context.ts";
import type { User } from "./type.ts";
import { userSchema } from "./validator.ts";
import { assertResponse } from "../error.ts";

const responseSchema = object({
  users: array(userSchema),
  total_count: number(),
  offset: number(),
  limit: number(),
});

/**
 * List users
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @returns Users, yielded one at a time across every page
 */
export async function* list(context: Context): AsyncGenerator<User> {
  yield* walkPages(async (limit, offset) => {
    const endpoint = buildUrl(context.endpoint, "users.json");
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${offset}`,
    }).toString();
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    });
    await assertResponse(response);
    const parsed = parse(responseSchema, await response.json());
    return { items: parsed.users, totalCount: parsed.total_count };
  }, { pageSize: 25 });
}
