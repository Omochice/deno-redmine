import { array, number, object, parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../internal/url.ts";
import { fetchAllPages } from "../internal/paging.ts";
import { type Project } from "./type.ts";
import { projectSchema } from "./validator.ts";
import type { Context } from "../context.ts";
import { assertResponse } from "../error.ts";

const responseSchema = object({
  projects: array(projectSchema),
  total_count: number(),
  offset: number(),
  limit: number(),
});

export async function fetchList(context: Context): Promise<Project[]> {
  return await fetchAllPages(async (limit, offset) => {
    const endpoint = buildUrl(context.endpoint, "projects.json");
    endpoint.search = new URLSearchParams({
      limit: `${limit}`,
      offset: `${offset}`,
    }).toString();
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    });
    await assertResponse(response);
    const parsed = parse(responseSchema, await response.json());
    return { items: parsed.projects, totalCount: parsed.total_count };
  }, { pageSize: 25 });
}
