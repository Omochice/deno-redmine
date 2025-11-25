import { Context } from "../../context.ts";
import { UpdateIssueQuery } from "./type.ts";
import { join } from "jsr:@std/path@1.1.3/posix/join";
import { assertResponse } from "../../error.ts";
import { parse } from "jsr:@valibot/valibot@1.2.0";
import { toUpdateRequest } from "./validator.ts";

export async function update(
  context: Context,
  id: number,
  issue: UpdateIssueQuery,
): Promise<void> {
  const url = new URL(join(context.endpoint, "issues", `${id}.json`));
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
