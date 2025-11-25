import { Context } from "../../context.ts";
import { join } from "jsr:@std/path@1.1.3/posix/join";
import { assertResponse } from "../../error.ts";
import { parse } from "jsr:@valibot/valibot@1.2.0";
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
export async function fetchList(
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
  const url = new URL(
    join(context.endpoint, "projects", `${projectId}`, "wiki", "index.json"),
  );

  const r = await fetch(url, opts);
  assertResponse(r);
  return parse(wikis, await r.json());
}
