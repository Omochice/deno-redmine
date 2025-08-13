import { join } from "jsr:@std/path@1.1.2/posix/join";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

async function internal(
  context: Context,
  id: number,
  method: "archive" | "unarchive",
): Promise<void> {
  const url = new URL(
    join(context.endpoint, "projects", `${id}`, `${method}.json`),
  );
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  assertResponse(response);
}

export async function archive(context: Context, id: number): Promise<void> {
  return await internal(context, id, "archive");
}

export async function unarchive(context: Context, id: number): Promise<void> {
  return await internal(context, id, "unarchive");
}
