import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { UpdateJournalQuery } from "./type.ts";
import { toUpdateJournalQuery } from "./validator.ts";
import { assertResponse } from "../error.ts";

/**
 * Update the note of the journal of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Journal identifier
 * @param journal Journal attributes to update it
 */
export async function update(
  context: Context,
  id: number,
  journal: UpdateJournalQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "journals", `${id}.json`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({
      journal: parse(toUpdateJournalQuery, journal),
    }),
  });
  await assertResponse(response);
}
