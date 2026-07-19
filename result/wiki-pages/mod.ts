import type { Context } from "../../context.ts";
import type { WikiContent } from "../../throwable/wiki-pages/type.ts";
import type { ShowWikiPageParams } from "../../throwable/wiki-pages/show.ts";
import { fetchList } from "./list.ts";
import { show } from "./show.ts";
import { update } from "./update.ts";
import { create } from "./create.ts";
import { deleteWiki } from "./delete.ts";

export class Client {
  readonly #context: Context;
  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Fetch all wiki pages included in the project
   *
   * @param projectId The project ID
   * @returns Wiki pages
   */
  list(projectId: number): ReturnType<typeof fetchList> {
    return fetchList(this.#context, projectId);
  }

  /**
   * Fetch a wiki page in the project
   *
   * @param params Parameters to identify the wiki page
   * @returns Wiki page
   */
  show(params: ShowWikiPageParams): ReturnType<typeof show> {
    return show(this.#context, params);
  }

  /**
   * Update a wiki page in the project
   *
   * @param projectId The project ID
   * @param wiki wiki content object
   */
  update(projectId: number, wiki: WikiContent): ReturnType<typeof update> {
    return update(this.#context, projectId, wiki);
  }

  /**
   * Create a wiki page in the project
   *
   * @param projectId The project ID
   * @param wiki wiki content object
   */
  create(projectId: number, wiki: WikiContent): ReturnType<typeof create> {
    return create(this.#context, projectId, wiki);
  }

  /**
   * Delete a wiki page in the project
   *
   * @param projectId The project ID
   * @param title Title for wiki page
   */
  delete(projectId: number, title: string): ReturnType<typeof deleteWiki> {
    return deleteWiki(this.#context, projectId, title);
  }
}
