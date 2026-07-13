import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { CreateUserQuery } from "./type.ts";
import { toCreateUserQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Create a user
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param user User attributes to create it
 */
export async function create(
  context: Context,
  user: CreateUserQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "users.json");
  assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ user: parse(toCreateUserQuery, user) }),
    }),
  );
}
