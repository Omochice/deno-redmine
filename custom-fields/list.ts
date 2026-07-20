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
 * @return Yields each CustomField
 */
export async function* list(context: Context): AsyncGenerator<CustomField> {
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
  yield* parse(listCustomFieldResponse, await response.json()).custom_fields;
}
