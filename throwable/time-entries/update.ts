import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { UpdateTimeEntryQuery } from "./type.ts";
import { toUpdateTimeEntryQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Update the time entry of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Time entry identifier
 * @param timeEntry Time entry attributes to update it
 */
export async function update(
  context: Context,
  id: number,
  timeEntry: UpdateTimeEntryQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "time_entries", `${id}.json`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({
      time_entry: parse(toUpdateTimeEntryQuery, timeEntry),
    }),
  });
  await assertResponse(response);
}
