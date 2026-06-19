import { array, number, object, parse } from "jsr:@valibot/valibot@1.2.0";
import { join } from "jsr:@std/path@1.1.4/posix/join";
import type { Version } from "./type.ts";
import { versionSchema } from "./validator.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

const responseSchema = object({
  versions: array(versionSchema),
  total_count: number(),
});

/**
 * Returns the versions available for the project of given id or identifier.
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @returns Versions list
 */
export async function fetchList(
  context: Context,
  projectId: number,
): Promise<Version[]> {
  const url = new URL(
    join(context.endpoint, "projects", `${projectId}`, "versions.json"),
  );
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  assertResponse(response);
  return parse(responseSchema, await response.json()).versions;
}
