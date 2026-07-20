import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import { type Tracker } from "./type.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";
import { listTrackerResponse } from "./validator.ts";

/**
 * Fetch trackers
 *
 * @param context REST endpoint context
 * @return Yields each Tracker
 */
export async function* list(context: Context): AsyncGenerator<Tracker> {
  const endpoint = buildUrl(context.endpoint, "trackers.json");
  const response = await fetch(
    endpoint,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    },
  );
  await assertResponse(response);
  yield* parse(listTrackerResponse, await response.json()).trackers;
}
