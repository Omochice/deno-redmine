import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { CreateFileQuery } from "./type.ts";
import { toCreateFileQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Create a file for the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param file File attributes to create it, including the upload token
 */
export async function create(
  context: Context,
  projectId: number,
  file: CreateFileQuery,
): Promise<void> {
  const url = buildUrl(
    context.endpoint,
    "projects",
    `${projectId}`,
    "files.json",
  );
  assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ file: parse(toCreateFileQuery, file) }),
    }),
  );
}
