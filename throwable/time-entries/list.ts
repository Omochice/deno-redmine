import { array, number, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { ListTimeEntryQuery, TimeEntry } from "./type.ts";
import { timeEntrySchema, toListTimeEntryQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

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
export async function fetchList(
  context: Context,
  filter: Partial<ListTimeEntryQuery> = {},
): Promise<TimeEntry[]> {
  const limit = 25;
  const query = parse(toListTimeEntryQuery, filter);
  const opts: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  };
  const n = await fetchNumberOfTimeEntries(context, query);
  const promises: Promise<Response>[] = [];
  for (let i = 0; i < n; i += limit) {
    const endpoint = buildUrl(context.endpoint, "time_entries.json");
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${i}`,
      ...query,
    }).toString();
    promises.push(fetch(endpoint, opts));
  }
  const responses = await Promise.all(promises);
  const results: TimeEntry[][] = [];
  for (const response of responses) {
    await assertResponse(response);
    results.push(parse(responseSchema, await response.json()).time_entries);
  }
  return results.flat();
}

async function fetchNumberOfTimeEntries(
  context: Context,
  query: Record<string, string>,
): Promise<number> {
  const endpoint = buildUrl(context.endpoint, "time_entries.json");
  endpoint.search = new URLSearchParams({
    limit: "1",
    offset: "0",
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
  return parse(responseSchema, await response.json()).total_count;
}
