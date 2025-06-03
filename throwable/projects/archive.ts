import { join } from "jsr:@std/path@1.1.0/posix/join";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

/**
 * Sends a PUT request to archive or unarchive a project by ID using the specified method.
 *
 * @param id - The unique identifier of the project to be archived or unarchived.
 * @param method - The action to perform: either "archive" or "unarchive".
 *
 * @remark
 * The function constructs the request URL by appending the project ID and method as a JSON endpoint, and includes the API key for authentication.
 */
async function internal(
  context: Context,
  id: number,
  method: "archive" | "unarchive",
): Promise<void> {
  const url = new URL(
    join(context.endpoint, "projects", `${id}`, `${method}.json`),
  );
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  assertResponse(response);
}

/**
 * Archives a project by its ID via the Redmine API.
 *
 * Initiates an HTTP request to mark the specified project as archived.
 *
 * @param id - The unique identifier of the project to archive.
 */
export async function archive(context: Context, id: number): Promise<void> {
  return await internal(context, id, "archive");
}

/**
 * Restores a previously archived project by its ID.
 *
 * Initiates an HTTP request to unarchive the specified project in the remote system.
 *
 * @param id - The unique identifier of the project to unarchive.
 */
export async function unarchive(context: Context, id: number): Promise<void> {
  return await internal(context, id, "unarchive");
}
