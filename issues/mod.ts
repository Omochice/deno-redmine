import { Context } from "../context.ts";
import type {
  CreateIssueQuery,
  ListIssueQuery,
  UpdateIssueQuery,
} from "./type.ts";
import { listIssues } from "./list.ts";
import { type Include, show } from "./show.ts";
import { update } from "./update.ts";
import { createIssue } from "./create.ts";
import { deleteIssue } from "./delete.ts";
import { addWatcher } from "./add-watcher.ts";
import { removeWatcher } from "./remove-watcher.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all issues
   *
   * @param option The query option
   */
  list(option: Partial<ListIssueQuery>): ReturnType<typeof listIssues> {
    return listIssues(this.#context, option);
  }

  /**
   * Returns the issue of given id.
   *
   * @param id The issue id
   * @param includes Options to include additional information
   */
  show(id: number, includes?: Include[]): ReturnType<typeof show> {
    return show(this.#context, id, includes);
  }

  /**
   * Updates the issue of given id.
   *
   * @param id The issue id
   * @param issue The issue attributes to update it
   */
  update(
    id: number,
    issue: UpdateIssueQuery,
  ): ReturnType<typeof update> {
    return update(this.#context, id, issue);
  }

  /**
   * Create the issue
   *
   * @param issue The issue object
   */
  create(issue: CreateIssueQuery): ReturnType<typeof createIssue> {
    return createIssue(this.#context, issue);
  }

  /**
   * Deletes the issue of given id.
   *
   * @param id The issue id
   */
  delete(id: number): ReturnType<typeof deleteIssue> {
    return deleteIssue(this.#context, id);
  }

  /**
   * Adds a watcher to the issue of given id.
   *
   * @param issueId The issue id
   * @param userId The id of the user to add as a watcher
   */
  addWatcher(
    issueId: number,
    userId: number,
  ): ReturnType<typeof addWatcher> {
    return addWatcher(this.#context, issueId, userId);
  }

  /**
   * Removes a watcher from the issue of given id.
   *
   * @param issueId The issue id
   * @param userId The id of the user to remove from watchers
   */
  removeWatcher(
    issueId: number,
    userId: number,
  ): ReturnType<typeof removeWatcher> {
    return removeWatcher(this.#context, issueId, userId);
  }
}
