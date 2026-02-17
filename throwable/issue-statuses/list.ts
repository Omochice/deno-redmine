import { parse } from "jsr:@valibot/valibot@1.2.0";
import { join } from "jsr:@std/path@1.1.4/posix/join";
import { type IssueStatus } from "./type.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";
import { listIssueStatusResponse } from "./validator.ts";

/**
 * Fetch issue statuses
 *
 * @param context REST endpoint context
 * @return Array of IssueStatus
 */
export async function fetchList(context: Context): Promise<IssueStatus[]> {
  const endpoint = new URL(join(context.endpoint, "issue_statuses.json"));
  const response = await fetch(
    endpoint,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    },
  );
  assertResponse(response);
  return parse(listIssueStatusResponse, await response.json()).issue_statuses;
}
