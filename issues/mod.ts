import { Context } from "../context.ts";
import type { Issue } from "./type.ts";
import { listIssues, type Option } from "./list.ts";
import { type Include, show } from "./show.ts";
import { update, type UpdateOption } from "./update.ts";
import { createIssue, type Issue as InputIssue } from "./create.ts";

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
  list(option: Partial<Option>): ReturnType<typeof listIssues> {
    return listIssues(this.#context, option);
  }

  /**
   * Returns the issue of given id.
   *
   * @param id The issue id
   * @param includes Options to include additional information
   */
  show(id: number, includes?: Include[]): ReturnType<typeof show> {
    return show(id, this.#context, includes);
  }

  /**
   * Updates the issue of given id.
   *
   * @param id The issue id
   * @param issue The issue attributes to update it
   */
  update(
    id: number,
    issue: Partial<Issue & UpdateOption>,
  ): ReturnType<typeof update> {
    return update(id, issue, this.#context);
  }

  /**
   * Create the issue
   *
   * @param issue The issue object
   */
  create(issue: InputIssue): ReturnType<typeof createIssue> {
    return createIssue(this.#context, issue);
  }
}
