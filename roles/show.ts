import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import type { Context } from "../context.ts";
import type { Role } from "./type.ts";
import { roleShowResponse } from "./validator.ts";
import { assertResponse } from "../error.ts";

/**
 * Show the role of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Role identifier
 * @returns Role object
 */
export async function show(
  context: Context,
  id: number,
): Promise<Role> {
  const url = buildUrl(context.endpoint, "roles", `${id}.json`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  await assertResponse(response);
  return parse(roleShowResponse, await response.json()).role;
}
