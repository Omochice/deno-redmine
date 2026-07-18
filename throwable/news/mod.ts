import type { Context } from "../../context.ts";
import { fetchList } from "./list.ts";
import { fetchListByProject } from "./list-by-project.ts";
import { type Include, show } from "./show.ts";
import { create } from "./create.ts";
import { update } from "./update.ts";
import { deleteNews } from "./delete.ts";
import type { CreateNewsQuery, UpdateNewsQuery } from "./type.ts";

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

  /**
   * Return the news of given id
   *
   * @param id News identifier
   * @param includes Associations to include in the response
   */
  show(id: number, includes?: Include[]): ReturnType<typeof show> {
    return show(this.#context, id, includes);
  }

  /**
   * Create a news for the given project
   *
   * @param projectId Project identifier
   * @param news The news attributes
   */
  create(
    projectId: number,
    news: CreateNewsQuery,
  ): ReturnType<typeof create> {
    return create(this.#context, projectId, news);
  }

  /**
   * Update the news of given id
   *
   * @param id News identifier
   * @param news The news attributes to update it
   */
  update(id: number, news: UpdateNewsQuery): ReturnType<typeof update> {
    return update(this.#context, id, news);
  }

  /**
   * Delete the news of given id
   *
   * @param id News identifier
   */
  delete(id: number): ReturnType<typeof deleteNews> {
    return deleteNews(this.#context, id);
  }
}
