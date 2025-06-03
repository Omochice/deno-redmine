import { Context } from "../../context.ts";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { assertResponse } from "../../error.ts";
import { parse } from "jsr:@valibot/valibot@1.1.0";
import type { Wiki } from "./type.ts";
import { wikis } from "./validator.ts";

/**
 * Retrieves the list of wiki pages for a specified project.
 *
 * @param projectId - The unique identifier of the project whose wiki pages are to be fetched.
 * @returns An array of {@link Wiki} objects representing the project's wiki pages.
 *
 * @throws {Error} If the HTTP response is invalid or the response data cannot be parsed.
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
