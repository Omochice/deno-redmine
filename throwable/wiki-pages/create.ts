import { Context } from "../../context.ts";
import { join } from "jsr:@std/path@1.1.4/posix/join";
import { assertResponse } from "../../error.ts";
import { makeWikiPutRequest } from "./validator.ts";
import { sanitizeTitle, type WikiContent } from "./type.ts";

/**
 * Create a wiki page in the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param wiki Wiki page object
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
