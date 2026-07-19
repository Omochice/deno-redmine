import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { TimeEntry } from "./type.ts";
import { timeEntrySchema } from "./validator.ts";
import { assertResponse } from "../error.ts";
import { object, parse } from "jsr:@valibot/valibot@1.4.2";

const schema = object({
  time_entry: timeEntrySchema,
});

/**
 * Show the time entry of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Time entry identifier
 * @returns Time entry object
 */
export async function show(
  context: Context,
  id: number,
): Promise<TimeEntry> {
  const url = buildUrl(context.endpoint, "time_entries", `${id}.json`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  await assertResponse(response);
  return parse(schema, await response.json()).time_entry;
}
