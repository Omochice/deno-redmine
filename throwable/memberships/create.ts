import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { CreateMembershipQuery } from "./type.ts";
import { toCreateMembershipQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Create a membership for the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param membership Membership attributes to create it
 */
export async function create(
  context: Context,
  projectId: number,
  membership: CreateMembershipQuery,
): Promise<void> {
  const url = buildUrl(
    context.endpoint,
    "projects",
    `${projectId}`,
    "memberships.json",
  );
  await assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({
        membership: parse(toCreateMembershipQuery, membership),
      }),
    }),
  );
}
