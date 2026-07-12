import { join } from "jsr:@std/path@1.1.6/posix/join";
import type { Context } from "../../context.ts";
import type { Version } from "./type.ts";
import { versionSchema } from "./validator.ts";
import { assertResponse } from "../../error.ts";
import { object, parse } from "jsr:@valibot/valibot@1.4.2";

const schema = object({
  version: versionSchema,
});

export async function show(
  context: Context,
  id: number,
): Promise<Version> {
  const url = new URL(join(context.endpoint, "versions", `${id}.json`));
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  assertResponse(response);
  return parse(schema, await response.json()).version;
}
