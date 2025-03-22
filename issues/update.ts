import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@8.2.0";
import { Context } from "../context.ts";
import { Issue } from "./type.ts";
import { join } from "jsr:@std/path@1.0.8";
import { array, is, object, string } from "jsr:@valibot/valibot@0.42.1";
import { convertError } from "../error.ts";

export type UpdateOption = {
  notes?: string;
  private_notes?: boolean;
};

const errorSchema = object({
  errors: array(string()),
});

export function update(
  id: number,
  issue: Partial<Issue & UpdateOption>,
  context: Context,
): ResultAsync<void, Error> {
  const url = new URL(join(context.endpoint, "issues", `${id}.json`));
  return ResultAsync.fromPromise(
    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ issue }),
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
