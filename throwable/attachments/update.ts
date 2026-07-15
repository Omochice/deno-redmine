import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import type { UpdateAttachmentQuery } from "./type.ts";
import { toUpdateAttachmentQuery } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Update the attachment of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Attachment identifier
 * @param attachment Attachment attributes to update it
 */
export async function update(
  context: Context,
  id: number,
  attachment: UpdateAttachmentQuery,
): Promise<void> {
  const url = buildUrl(context.endpoint, "attachments", `${id}.json`);
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({
      attachment: parse(toUpdateAttachmentQuery, attachment),
    }),
  });
  assertResponse(response);
}
