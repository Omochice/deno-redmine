import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import { type CustomField } from "./type.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";
import { listCustomFieldResponse } from "./validator.ts";

/**
 * Fetch custom fields
 * This endpoint requires admin privileges.
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @return Array of CustomField
 */
export async function list(context: Context): Promise<CustomField[]> {
  const endpoint = buildUrl(context.endpoint, "custom_fields.json");
  const response = await fetch(
    endpoint,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    },
  );
  await assertResponse(response);
  return parse(listCustomFieldResponse, await response.json()).custom_fields;
}
