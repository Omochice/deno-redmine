import type { Context } from "../../context.ts";
import { addRelatedIssue, removeRelatedIssue } from "./related-issue.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Relate an issue to the revision of the project repository
   *
   * @param projectId Project identifier
   * @param rev Revision identifier
   * @param issueId Issue identifier to relate
   * @param repositoryId Repository identifier; when omitted the project's
   * default repository is used
   */
  addRelatedIssue(
    projectId: number,
    rev: string,
    issueId: number,
    repositoryId?: string,
  ): ReturnType<typeof addRelatedIssue> {
    return addRelatedIssue(
      this.#context,
      projectId,
      rev,
      issueId,
      repositoryId,
    );
  }

  /**
   * Remove the relation between an issue and the revision of the project
   * repository
   *
   * @param projectId Project identifier
   * @param rev Revision identifier
   * @param issueId Related issue identifier to remove
   * @param repositoryId Repository identifier; when omitted the project's
   * default repository is used
   */
  removeRelatedIssue(
    projectId: number,
    rev: string,
    issueId: number,
    repositoryId?: string,
  ): ReturnType<typeof removeRelatedIssue> {
    return removeRelatedIssue(
      this.#context,
      projectId,
      rev,
      issueId,
      repositoryId,
    );
  }
}
