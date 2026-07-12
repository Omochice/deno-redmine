import { Context } from "../../context.ts";
import { buildUrl } from "../../internal/url.ts";
import { assertResponse } from "../../error.ts";
import { parse } from "jsr:@valibot/valibot@1.4.2";
import { sanitizeTitle, type WikiDetail } from "./type.ts";
import { wikiDetail } from "./validator.ts";

/**
 * Show the wiki page in the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param title Title for wiki page
 * @returns Wiki page object
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
  const url = version == null
    ? buildUrl(
      context.endpoint,
      "projects",
      `${projectId}`,
      "wiki",
      `${sanitizeTitle(title)}.json`,
    )
    : buildUrl(
      context.endpoint,
      "projects",
      `${projectId}`,
      "wiki",
      sanitizeTitle(title),
      `${version}.json`,
    );

  const r = await fetch(url, opts);
  assertResponse(r);
  return parse(wikiDetail, await r.json());
}
