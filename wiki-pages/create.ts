import { Context } from "../context.ts";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { ResultAsync } from "npm:neverthrow@8.2.0";
import { assertResponse, convertError } from "../error.ts";
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
export async function createWithError(
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

/**
 * Create a wiki page in the project
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param wiki Wiki page object
 */
export const create = ResultAsync.fromThrowable(
  createWithError,
  convertError("unknown error create a wiki page"),
);
