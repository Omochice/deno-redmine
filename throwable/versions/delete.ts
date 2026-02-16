import { join } from "jsr:@std/path@1.1.4/posix/join";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

/**
 * Deletes the version of given id.
 *
 * @param context REST endpoint context
 * @param id Version identifier
 */
export async function deleteVersion(
  context: Context,
  id: number,
): Promise<void> {
  const url = new URL(join(context.endpoint, "versions", `${id}.json`));
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
