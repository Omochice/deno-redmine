import { Context } from "../../context.ts";
import { UpdateIssueQuery } from "./type.ts";
import { buildUrl } from "../../internal/url.ts";
import { assertResponse } from "../../error.ts";
import { parse } from "jsr:@valibot/valibot@1.4.2";
import { toUpdateRequest } from "./validator.ts";

export async function update(
  context: Context,
  id: number,
  issue: UpdateIssueQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "issues", `${id}.json`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({ issue: parse(toUpdateRequest, issue) }),
  });
  assertResponse(response);
}
