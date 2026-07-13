import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import { uploadResponseSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";

/**
 * Upload file content and obtain a token to attach it to a resource
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param data File content to upload
 * @param filename Name recorded for the uploaded file
 * @returns Upload token to reference the content when creating a resource
 */
export async function upload(
  context: Context,
  data: Uint8Array | ReadableStream<Uint8Array>,
  filename?: string,
): Promise<string> {
  const url = buildUrl(context.endpoint, "uploads.json");
  if (filename !== undefined) {
    url.searchParams.set("filename", filename);
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: data,
  });
  assertResponse(response);
  return parse(uploadResponseSchema, await response.json()).upload.token;
}
