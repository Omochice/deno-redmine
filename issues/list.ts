import type { Context } from "../context.ts";
import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import { walkPages } from "../internal/paging.ts";
import type { ListIssue, ListIssueQuery } from "./type.ts";
import { assertResponse } from "../error.ts";
import { listResponse, toListOption } from "./validator.ts";

const pageSize = 100;

export async function* list(
  context: Context,
  option: Partial<ListIssueQuery> = {},
): AsyncGenerator<ListIssue> {
  const convertedOption = parse(toListOption, option);

  // A requested limit selects the helper's over-fetch-avoiding path, which
  // walks sequentially and skips the total_count probe; without one the helper
  // probes the count and walks the remaining pages with bounded parallelism.
  yield* walkPages(async (limit, offset) => {
    const endpoint = buildUrl(context.endpoint, "issues.json");
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${offset}`,
      ...convertedOption,
    }).toString();
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    });
    await assertResponse(response);
    const parsed = parse(listResponse, await response.json());
    return { items: parsed.issues, totalCount: parsed.totalCount };
  }, { pageSize, limit: option.limit });
}
