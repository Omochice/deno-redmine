import { object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { Group } from "./type.ts";
import { groupSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";

const schema = object({
  group: groupSchema,
});

/**
 * Show the group of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Group identifier
 * @returns Group object
 */
export async function show(
  context: Context,
  id: number,
): Promise<Group> {
  const url = buildUrl(context.endpoint, "groups", `${id}.json`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  assertResponse(response);
  return parse(schema, await response.json()).group;
}
