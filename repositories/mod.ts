import type { Context } from "../context.ts";
import {
  addRelatedIssue,
  type RelatedIssueParams,
  removeRelatedIssue,
} from "./related-issue.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Relate an issue to the revision of the project repository
   *
   * @param params Parameters to relate an issue to the revision
   */
  addRelatedIssue(
    params: RelatedIssueParams,
  ): ReturnType<typeof addRelatedIssue> {
    return addRelatedIssue(this.#context, params);
  }

  /**
   * Remove the relation between an issue and the revision of the project
   * repository
   *
   * @param params Parameters to remove the relation between an issue and
   * the revision
   */
  removeRelatedIssue(
    params: RelatedIssueParams,
  ): ReturnType<typeof removeRelatedIssue> {
    return removeRelatedIssue(this.#context, params);
  }
}
