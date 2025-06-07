import { join } from "jsr:@std/path@1.1.0/posix/join";
import type { Context } from "../../context.ts";
import type { ProjectQuery } from "./type.ts";
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
      body: JSON.stringify({ project }),
    }),
  );
}
