import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { UpdateIssueCategoryQuery } from "./type.ts";
import { toUpdateIssueCategoryQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Update the issue category of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Issue category identifier
 * @param issueCategory Issue category attributes to update it
 */
export async function update(
  context: Context,
  id: number,
  issueCategory: UpdateIssueCategoryQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "issue_categories", `${id}.json`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({
      issue_category: parse(toUpdateIssueCategoryQuery, issueCategory),
    }),
  });
  await assertResponse(response);
}
