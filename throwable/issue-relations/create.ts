import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { CreateRelationQuery } from "./type.ts";
import { toCreateRelationQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Create a relation from the issue
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param issueId Issue identifier
 * @param relation Relation attributes to create it
 */
export async function create(
  context: Context,
  issueId: number,
  relation: CreateRelationQuery,
): Promise<void> {
  const url = buildUrl(
    context.endpoint,
    "issues",
    `${issueId}`,
    "relations.json",
  );
  await assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({
        relation: parse(toCreateRelationQuery, relation),
      }),
    }),
  );
}
