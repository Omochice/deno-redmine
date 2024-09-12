import { array, is, object, string } from "jsr:@valibot/valibot@0.41.0";
import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@7.2.0";
import { join } from "jsr:@std/path@1.0.5";
import type { Context } from "../context.ts";
import { convertError } from "../error.ts";

const errorSchema = object({
  errors: array(string()),
});

function internal(
  id: number,
  method: "archive" | "unarchive",
  context: Context,
): ResultAsync<void, Error> {
  const url = new URL(
    join(context.endpoint, "projects", `${id}`, `${method}.json`),
  );
  return ResultAsync.fromPromise(
    fetch(url, {
      method: "PUT",
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

export function archive(
  id: number,
  context: Context,
): ResultAsync<void, Error> {
  return internal(id, "archive", context);
}

export function unarchive(
  id: number,
  context: Context,
): ResultAsync<void, Error> {
  return internal(id, "unarchive", context);
}
