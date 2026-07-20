import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import { type IssueStatus } from "./type.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";
import { listIssueStatusResponse } from "./validator.ts";

/**
 * Fetch issue statuses
 *
 * @param context REST endpoint context
 * @return Yields each IssueStatus
 */
export async function* list(context: Context): AsyncGenerator<IssueStatus> {
  const endpoint = buildUrl(context.endpoint, "issue_statuses.json");
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
  await assertResponse(response);
  yield* parse(listIssueStatusResponse, await response.json()).issue_statuses;
}
