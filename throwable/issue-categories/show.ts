import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { IssueCategory } from "./type.ts";
import { issueCategorySchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";
import { object, parse } from "jsr:@valibot/valibot@1.4.2";

const schema = object({
  issue_category: issueCategorySchema,
});

/**
 * Show the issue category of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Issue category identifier
 * @returns Issue category object
 */
export async function show(
  context: Context,
  id: number,
): Promise<IssueCategory> {
  const url = buildUrl(context.endpoint, "issue_categories", `${id}.json`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  await assertResponse(response);
  return parse(schema, await response.json()).issue_category;
}
