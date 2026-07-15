import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

async function internal(
  context: Context,
  id: number,
  method: "archive" | "unarchive",
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

export async function archive(context: Context, id: number): Promise<void> {
  return await internal(context, id, "archive");
}

export async function unarchive(context: Context, id: number): Promise<void> {
  return await internal(context, id, "unarchive");
}
