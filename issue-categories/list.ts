import { array, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { IssueCategory } from "./type.ts";
import { issueCategorySchema } from "./validator.ts";
import { assertResponse } from "../error.ts";

const responseSchema = object({
  issue_categories: array(issueCategorySchema),
});

/**
 * List issue categories included in the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @returns Issue categories
 */
export async function list(
  context: Context,
  projectId: number,
): Promise<IssueCategory[]> {
  const url = buildUrl(
    context.endpoint,
    "projects",
    `${projectId}`,
    "issue_categories.json",
  );
  /**
   * @note Redmine returns every issue category of the project in a single
   * response, so no pagination is needed here unlike the projects and
   * issues listings.
   */
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  await assertResponse(response);
  return parse(responseSchema, await response.json()).issue_categories;
}
