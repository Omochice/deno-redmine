import type { Context } from "../../context.ts";
import { parse } from "jsr:@valibot/valibot@1.1.0";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { type Response_, responseSchema } from "./type.ts";
import { assertResponse } from "../../error.ts";

/**
 * Retrieves the list of issue templates for a specified project.
 *
 * @param projectId - The numeric ID or string identifier of the project whose issue templates are to be listed.
 * @returns The parsed response containing the project's issue templates.
 *
 * @throws {Error} If the HTTP response is not successful or the response does not match the expected schema.
 */
export async function list(
  context: Context,
  projectId: number | string,
): Promise<Response_> {
  const endpoint = join(
    context.endpoint,
    "projects",
    `${projectId}`,
    "issue_templates.json",
  );
  const r = await fetch(
    endpoint,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    },
  );
  assertResponse(r);
  return parse(responseSchema, await r.json());
}
