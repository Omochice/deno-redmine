import type { ProjectRef } from "./type.ts";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";

async function internal(
  context: Context,
  id: ProjectRef,
  method: "close" | "reopen",
): Promise<void> {
  const url = buildUrl(context.endpoint, "projects", `${id}`, `${method}.json`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  await assertResponse(response);
}

export async function close(context: Context, id: ProjectRef): Promise<void> {
  return await internal(context, id, "close");
}

export async function reopen(context: Context, id: ProjectRef): Promise<void> {
  return await internal(context, id, "reopen");
}
