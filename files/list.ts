import type { ProjectRef } from "../projects/type.ts";
import { array, object, parse } from "jsr:@valibot/valibot@1.5.0";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { ProjectFile } from "./type.ts";
import { fileSchema } from "./validator.ts";
import { assertResponse } from "../error.ts";

const responseSchema = object({
  files: array(fileSchema),
});

/**
 * List files attached to the project
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project id or identifier
 * @returns Yields each ProjectFile
 */
export async function* list(
  context: Context,
  projectId: ProjectRef,
): AsyncGenerator<ProjectFile> {
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
  await assertResponse(response);
  yield* parse(responseSchema, await response.json()).files;
}
