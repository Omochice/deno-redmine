import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { Version } from "./type.ts";
import { versionSchema } from "./validator.ts";
import { assertResponse } from "../error.ts";
import { object, parse } from "jsr:@valibot/valibot@1.4.2";

const schema = object({
  version: versionSchema,
});

/**
 * Show the version of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Version identifier
 * @returns Version object
 */
export async function show(
  context: Context,
  id: number,
): Promise<Version> {
  const url = buildUrl(context.endpoint, "versions", `${id}.json`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  await assertResponse(response);
  return parse(schema, await response.json()).version;
}
