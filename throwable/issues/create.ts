import {
  array,
  boolean,
  type InferInput,
  type InferOutput,
  number,
  object,
  optional,
  parse,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.1.0";
import { join } from "jsr:@std/path@1.1.0/posix/join";
import { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

const inputIssueSchema = object({
  projectId: number(),
  trackerId: number(),
  statusId: number(),
  priorityId: number(),
  subject: string(),
  description: optional(string()),
  categoryId: optional(number()),
  fixedVersionId: optional(number()),
  assignedToId: optional(number()),
  parentIssueId: optional(number()),
  watcherUserIds: optional(array(number())),
  isPriavte: optional(boolean()),
  estimatedHours: optional(number()),
  customFields: optional(array(object({}))),
});

const normalizeIssue = transform(
  (input: InferOutput<typeof inputIssueSchema>) => {
    return {
      project_id: input.projectId,
      tracker_id: input.trackerId,
      status_id: input.statusId,
      priprity_id: input.priorityId,
      subject: input.subject,
      description: input.description,
      category_id: input.categoryId,
      fixed_version_id: input.fixedVersionId,
      assigned_to_id: input.assignedToId,
      parent_issue_id: input.parentIssueId,
      watcher_user_ids: input.watcherUserIds,
      is_private: input.isPriavte,
      estimated_hours: input.estimatedHours,
      custom_fields: input.customFields,
    };
  },
);

const issueSchema = pipe(inputIssueSchema, normalizeIssue);
export type Issue = InferInput<typeof issueSchema>;

/**
 * Creates a new issue in the project management system using the provided context and issue data.
 *
 * Validates and transforms the issue input before sending a POST request to the API endpoint.
 *
 * @param issue - The issue data to be created.
 *
 * @remark
 * Throws an error if the API response indicates failure.
 */
export async function createIssue(
  context: Context,
  issue: Issue,
): Promise<void> {
  const url = join(context.endpoint, "issues.json");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": context.apiKey,
    },
    body: JSON.stringify(parse(inputIssueSchema, issue)),
  });
  assertResponse(response);
}
