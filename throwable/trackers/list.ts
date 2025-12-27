import { parse } from "jsr:@valibot/valibot@1.2.0";
import { join } from "jsr:@std/path@1.1.4/posix/join";
import { type Tracker } from "./type.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";
import { listTrackerResponse } from "./validator.ts";

/**
 * Fetch trackers
 *
 * @param context REST endpoint context
 * @return Array of Tracker
 */
export async function fetchList(context: Context): Promise<Tracker[]> {
  const endpoint = join(context.endpoint, "trackers.json");
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
  assertResponse(response);
  return parse(listTrackerResponse, await response.json()).trackers;
}
