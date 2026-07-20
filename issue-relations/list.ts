import { array, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { Relation } from "./type.ts";
import { relationSchema } from "./validator.ts";
import { assertResponse } from "../error.ts";

const responseSchema = object({
  relations: array(relationSchema),
});

/**
 * List relations of the issue
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param issueId Issue identifier
 * @returns Yields each Relation
 */
export async function* list(
  context: Context,
  issueId: number,
): AsyncGenerator<Relation> {
  const url = buildUrl(
    context.endpoint,
    "issues",
    `${issueId}`,
    "relations.json",
  );
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  await assertResponse(response);
  yield* parse(responseSchema, await response.json()).relations;
}
