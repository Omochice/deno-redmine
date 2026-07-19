import { Context } from "../context.ts";
import { buildUrl } from "../internal/url.ts";
import { assertResponse } from "../error.ts";
import { parse } from "jsr:@valibot/valibot@1.4.2";
import { sanitizeTitle, type WikiDetail } from "./type.ts";
import { wikiDetail } from "./validator.ts";

export type Include = "attachments";

/**
 * Parameters to identify the wiki page to show
 */
export type ShowWikiPageParams = {
  /** Project identifier */
  projectId: number;
  /** Title for wiki page */
  title: string;
  /** Version of the wiki page */
  version?: number;
  /** Associations to include in the response */
  includes?: Include[];
};

/**
 * Show the wiki page in the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param params Parameters to identify the wiki page
 * @returns Wiki page object
 */
export async function show(
  context: Context,
  { projectId, title, version, includes }: ShowWikiPageParams,
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
  if (includes !== undefined) {
    url.search = new URLSearchParams({ include: includes.join(",") })
      .toString();
  }

  const r = await fetch(url, opts);
  await assertResponse(r);
  return parse(wikiDetail, await r.json());
}
