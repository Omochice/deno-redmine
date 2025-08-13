import { join } from "jsr:@std/path@1.1.2/posix/join";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

export async function deleteProject(
  context: Context,
  id: number,
): Promise<void> {
  const url = new URL(join(context.endpoint, "projects", `${id}.json`));
  assertResponse(
    await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
  );
}
