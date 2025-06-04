import { join } from "jsr:@std/path@1.1.0/posix/join";
import type { Context } from "../../context.ts";
import type { ProjectRequest } from "./type.ts";
import { assertResponse } from "../../error.ts";

export type ProjectUpdateInformation = Partial<
  Omit<ProjectRequest, "identifier">
>;

export async function update(
  context: Context,
  id: number,
  project: ProjectUpdateInformation,
): Promise<void> {
  const url = new URL(join(context.endpoint, "projects", `${id}.json`));
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({ project }),
  });
  assertResponse(response);
}
