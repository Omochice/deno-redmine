import { join } from "jsr:@std/path@1.1.0/posix/join";
import type { Context } from "../../context.ts";
import { type Project, projectSchema } from "./type.ts";
import { assertResponse } from "../../error.ts";
import { object, parse } from "jsr:@valibot/valibot@1.1.0";

const schema = object({
  project: projectSchema,
});

/**
 * Retrieves a project by its ID from the remote API.
 *
 * @param id - The unique identifier of the project to retrieve.
 * @returns The project corresponding to the given {@link id}.
 *
 * @throws {Error} If the HTTP request fails or the response does not match the expected schema.
 */
export async function show(
  context: Context,
  id: number,
): Promise<Project> {
  const url = new URL(join(context.endpoint, "projects", `${id}.json`));
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  assertResponse(response);
  return parse(schema, await response.json()).project;
}
