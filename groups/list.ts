import { array, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { IdName } from "../internal/type.ts";
import { idName } from "../internal/validator.ts";
import { assertResponse } from "../error.ts";

const responseSchema = object({
  groups: array(idName),
});

/**
 * List all groups
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @returns Yields each group as an id/name pair
 */
export async function* list(context: Context): AsyncGenerator<IdName> {
  const url = buildUrl(context.endpoint, "groups.json");
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  await assertResponse(response);
  yield* parse(responseSchema, await response.json()).groups;
}
