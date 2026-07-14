import type { Context } from "../../context.ts";
import { fetchList } from "./list.ts";
import { fetchListByProject } from "./list-by-project.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Return the list of news across all projects
   */
  list(): ReturnType<typeof fetchList> {
    return fetchList(this.#context);
  }

  /**
   * Return the list of news of the given project
   *
   * @param projectId Project identifier
   */
  listByProject(projectId: number): ReturnType<typeof fetchListByProject> {
    return fetchListByProject(this.#context, projectId);
  }
}
