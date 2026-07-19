import { array, number, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { Membership } from "./type.ts";
import { membershipSchema } from "./validator.ts";
import { assertResponse } from "../error.ts";

const responseSchema = object({
  memberships: array(membershipSchema),
  total_count: number(),
});

// Redmine's max page size for this endpoint; most projects fit in one page.
const pageSize = 100;

/**
 * List memberships of the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @returns Memberships
 */
export async function fetchList(
  context: Context,
  projectId: number,
): Promise<Membership[]> {
  const opts: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  };
  // The memberships listing is paginated (default limit 25), so walk the pages
  // sequentially until every membership has been collected.
  const fetchPage = async (offset: number) => {
    const url = buildUrl(
      context.endpoint,
      "projects",
      `${projectId}`,
      "memberships.json",
    );
    url.search = new URLSearchParams({
      limit: `${pageSize}`,
      offset: `${offset}`,
    }).toString();
    const response = await fetch(url, opts);
    await assertResponse(response);
    return parse(responseSchema, await response.json());
  };

  const first = await fetchPage(0);
  const memberships = [...first.memberships];
  for (let offset = pageSize; offset < first.total_count; offset += pageSize) {
    memberships.push(...(await fetchPage(offset)).memberships);
  }
  return memberships;
}
