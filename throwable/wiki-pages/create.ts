import { Context } from "../../context.ts";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { assertResponse } from "../../error.ts";
import { makeWikiPutRequest } from "./validator.ts";
import { sanitizeTitle, type WikiContent } from "./type.ts";

/**
 * Creates a wiki page within the specified project via the REST API.
 *
 * @param projectId - Numeric identifier of the project in which to create the wiki page.
 * @param wiki - Object representing the content and metadata of the wiki page.
 *
 * @throws {Error} If the HTTP request fails or the response is not successful.
 */
export async function create(
  context: Context,
  projectId: number,
  wiki: WikiContent,
): Promise<void> {
  const body = makeWikiPutRequest(wiki);
  const opts = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify(body),
  } as const satisfies RequestInit;
  const url = new URL(
    join(
      context.endpoint,
      "projects",
      `${projectId}`,
      "wiki",
      `${sanitizeTitle(wiki.title)}.json`,
    ),
  );
  assertResponse(await fetch(url, opts));
}
