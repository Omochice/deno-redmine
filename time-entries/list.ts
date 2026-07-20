import { array, number, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import { fetchAllPages } from "../internal/paging.ts";
import type { Context } from "../context.ts";
import type { ListTimeEntryQuery, TimeEntry } from "./type.ts";
import { timeEntrySchema, toListTimeEntryQuery } from "./validator.ts";
import { assertResponse } from "../error.ts";

const responseSchema = object({
  time_entries: array(timeEntrySchema),
  total_count: number(),
  offset: number(),
  limit: number(),
});

/**
 * List time entries, optionally filtered by project, user, or spent-on date range
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param filter Optional filters (projectId, spentOn, userId, from, to)
 * @returns Time entries
 */
export async function list(
  context: Context,
  filter: Partial<ListTimeEntryQuery> = {},
): Promise<TimeEntry[]> {
  const query = parse(toListTimeEntryQuery, filter);
  return await fetchAllPages(async (limit, offset) => {
    const endpoint = buildUrl(context.endpoint, "time_entries.json");
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${offset}`,
      ...query,
    }).toString();
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    });
    await assertResponse(response);
    const parsed = parse(responseSchema, await response.json());
    return { items: parsed.time_entries, totalCount: parsed.total_count };
  }, { pageSize: 25 });
}
