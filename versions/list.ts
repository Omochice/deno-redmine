import { array, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { Version } from "./type.ts";
import { versionSchema } from "./validator.ts";
import { assertResponse } from "../error.ts";

const responseSchema = object({
  versions: array(versionSchema),
});

/**
 * List versions included in the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @returns Yields each Version
 */
export async function* list(
  context: Context,
  projectId: number,
): AsyncGenerator<Version> {
  const url = buildUrl(
    context.endpoint,
    "projects",
    `${projectId}`,
    "versions.json",
  );
  /**
   * @note Redmine returns every version of the project in a single response,
   * so no pagination is needed here unlike the projects and issues listings.
   */
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  await assertResponse(response);
  yield* parse(responseSchema, await response.json()).versions;
}
