import type { Context } from "../../context.ts";
import { array, number, object, parse } from "jsr:@valibot/valibot@1.1.0";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { type Issue, issueSchema } from "./type.ts";
import { assertResponse } from "../../error.ts";

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

/**
 * Converts an {@link Option} object into a record of string key-value pairs suitable for URL query parameters.
 *
 * Fields with undefined values are omitted. Custom fields are included with keys prefixed by "cf_".
 *
 * @returns An object mapping query parameter names to their string values.
 *
 * @remark The key "trakcer_id" contains a typo and should likely be "tracker_id".
 */
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

/**
 * Retrieves all issues from the Redmine API matching the specified filtering options.
 *
 * Fetches issues in batches of 100, handling pagination automatically, and aggregates all results into a single array.
 *
 * @param option - Filtering and pagination options for the issue query.
 * @returns A promise that resolves to an array of issues matching the criteria.
 *
 * @throws {Error} If the API request fails, the response is invalid, or the response data does not match the expected schema.
 */
export async function listIssues(
  context: Context,
  option: Partial<Option> = {},
): Promise<Issue[]> {
  const limit = 100;
  const opts: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  };
  const convertedOption = convertOptionToObject(option);
  const n = await fetchNumberOfIssues(context, option);
  const results: Response[] = [];
  for (let offset = 0; offset < n; offset += limit) {
    const endpoint = new URL(join(context.endpoint, "issues.json"));
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${offset}`,
      ...convertedOption,
    }).toString();
    const response = await fetch(endpoint, opts);
    assertResponse(response);
    results.push(response);
  }
  const issues: Issue[] = [];
  for (const response of results) {
    const json = await response.json();
    const parsed = parse(responseSchema, json);
    issues.push(...parsed.issues);
  }
  return issues;
}

/**
 * Retrieves the total number of Redmine issues matching the specified filtering options.
 *
 * @returns The total count of issues that satisfy the given criteria.
 *
 * @throws {Error} If the network request fails, the response is invalid, or the response does not contain a valid `total_count`.
 */
async function fetchNumberOfIssues(
  context: Context,
  option: Partial<Option>,
): Promise<number> {
  const endpoint = new URL(join(context.endpoint, "issues.json"));
  endpoint.search = new URLSearchParams({
    limit: "1",
    offset: "0",
    ...convertOptionToObject(option),
  }).toString();

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });

  assertResponse(response);
  return parse(
    object({ total_count: number() }),
    await response.json(),
  ).total_count;
}
