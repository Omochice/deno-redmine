import { buildUrl } from "../../internal/url.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";

// Redmine falls back to the project's default repository when repository_id
// is absent, so it is an optional path segment.
function revisionSegments(
  projectId: number,
  rev: string,
  repositoryId?: string,
): string[] {
  const base = ["projects", `${projectId}`, "repository"];
  const withRepository = repositoryId === undefined
    ? base
    : [...base, repositoryId];
  return [...withRepository, "revisions", rev];
}

/**
 * Relate an issue to the revision of the project repository
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param rev Revision identifier
 * @param issueId Issue identifier to relate
 * @param repositoryId Repository identifier; when omitted the project's
 * default repository is used
 */
export async function addRelatedIssue(
  context: Context,
  projectId: number,
  rev: string,
  issueId: number,
  repositoryId?: string,
): Promise<void> {
  const url = buildUrl(
    context.endpoint,
    ...revisionSegments(projectId, rev, repositoryId),
    "issues.json",
  );
  await assertResponse(
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
      body: JSON.stringify({ issue_id: issueId }),
    }),
  );
}

/**
 * Remove the relation between an issue and the revision of the project
 * repository
 * This may throw `Error`
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param rev Revision identifier
 * @param issueId Related issue identifier to remove
 * @param repositoryId Repository identifier; when omitted the project's
 * default repository is used
 */
export async function removeRelatedIssue(
  context: Context,
  projectId: number,
  rev: string,
  issueId: number,
  repositoryId?: string,
): Promise<void> {
  const url = buildUrl(
    context.endpoint,
    ...revisionSegments(projectId, rev, repositoryId),
    "issues",
    `${issueId}.json`,
  );
  await assertResponse(
    await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    }),
  );
}
