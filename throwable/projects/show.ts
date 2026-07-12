import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { Project } from "./type.ts";
import { projectSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";
import { object, parse } from "jsr:@valibot/valibot@1.4.2";

const schema = object({
  project: projectSchema,
});

export async function show(
  context: Context,
  id: number,
): Promise<Project> {
  const url = buildUrl(context.endpoint, "projects", `${id}.json`);
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
