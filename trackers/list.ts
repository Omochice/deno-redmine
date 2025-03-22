import { array, object, parse } from "jsr:@valibot/valibot@0.42.1";
import { ResultAsync } from "npm:neverthrow@8.2.0";
import { join } from "jsr:@std/url@1.0.0-rc.3";
import { type Tracker, trackerSchema } from "./type.ts";
import type { Context } from "../context.ts";
import { convertError } from "../error.ts";

const responseSchema = object({
  trackers: array(trackerSchema),
});

/**
 * Fetch trackers
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has tracker or error
 */
export const fetchList = ResultAsync.fromThrowable(
  throwableFetchList,
  convertError("Unexpected error"),
);

/**
 * Fetch trackers
 *
 * @param context REST endpoint context
 * @return Array of Tracker
 */
async function throwableFetchList(context: Context): Promise<Tracker[]> {
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
  return parse(responseSchema, await response.json()).trackers;
}
