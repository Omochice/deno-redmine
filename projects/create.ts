import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@6.1.0";
import { join } from "https://deno.land/std@0.221.0/path/mod.ts";
import type { Context } from "../context.ts";
import {
  array,
  is,
  object,
  string,
} from "https://deno.land/x/valibot@v0.29.0/mod.ts";
import type { ProjectRequest } from "./type.ts";
import { convertError } from "../error.ts";

const errorSchema = object({
  errors: array(string()),
});

export function create(
  project: ProjectRequest,
  context: Context,
): ResultAsync<void, Error> {
  const url = new URL(join(context.endpoint, "projects.json"));
  return ResultAsync.fromPromise(
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ project }),
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
