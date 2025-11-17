import { array, number, object, parse } from "jsr:@valibot/valibot@1.1.0";
import { join } from "jsr:@std/path@1.1.3/posix/join";
import { type Project } from "./type.ts";
import { projectSchema } from "./validator.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

const responseSchema = object({
  projects: array(projectSchema),
  total_count: number(),
  offset: number(),
  limit: number(),
});

export async function fetchList(context: Context): Promise<Project[]> {
  const limit = 25;
  const opts: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  };
  const n = await fetchNumberOfProjects(context);
  const promises: Promise<Response>[] = [];
  for (let i = 0; i < n; i += limit) {
    const endpoint = new URL(join(context.endpoint, "projects.json"));
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${i}`,
    }).toString();
    promises.push(fetch(endpoint, opts));
  }
  const responses = await Promise.all(promises);
  const results: Project[][] = [];
  for (const response of responses) {
    assertResponse(response);
    results.push(parse(responseSchema, await response.json()).projects);
  }
  return results.flat();
}

async function fetchNumberOfProjects(context: Context): Promise<number> {
  const endpoint = new URL(join(context.endpoint, "projects.json"));
  endpoint.search = new URLSearchParams({
    limit: "1",
    offset: "0",
  }).toString();

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
  });
  assertResponse(response);
  return parse(responseSchema, await response.json()).total_count;
}
