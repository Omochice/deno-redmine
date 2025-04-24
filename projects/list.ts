import {
  array,
  is,
  number,
  object,
  safeParse,
} from "jsr:@valibot/valibot@0.42.1";
import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@8.2.0";
import { join } from "jsr:@std/path@1.0.9";
import { type Project, projectSchema } from "./type.ts";
import type { Context } from "../context.ts";
import { convertError } from "../error.ts";

const responseSchema = object({
  projects: array(projectSchema),
  total_count: number(),
  offset: number(),
  limit: number(),
});

/**
 * Fetch projects list
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has project or error
 */
export function fetchList(context: Context): ResultAsync<Project[], Error> {
  const limit = 25;

  const opts: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  };
  return fetchNumberOfProjects(context)
    .andThen((n) => {
      const results: ResultAsync<Response, Error>[] = [];
      for (let i = 0; i < n; i += limit) {
        const endpoint = new URL(join(context.endpoint, "projects.json"));
        endpoint.search = new URLSearchParams({
          limit: `${limit}`,
          offset: `${i}`,
        }).toString();
        results.push(
          ResultAsync.fromPromise(
            fetch(endpoint, opts),
            convertError("Unexpected Error"),
          ),
        );
      }
      return ResultAsync.combine(results);
    })
    .andThen((r) =>
      ResultAsync.fromPromise(
        Promise.all(r.map((e) => e.json())),
        convertError("Unexpected Error"),
      )
    )
    .andThen((r: unknown[]) => {
      const projects: Project[][] = [];
      for (const project of r) {
        const parsed = safeParse(responseSchema, project);
        if (!parsed.success) {
          return errAsync(
            new Error("Unexpected Error", { cause: parsed.issues }),
          );
        }
        projects.push(parsed.output.projects);
      }
      return okAsync(projects.flat());
    });
}

function fetchNumberOfProjects(context: Context): ResultAsync<number, Error> {
  const endpoint = new URL(join(context.endpoint, "projects.json"));
  endpoint.search = new URLSearchParams({
    limit: "1",
    offset: "0",
  }).toString();

  return ResultAsync.fromPromise(
    fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
    convertError("Unexpected Error"),
  )
    .andThen((r: Response) =>
      ResultAsync.fromPromise(r.json(), convertError("Unexpected Error"))
    )
    .andThen((r: unknown) =>
      is(responseSchema, r)
        ? okAsync(r.total_count)
        : errAsync(new Error("Unexpected Error"))
    );
}
