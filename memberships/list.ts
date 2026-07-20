import { array, number, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import { fetchAllPages } from "../internal/paging.ts";
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
export async function list(
  context: Context,
  projectId: number,
): Promise<Membership[]> {
  // The memberships listing is paginated (default limit 25), so walk every
  // page until each membership has been collected.
  return await fetchAllPages(async (limit, offset) => {
    const url = buildUrl(
      context.endpoint,
      "projects",
      `${projectId}`,
      "memberships.json",
    );
    url.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${offset}`,
    }).toString();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    });
    await assertResponse(response);
    const parsed = parse(responseSchema, await response.json());
    return { items: parsed.memberships, totalCount: parsed.total_count };
  }, { pageSize });
}
