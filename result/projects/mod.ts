import type { Context } from "../../context.ts";
import { fetchList } from "./list.ts";
import { show } from "./show.ts";
import { create } from "./create.ts";
import type { ProjectRequest } from "../../throwable/projects/type.ts";
import { update } from "./update.ts";
import { deleteProject } from "./delete.ts";
import { archive, unarchive } from "./archive.ts";
import { ProjectUpdateInformation } from "../../throwable/projects/update.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all projects
   * This includes all public projects and private projects where user have access to.
   */
  list(): ReturnType<typeof fetchList> {
    return fetchList(this.#context);
  }

  /**
   * Returns the project of given id or identifier.
   *
   * @param id Project identifier
   */
  show(id: number): ReturnType<typeof show> {
    return show(this.#context, id);
  }

  /**
   * Creates a the project.
   *
   * @param project The project attributes
   */
  create(project: ProjectRequest): ReturnType<typeof create> {
    return create(this.#context, project);
  }

  /**
   * Updates the project of given id or identifier.
   *
   * @param id Project identifier
   * @param project The project attributes to update it
   */
  update(
    id: number,
    project: ProjectUpdateInformation,
  ): ReturnType<typeof update> {
    return update(this.#context, id, project);
  }

  /**
   * Deletes the project of given id or identifier.
   *
   * @param id Project identifier
   */
  delete(id: number): ReturnType<typeof deleteProject> {
    return deleteProject(this.#context, id);
  }

  /**
   * Archives the project of given id or identifier
   *
   * @param id Project identifier
   *
   * @note This feature is available since Redmine 5.0.
   */
  archive(id: number): ReturnType<typeof archive> {
    return archive(this.#context, id);
  }

  /**
   * Unrchives the project of given id or identifier
   *
   * @param id Project identifier
   *
   * @note This feature is available since Redmine 5.0.
   */
  unarchive(id: number): ReturnType<typeof unarchive> {
    return unarchive(this.#context, id);
  }
}
