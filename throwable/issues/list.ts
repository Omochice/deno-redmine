import type { Context } from "../../context.ts";
import { parse } from "jsr:@valibot/valibot@1.2.0";
import { join } from "jsr:@std/path@1.1.3/posix/join";
import type { Issue, ListIssueQuery } from "./type.ts";
import { assertResponse } from "../../error.ts";
import { listResponse, toListOption } from "./validator.ts";

export async function listIssues(
  context: Context,
  option: Partial<ListIssueQuery> = {},
): Promise<Issue[]> {
  const limit = 100;
  const opts: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  };
  const convertedOption = parse(toListOption, option);
  const n = await fetchNumberOfIssues(context, option);
  const results: Response[] = [];
  for (let offset = 0; offset < n; offset += limit) {
    const endpoint = new URL(join(context.endpoint, "issues.json"));
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${offset}`,
      ...convertedOption,
    }).toString();
    const response = await fetch(endpoint, opts);
    assertResponse(response);
    results.push(response);
  }
  const issues: Issue[] = [];
  for (const response of results) {
    const json = await response.json();
    const parsed = parse(listResponse, json);
    issues.push(...parsed.issues);
  }
  return issues;
}

async function fetchNumberOfIssues(
  context: Context,
  option: Partial<ListIssueQuery>,
): Promise<number> {
  const endpoint = new URL(join(context.endpoint, "issues.json"));
  endpoint.search = new URLSearchParams({
    limit: "1",
    offset: "0",
    ...parse(toListOption, option),
  }).toString();

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  assertResponse(response);
  return parse(listResponse, await response.json()).totalCount;
}
