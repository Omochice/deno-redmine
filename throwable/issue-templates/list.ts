import type { Context } from "../../context.ts";
import { parse } from "jsr:@valibot/valibot@1.1.0";
import { join } from "jsr:@std/path@1.1.1/posix/join";
import type { Response_ } from "./type.ts";
import { issueTemplateResponse } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Fetch list of issue templates
 * @params context Connection context object
 * @params projectId Project id or Project identifier
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
  return parse(issueTemplateResponse, await r.json());
}
