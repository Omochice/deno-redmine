import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { UpdateVersionQuery } from "./type.ts";
import { toUpdateVersionQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Update the version of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Version identifier
 * @param version Version attributes to update it
 */
export async function update(
  context: Context,
  id: number,
  version: UpdateVersionQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "versions", `${id}.json`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({ version: parse(toUpdateVersionQuery, version) }),
  });
  await assertResponse(response);
}
