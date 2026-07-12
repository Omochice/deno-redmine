import type { Context } from "../../context.ts";
import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
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
  const endpoint = buildUrl(
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
