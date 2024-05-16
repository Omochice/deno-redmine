import {
  array,
  is,
  object,
  string,
} from "https://deno.land/x/valibot@v0.30.0/mod.ts";
import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@6.2.1";
import { join } from "jsr:@std/path@0.225.1";
import type { Context } from "../context.ts";
import { convertError } from "../error.ts";

const errorSchema = object({
  errors: array(string()),
});

export function deleteProject(
  id: number,
  context: Context,
): ResultAsync<void, Error> {
  const url = new URL(join(context.endpoint, "projects", `${id}.json`));
  return ResultAsync.fromPromise(
    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
    convertError("Unexpected Error"),
  )
    .andThen((r: Response) => r.ok ? okAsync(undefined) : errAsync(r))
    .orElse((e: Response | Error) => {
      if (e instanceof Error) {
        return errAsync(e);
      }
      return ResultAsync.fromPromise(
        e.json(),
        convertError("Unexpected Error"),
      );
    })
    .andThen((r: unknown) => {
      if (r === undefined) {
        return okAsync(undefined);
      }
      if (is(errorSchema, r)) {
        return errAsync(new Error(JSON.stringify(r.errors)));
      }
      return errAsync(new Error("Unexpected Error", { cause: r }));
    });
}
