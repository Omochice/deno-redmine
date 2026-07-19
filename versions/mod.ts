import type { Context } from "../context.ts";
import { fetchList } from "./list.ts";
import { show } from "./show.ts";
import { create } from "./create.ts";
import type { CreateVersionQuery, UpdateVersionQuery } from "./type.ts";
import { update } from "./update.ts";
import { deleteVersion } from "./delete.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all versions of the project.
   *
   * @param projectId Project identifier
   */
  list(projectId: number): ReturnType<typeof fetchList> {
    return fetchList(this.#context, projectId);
  }

  /**
   * Returns the version of given id.
   *
   * @param id Version identifier
   */
  show(id: number): ReturnType<typeof show> {
    return show(this.#context, id);
  }

  /**
   * Creates a version for the project.
   *
   * @param projectId Project identifier
   * @param version The version attributes
   */
  create(
    projectId: number,
    version: CreateVersionQuery,
  ): ReturnType<typeof create> {
    return create(this.#context, projectId, version);
  }

  /**
   * Updates the version of given id.
   *
   * @param id Version identifier
   * @param version The version attributes to update it
   */
  update(
    id: number,
    version: UpdateVersionQuery,
  ): ReturnType<typeof update> {
    return update(this.#context, id, version);
  }

  /**
   * Deletes the version of given id.
   *
   * @param id Version identifier
   */
  delete(id: number): ReturnType<typeof deleteVersion> {
    return deleteVersion(this.#context, id);
  }
}
