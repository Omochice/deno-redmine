import type { ProjectRef } from "./type.ts";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";

export async function deleteProject(
  context: Context,
  id: ProjectRef,
): Promise<void> {
  const url = buildUrl(context.endpoint, "projects", `${id}.json`);
  await assertResponse(
    await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
  );
}
