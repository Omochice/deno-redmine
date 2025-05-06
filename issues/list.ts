import type { Context } from "../context.ts";
import {
  array,
  is,
  number,
  object,
  safeParse,
} from "jsr:@valibot/valibot@1.1.0";
import { errAsync, okAsync, ResultAsync } from "npm:neverthrow@8.2.0";
import { join } from "jsr:@std/path@1.0.9";
import { type Issue, issueSchema } from "./type.ts";
import { convertError } from "../error.ts";

const responseSchema = object({
  issues: array(issueSchema),
  total_count: number(),
  offset: number(),
  limit: number(),
});

export type Option = {
  limit: number;
  include: "attachment" | "relations";
  issueId: number[] | number;
  projectId: number;
  subprojectId: string;
  trackerId: number;
  statusId: "open" | "closed" | "*" | number;
  assignedToId: number | "me";
  parentId: string;
  customField: {
    id: number;
    value: string;
  }[];
};

function convertValue(
  value: string | string[] | number | number[] | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return (Array.isArray(value) ? value : [value]).map((v) => `${v}`).join(",");
}

function convertCustomFields(
  customFields: { id: number; value: string }[] | undefined,
): [string, string][] {
  return customFields?.map(({ id, value }) => [`cf_${id}`, value]) ?? [];
}

function convertOptionToObject(
  option: Partial<Option>,
): Record<string, string> {
  const entries = [
    ["include", convertValue(option.include)],
    ["issue_id", convertValue(option.issueId)],
    ["project_id", convertValue(option.projectId)],
    ["subproject_id", convertValue(option.subprojectId)],
    ["trakcer_id", convertValue(option.trackerId)],
    ["status_id", convertValue(option.statusId)],
    ["assigned_to_id", convertValue(option.assignedToId)],
    ["parent_id", convertValue(option.parentId)],
    ...convertCustomFields(option.customField),
  ].filter(([_, value]) => value !== undefined);
  return Object.fromEntries(entries);
}

export function listIssues(
  context: Context,
  option: Partial<Option> = {},
): ResultAsync<Issue[], Error> {
  const limit = 100;
  const opts: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  };
  const convertedOption = convertOptionToObject(option);

  return fetchNumberOfIssues(context, option)
    .andThen((n) => {
      const results: ResultAsync<Response, Error>[] = [];
      for (let offset = 0; offset < n; offset += limit) {
        const endpoint = new URL(join(context.endpoint, "issues.json"));
        endpoint.search = new URLSearchParams({
          limit: `${limit}`,
          offset: `${offset}`,
          ...convertedOption,
        }).toString();
        results.push(
          ResultAsync.fromPromise(
            fetch(endpoint, opts),
            convertError("Unexpected Error1"),
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
      const issues: Issue[][] = [];
      for (const issue of r) {
        const parsed = safeParse(responseSchema, issue);
        if (!parsed.success) {
          return errAsync(
            new Error("Unexpected Error2", { cause: parsed.issues }),
          );
        }
        issues.push(parsed.output.issues);
      }
      return okAsync(issues.flat());
    });
}

function fetchNumberOfIssues(
  context: Context,
  option: Partial<Option>,
): ResultAsync<number, Error> {
  const endpoint = new URL(join(context.endpoint, "issues.json"));
  endpoint.search = new URLSearchParams({
    limit: "1",
    offset: "0",
    ...convertOptionToObject(option),
  }).toString();

  return ResultAsync.fromPromise(
    fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
    convertError("Unexpected Error2"),
  )
    .andThen((r: Response) =>
      ResultAsync.fromPromise(r.json(), convertError("Unexpected Error4"))
    )
    .andThen((r: unknown) => {
      return is(object({ total_count: number() }), r)
        ? okAsync(r.total_count)
        : errAsync(new Error("Unexpected Error5", { cause: r }));
    });
}
