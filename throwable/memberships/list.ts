import { array, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { Membership } from "./type.ts";
import { membershipSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";

const responseSchema = object({
  memberships: array(membershipSchema),
});

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
  const url = buildUrl(
    context.endpoint,
    "projects",
    `${projectId}`,
    "memberships.json",
  );
  /**
   * @note Redmine returns every membership of the project in a single
   * response, so no pagination is needed here unlike the projects and
   * issues listings.
   */
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  assertResponse(response);
  return parse(responseSchema, await response.json()).memberships;
}
