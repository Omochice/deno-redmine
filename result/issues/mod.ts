import { Context } from "../../context.ts";
import { listIssues } from "./list.ts";
import { show } from "./show.ts";
import { update } from "./update.ts";
import { createIssue } from "./create.ts";
import type { Include } from "../../throwable/issues/show.ts";
import type {
  CreateIssueQuery,
  ListIssueQuery,
  UpdateIssueQuery,
} from "../../throwable/issues/type.ts";

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
}
