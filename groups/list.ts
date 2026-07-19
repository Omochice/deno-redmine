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
 * @returns Groups as id/name pairs
 */
export async function fetchList(context: Context): Promise<IdName[]> {
  const url = buildUrl(context.endpoint, "groups.json");
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  await assertResponse(response);
  return parse(responseSchema, await response.json()).groups;
}
