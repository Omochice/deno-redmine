import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { CreateVersionQuery } from "./type.ts";
import { toCreateVersionQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Create a version for the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param version Version attributes to create it
 */
export async function create(
  context: Context,
  projectId: number,
  version: CreateVersionQuery,
): Promise<void> {
  const url = buildUrl(
    context.endpoint,
    "projects",
    `${projectId}`,
    "versions.json",
  );
  assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ version: parse(toCreateVersionQuery, version) }),
    }),
  );
}
