import { parse } from "jsr:@valibot/valibot@1.2.0";
import { join } from "jsr:@std/path@1.1.3/posix/join";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";
import type { CreateIssueQuery } from "./type.ts";
import { toCreateRequest } from "./validator.ts";

/**
 * Create issue
 *
 * @param context REST endpoint context
 * @return Promise of result-type
 */
export async function createIssue(
  context: Context,
  issue: CreateIssueQuery,
): Promise<void> {
  const url = join(context.endpoint, "issues.json");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify(parse(toCreateRequest, issue)),
  });
  assertResponse(response);
}
