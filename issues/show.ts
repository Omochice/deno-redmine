import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import { toUniqueArray } from "../internal/array.ts";
import type { ShowIssue } from "./type.ts";
import { showIssueSchema } from "./validator.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";

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
  includes?: Include | [Include, ...Include[]],
): Promise<ShowIssue> {
  const url = buildUrl(context.endpoint, "issues", `${id}.json`);
  if (includes !== undefined) {
    const values = toUniqueArray(includes);
    url.search = new URLSearchParams({ include: values.join(",") })
      .toString();
  }
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  await assertResponse(response);
  return parse(showIssueSchema, await response.json()).issue;
}
