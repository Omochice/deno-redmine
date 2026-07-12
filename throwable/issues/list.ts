import type { Context } from "../../context.ts";
import { parse } from "jsr:@valibot/valibot@1.4.2";
import { join } from "jsr:@std/path@1.1.6/posix/join";
import type { Issue, ListIssueQuery } from "./type.ts";
import { assertResponse } from "../../error.ts";
import { listResponse, toListOption } from "./validator.ts";

const pageSize = 100;

export async function listIssues(
  context: Context,
  option: Partial<ListIssueQuery> = {},
): Promise<Issue[]> {
  const opts: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  };
  const convertedOption = parse(toListOption, option);

  const fetchPage = async (limit: number, offset: number): Promise<Issue[]> => {
    const endpoint = new URL(join(context.endpoint, "issues.json"));
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${offset}`,
      ...convertedOption,
    }).toString();
    const response = await fetch(endpoint, opts);
    assertResponse(response);
    const json = await response.json();
    return parse(listResponse, json).issues;
  };

  // When a limit is requested, the caller does not care about the server's
  // total_count, so the extra count request that the unbounded path needs
  // (to know how many pages to walk) is unnecessary and would over-fetch.
  if (option.limit !== undefined) {
    const limit = option.limit;
    const issues: Issue[] = [];
    let offset = 0;
    while (issues.length < limit) {
      const fetchSize = Math.min(pageSize, limit - issues.length);
      const page = await fetchPage(fetchSize, offset);
      issues.push(...page);
      offset += fetchSize;
      if (page.length < fetchSize) {
        // Server ran out of issues before reaching the requested limit.
        break;
      }
    }
    return issues.slice(0, limit);
  }

  const n = await fetchNumberOfIssues(context, option);
  const issues: Issue[] = [];
  for (let offset = 0; offset < n; offset += pageSize) {
    issues.push(...await fetchPage(pageSize, offset));
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
