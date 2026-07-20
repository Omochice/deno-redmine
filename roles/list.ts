import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { IdName } from "../internal/type.ts";
import { roleListResponse } from "./validator.ts";
import { assertResponse } from "../error.ts";

/**
 * Fetch roles
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @returns Yields each role as an id/name pair
 */
export async function* list(context: Context): AsyncGenerator<IdName> {
  const url = buildUrl(context.endpoint, "roles.json");
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  await assertResponse(response);
  yield* parse(roleListResponse, await response.json()).roles;
}
