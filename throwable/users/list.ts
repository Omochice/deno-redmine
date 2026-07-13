import { array, number, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { User } from "./type.ts";
import { userSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";

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
 * @returns Users
 */
export async function fetchList(context: Context): Promise<User[]> {
  const limit = 25;
  const opts: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  };
  const n = await fetchNumberOfUsers(context);
  const promises: Promise<Response>[] = [];
  for (let i = 0; i < n; i += limit) {
    const endpoint = buildUrl(context.endpoint, "users.json");
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${i}`,
    }).toString();
    promises.push(fetch(endpoint, opts));
  }
  const responses = await Promise.all(promises);
  const results: User[][] = [];
  for (const response of responses) {
    assertResponse(response);
    results.push(parse(responseSchema, await response.json()).users);
  }
  return results.flat();
}

async function fetchNumberOfUsers(context: Context): Promise<number> {
  const endpoint = buildUrl(context.endpoint, "users.json");
  endpoint.search = new URLSearchParams({
    limit: "1",
    offset: "0",
  }).toString();

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  assertResponse(response);
  return parse(responseSchema, await response.json()).total_count;
}
