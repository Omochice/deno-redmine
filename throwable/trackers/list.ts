import { array, object, parse } from "jsr:@valibot/valibot@1.1.0";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { type Tracker, trackerSchema } from "./type.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

const responseSchema = object({
  trackers: array(trackerSchema),
});

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
  return parse(responseSchema, await response.json()).trackers;
}
