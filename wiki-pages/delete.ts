import { Context } from "../context.ts";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { ResultAsync } from "npm:neverthrow@8.2.0";
import { assertResponse, convertError } from "../error.ts";
import { sanitizeTitle } from "./type.ts";

/**
 * Delete a wiki page in the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param title Title for wiki page
 */
export async function deleteWikiWithError(
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

/**
 * Delete a wiki page in the project
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param title Title for wiki page
 */
export const deleteWiki = ResultAsync.fromThrowable(
  deleteWikiWithError,
  convertError("unknown error delete a wiki page"),
);
