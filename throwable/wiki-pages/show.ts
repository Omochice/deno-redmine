import { Context } from "../../context.ts";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { assertResponse } from "../../error.ts";
import { parse } from "jsr:@valibot/valibot@1.1.0";
import { sanitizeTitle, type WikiDetail } from "./type.ts";
import { wikiDetail } from "./validator.ts";

/**
 * Retrieves a wiki page from a project, optionally for a specific version.
 *
 * @param projectId - Numeric identifier of the project containing the wiki page.
 * @param title - Title of the wiki page to fetch.
 * @param version - Optional version number of the wiki page to retrieve.
 * @returns A promise resolving to the validated wiki page details.
 *
 * @throws {Error} If the HTTP request fails or the response is invalid.
 */
export async function show(
  context: Context,
  projectId: number,
  title: string,
  version?: number,
): Promise<WikiDetail> {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  } as const satisfies RequestInit;
  const url = new URL(
    version == null
      ? join(
        context.endpoint,
        "projects",
        `${projectId}`,
        "wiki",
        `${sanitizeTitle(title)}.json`,
      )
      : join(
        context.endpoint,
        "projects",
        `${projectId}`,
        "wiki",
        sanitizeTitle(title),
        `${version}.json`,
      ),
  );

  const r = await fetch(url, opts);
  assertResponse(r);
  return parse(wikiDetail, await r.json());
}
