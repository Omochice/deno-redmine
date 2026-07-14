import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

/**
 * Delete the issue category of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Issue category identifier
 * @param reassignToId Identifier of the category issues currently assigned
 * to this category should be reassigned to; when omitted, Redmine clears
 * the category from those issues instead
 */
export async function deleteIssueCategory(
  context: Context,
  id: number,
  reassignToId?: number,
): Promise<void> {
  const url = buildUrl(context.endpoint, "issue_categories", `${id}.json`);
  if (reassignToId !== undefined) {
    url.searchParams.set("reassign_to_id", `${reassignToId}`);
  }
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
