import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { Attachment } from "./type.ts";
import { attachmentSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";
import { object, parse } from "jsr:@valibot/valibot@1.4.2";

const schema = object({
  attachment: attachmentSchema,
});

/**
 * Show the attachment of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Attachment identifier
 * @returns Attachment object
 */
export async function show(
  context: Context,
  id: number,
): Promise<Attachment> {
  const url = buildUrl(context.endpoint, "attachments", `${id}.json`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  assertResponse(response);
  return parse(schema, await response.json()).attachment;
}
