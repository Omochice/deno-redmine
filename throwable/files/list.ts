import { array, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { File } from "./type.ts";
import { fileSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";

const responseSchema = object({
  files: array(fileSchema),
});

/**
 * List files attached to the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @returns Files
 */
export async function fetchList(
  context: Context,
  projectId: number,
): Promise<File[]> {
  const url = buildUrl(
    context.endpoint,
    "projects",
    `${projectId}`,
    "files.json",
  );
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  assertResponse(response);
  return parse(responseSchema, await response.json()).files;
}
