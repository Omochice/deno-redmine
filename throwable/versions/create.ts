import { join } from "jsr:@std/path@1.1.4/posix/join";
import type { Context } from "../../context.ts";
import type { VersionQuery } from "./type.ts";
import { assertResponse } from "../../error.ts";
import { objectToSnake } from "npm:ts-case-convert@2.1.0";

/**
 * Creates a version for the project of given id.
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param version Version parameters
 */
export async function create(
  context: Context,
  projectId: number,
  version: VersionQuery,
): Promise<void> {
  const url = new URL(
    join(context.endpoint, "projects", `${projectId}`, "versions.json"),
  );
  assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ version: objectToSnake(version) }),
    }),
  );
}
