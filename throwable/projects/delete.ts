import { join } from "jsr:@std/path@1.1.0/posix/join";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

/**
 * Deletes a project by its ID using an HTTP DELETE request.
 *
 * @param id - The unique identifier of the project to delete.
 *
 * @throws {Error} If the HTTP request fails or the response is invalid.
 */
export async function deleteProject(
  context: Context,
  id: number,
): Promise<void> {
  const url = new URL(join(context.endpoint, "projects", `${id}.json`));
  assertResponse(
    await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
  );
}
