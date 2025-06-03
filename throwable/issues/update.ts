import { Context } from "../../context.ts";
import { Issue } from "./type.ts";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { assertResponse } from "../../error.ts";

export type UpdateOption = {
  notes?: string;
  private_notes?: boolean;
};

/**
 * Updates an existing issue on the remote server with the specified fields.
 *
 * @param id - The unique identifier of the issue to update.
 * @param issue - An object containing the fields to update for the issue.
 *
 * @remark
 * Only the fields provided in {@link issue} will be updated; all other fields remain unchanged.
 */
export async function update(
  context: Context,
  id: number,
  issue: Partial<Issue & UpdateOption>,
): Promise<void> {
  const url = new URL(join(context.endpoint, "issues", `${id}.json`));
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify({ issue }),
  });
  assertResponse(response);
}
