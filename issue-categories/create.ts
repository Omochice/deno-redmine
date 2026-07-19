import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { CreateIssueCategoryQuery } from "./type.ts";
import { toCreateIssueCategoryQuery } from "./validator.ts";
import { assertResponse } from "../error.ts";

/**
 * Create an issue category for the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param issueCategory Issue category attributes to create it
 */
export async function create(
  context: Context,
  projectId: number,
  issueCategory: CreateIssueCategoryQuery,
): Promise<void> {
  const url = buildUrl(
    context.endpoint,
    "projects",
    `${projectId}`,
    "issue_categories.json",
  );
  await assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({
        issue_category: parse(toCreateIssueCategoryQuery, issueCategory),
      }),
    }),
  );
}
