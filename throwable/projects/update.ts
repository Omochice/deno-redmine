import { join } from "jsr:@std/path@1.1.0/posix/join";
import type { Context } from "../../context.ts";
import type { ProjectRequest } from "./type.ts";
import { assertResponse } from "../../error.ts";

export type ProjectUpdateInformation = Partial<
  Omit<ProjectRequest, "identifier">
>;

/**
 * Updates an existing project's information via an HTTP PUT request.
 *
 * @param id - The unique identifier of the project to update.
 * @param project - Partial project data to update, excluding the identifier.
 *
 * @throws {Error} If the HTTP response indicates a failure or cannot be verified by {@link assertResponse}.
 */
export async function update(
  context: Context,
  id: number,
  project: ProjectUpdateInformation,
): Promise<void> {
  const url = new URL(join(context.endpoint, "projects", `${id}.json`));
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({ project }),
  });
  assertResponse(response);
}
