import { Context } from "../../context.ts";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { assertResponse } from "../../error.ts";
import { sanitizeTitle } from "./type.ts";

/**
 * Deletes a wiki page from the specified project.
 *
 * Removes the wiki page identified by {@link title} from the project with the given {@link projectId} using the REST API.
 *
 * @param projectId - The unique identifier of the project containing the wiki page.
 * @param title - The title of the wiki page to delete.
 *
 * @throws {Error} If the HTTP request fails or the response indicates an unsuccessful deletion.
 */
export async function deleteWiki(
  context: Context,
  projectId: number,
  title: string,
): Promise<void> {
  const opts = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  } as const satisfies RequestInit;
  const url = new URL(
    join(
      context.endpoint,
      "projects",
      `${projectId}`,
      "wiki",
      `${sanitizeTitle(title)}.json`,
    ),
  );
  assertResponse(await fetch(url, opts));
}
