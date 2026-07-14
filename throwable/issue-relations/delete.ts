import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

/**
 * Delete the relation of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Relation identifier
 */
export async function deleteRelation(
  context: Context,
  id: number,
): Promise<void> {
  const url = buildUrl(context.endpoint, "relations", `${id}.json`);
  assertResponse(
    await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
  );
}
