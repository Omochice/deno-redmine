import { join } from "jsr:@std/path@1.1.4/posix/join";
import type { Context } from "../../context.ts";
import type { VersionQuery } from "./type.ts";
import { assertResponse } from "../../error.ts";
import { objectToSnake } from "npm:ts-case-convert@2.1.0";

/**
 * Updates the version of given id.
 *
 * @param context REST endpoint context
 * @param id Version identifier
 * @param version Version parameters to update
 */
export async function update(
  context: Context,
  id: number,
  version: Partial<VersionQuery>,
): Promise<void> {
  const url = new URL(join(context.endpoint, "versions", `${id}.json`));
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({ version: objectToSnake(version) }),
  });
  assertResponse(response);
}
