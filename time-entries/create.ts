import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { CreateTimeEntryQuery } from "./type.ts";
import { toCreateTimeEntryQuery } from "./validator.ts";
import { assertResponse } from "../error.ts";

/**
 * Create a time entry
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param timeEntry Time entry attributes to create it
 */
export async function create(
  context: Context,
  timeEntry: CreateTimeEntryQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "time_entries.json");
  await assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({
        time_entry: parse(toCreateTimeEntryQuery, timeEntry),
      }),
    }),
  );
}
