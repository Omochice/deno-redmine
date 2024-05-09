import { object, safeParse } from "https://deno.land/x/valibot@v0.30.0/mod.ts";
import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@6.2.1";
import { join } from "jsr:@std/path@0.223.0";
import { type Project, projectSchema } from "./type.ts";
import type { Context } from "../context.ts";
import { convertError } from "../error.ts";

const schema = object({
  project: projectSchema,
});

export function show(
  id: number,
  context: Context,
): ResultAsync<Project, Error> {
  const url = new URL(join(context.endpoint, "projects", `${id}.json`));
  return ResultAsync.fromPromise(
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
    convertError("Unexpected Error"),
  )
    .andThen((r: Response) =>
      r.ok ? okAsync(r) : errAsync(new Error(`${r.status}: ${r.statusText}`))
    )
    .andThen((r: Response) =>
      ResultAsync.fromPromise(
        r.json(),
        convertError("Unexpected Error"),
      )
    )
    .andThen((json: unknown) => {
      const parsed = safeParse(schema, json);
      if (!parsed.success) {
        return errAsync(
          new Error("Fetched project has invalid schema", {
            cause: parsed.issues,
          }),
        );
      }
      return okAsync(parsed.output.project);
    });
}
