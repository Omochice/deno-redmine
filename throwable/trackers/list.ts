import { array, object, parse } from "jsr:@valibot/valibot@1.1.0";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { type Tracker, trackerSchema } from "./type.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

const responseSchema = object({
  trackers: array(trackerSchema),
});

/**
 * Retrieves a list of trackers from the REST API.
 *
 * Sends a GET request to the endpoint specified in {@link context} and returns an array of validated {@link Tracker} objects.
 *
 * @param context - Contains the API endpoint and authentication key.
 * @returns An array of {@link Tracker} objects retrieved from the API.
 *
 * @throws {Error} If the HTTP response is not successful or the response data is invalid.
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
