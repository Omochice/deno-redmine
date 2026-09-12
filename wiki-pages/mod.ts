import type { ProjectRef } from "../projects/type.ts";
import type { Context } from "../context.ts";
import type { WikiContent } from "./type.ts";
import { list } from "./list.ts";
import { show, type ShowWikiPageParams } from "./show.ts";
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
   * @param projectId Project id or identifier
   * @returns Wiki pages
   */
  list(projectId: ProjectRef): ReturnType<typeof list> {
    return list(this.#context, projectId);
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
   * @param projectId Project id or identifier
   * @param wiki wiki content object
   */
  update(projectId: ProjectRef, wiki: WikiContent): ReturnType<typeof update> {
    return update(this.#context, projectId, wiki);
  }

  /**
   * Create a wiki page in the project
   *
   * @param projectId Project id or identifier
   * @param wiki wiki content object
   */
  create(projectId: ProjectRef, wiki: WikiContent): ReturnType<typeof update> {
    return create(this.#context, projectId, wiki);
  }

  /**
   * Delete a wiki page in the project
   *
   * @param projectId Project id or identifier
   * @param title Title for wiki page
   */
  delete(projectId: ProjectRef, title: string): ReturnType<typeof deleteWiki> {
    return deleteWiki(this.#context, projectId, title);
  }
}
