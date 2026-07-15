import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

/**
 * Delete the attachment of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Attachment identifier
 */
export async function deleteAttachment(
  context: Context,
  id: number,
): Promise<void> {
  const url = buildUrl(context.endpoint, "attachments", `${id}.json`);
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
