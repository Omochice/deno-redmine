import type { Context } from "../../context.ts";
import { fetchList } from "./list.ts";
import { show } from "./show.ts";
import { create } from "./create.ts";
import type {
  CreateIssueCategoryQuery,
  UpdateIssueCategoryQuery,
} from "../../throwable/issue-categories/type.ts";
import { update } from "./update.ts";
import { deleteIssueCategory } from "./delete.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all issue categories of the project.
   *
   * @param projectId Project identifier
   */
  list(projectId: number): ReturnType<typeof fetchList> {
    return fetchList(this.#context, projectId);
  }

  /**
   * Returns the issue category of given id.
   *
   * @param id Issue category identifier
   */
  show(id: number): ReturnType<typeof show> {
    return show(this.#context, id);
  }

  /**
   * Creates an issue category for the project.
   *
   * @param projectId Project identifier
   * @param issueCategory The issue category attributes
   */
  create(
    projectId: number,
    issueCategory: CreateIssueCategoryQuery,
  ): ReturnType<typeof create> {
    return create(this.#context, projectId, issueCategory);
  }

  /**
   * Updates the issue category of given id.
   *
   * @param id Issue category identifier
   * @param issueCategory The issue category attributes to update it
   */
  update(
    id: number,
    issueCategory: UpdateIssueCategoryQuery,
  ): ReturnType<typeof update> {
    return update(this.#context, id, issueCategory);
  }

  /**
   * Deletes the issue category of given id.
   *
   * @param id Issue category identifier
   * @param reassignToId Identifier of the category to reassign the
   * category's issues to
   */
  delete(
    id: number,
    reassignToId?: number,
  ): ReturnType<typeof deleteIssueCategory> {
    return deleteIssueCategory(this.#context, id, reassignToId);
  }
}
