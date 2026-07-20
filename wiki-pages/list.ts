import { Context } from "../context.ts";
import { buildUrl } from "../internal/url.ts";
import { assertResponse } from "../error.ts";
import { parse } from "jsr:@valibot/valibot@1.4.2";
import type { Wiki } from "./type.ts";
import { wikis } from "./validator.ts";

/**
 * List wiki pages included in the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @returns Wiki pages
 */
export async function list(
  context: Context,
  projectId: number,
): Promise<Wiki[]> {
  const opts = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  } as const satisfies RequestInit;
  const url = buildUrl(
    context.endpoint,
    "projects",
    `${projectId}`,
    "wiki",
    "index.json",
  );

  const r = await fetch(url, opts);
  await assertResponse(r);
  return parse(wikis, await r.json());
}
