import { parse } from "jsr:@valibot/valibot@1.4.2";
import { join } from "jsr:@std/path@1.1.6/posix/join";
import type { Context } from "../../context.ts";
import type { ProjectQuery } from "./type.ts";
import { toProjectQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

export async function create(
  context: Context,
  project: ProjectQuery,
): Promise<void> {
  const url = new URL(join(context.endpoint, "projects.json"));
  assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ project: parse(toProjectQuery, project) }),
    }),
  );
}
