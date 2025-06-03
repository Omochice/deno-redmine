import { object, parse } from "jsr:@valibot/valibot@1.1.0";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { ShowIssue, showIssueSchema } from "./type.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

const schema = object({
  issue: showIssueSchema,
});

export type Include =
  | "children"
  | "attachments"
  | "relations"
  | "changesets"
  | "journals"
  | "watchers"
  | "allowed_statuses";

export async function show(
  context: Context,
  id: number,
  includes?: Include[],
): Promise<ShowIssue> {
  const url = new URL(join(context.endpoint, "issues", `${id}.json`));
  if (includes !== undefined) {
    url.search = new URLSearchParams({ include: includes.join(",") })
      .toString();
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  assertResponse(response);
  return parse(schema, await response.json()).issue;
}
