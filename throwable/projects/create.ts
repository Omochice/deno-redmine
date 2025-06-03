import { join } from "jsr:@std/path@1.1.0/posix/join";
import type { Context } from "../../context.ts";
import type { ProjectRequest } from "./type.ts";
import { assertResponse } from "../../error.ts";

/**
 * Creates a new project by sending a POST request to the configured endpoint.
 *
 * @param project - The project data to be created.
 *
 * @remark
 * Throws an error if the HTTP response indicates failure.
 */
export async function create(
  context: Context,
  project: ProjectRequest,
): Promise<void> {
  const url = new URL(join(context.endpoint, "projects.json"));
  assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ project }),
    }),
  );
}
