import type { Context } from "../context.ts";
import type { AttachmentContent } from "./type.ts";
import { show } from "./show.ts";
import { assertResponse } from "../error.ts";
import { isRedirectStatus } from "jsr:@std/http@1.1.3/status";

const maxRedirects = 5;

async function fetchContent(context: Context, url: URL): Promise<Response> {
  const endpointOrigin = new URL(context.endpoint).origin;
  let current = url;
  for (let followed = 0; followed <= maxRedirects; followed++) {
    const response = await fetch(current, {
      method: "GET",
      // The API key is sent to the endpoint's own origin only. A plugin that
      // offloads storage redirects to a presigned URL carrying its own
      // signature, and `fetch` would otherwise carry a custom header across
      // origins, unlike `Authorization`.
      headers: current.origin === endpointOrigin
        ? { "X-Redmine-API-Key": context.apiKey }
        : {},
      redirect: "manual",
    });

    const location = response.headers.get("Location");
    if (!isRedirectStatus(response.status) || location === null) {
      return response;
    }
    await response.body?.cancel();

    const next = new URL(location, current);
    if (next.protocol !== "http:" && next.protocol !== "https:") {
      throw new Error(
        `Refused to follow a redirect to an unsupported scheme: ${next.protocol}`,
      );
    }
    current = next;
  }
  throw new Error(
    `Attachment download followed more than ${maxRedirects} redirects`,
  );
}

/**
 * Download the content of the attachment of given id
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param id Attachment identifier
 * @returns Attachment content with the metadata describing it
 */
export async function download(
  context: Context,
  id: number,
): Promise<AttachmentContent> {
  const attachment = await show(context, id);

  // A Redmine behind a misconfigured reverse proxy reports `content_url` with
  // the scheme and host it knows itself by, which can be plain http even when
  // it was reached over https, so only the path is taken from it and the
  // endpoint decides where the request actually goes.
  const contentUrl = new URL(attachment.contentUrl);
  const url = new URL(context.endpoint);
  url.pathname = contentUrl.pathname;
  url.search = contentUrl.search;

  const response = await fetchContent(context, url);
  await assertResponse(response);
  if (response.body === null) {
    throw new Error(`Attachment ${id} was returned without a content body`);
  }

  return {
    filename: attachment.filename,
    contentType: attachment.contentType,
    filesize: attachment.filesize,
    body: response.body,
  };
}
