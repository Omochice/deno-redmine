import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { Relation } from "./type.ts";
import { relationSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";
import { object, parse } from "jsr:@valibot/valibot@1.4.2";

const schema = object({
  relation: relationSchema,
});

/**
 * Show the relation of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Relation identifier
 * @returns Relation object
 */
export async function show(
  context: Context,
  id: number,
): Promise<Relation> {
  const url = buildUrl(context.endpoint, "relations", `${id}.json`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  await assertResponse(response);
  return parse(schema, await response.json()).relation;
}
