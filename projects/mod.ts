import type { Context } from "../context.ts";
import { list } from "./list.ts";
import { show } from "./show.ts";
import { create } from "./create.ts";
import type { ProjectQuery, ProjectRef } from "./type.ts";
import { type ProjectUpdateInformation, update } from "./update.ts";
import { deleteProject } from "./delete.ts";
import { archive, unarchive } from "./archive.ts";
import { close, reopen } from "./close.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all projects
   * This includes all public projects and private projects where user have access to.
   */
  list(): ReturnType<typeof list> {
    return list(this.#context);
  }

  /**
   * Returns the project of given id or identifier.
   *
   * @param id Project id or identifier
   */
  show(id: ProjectRef): ReturnType<typeof show> {
    return show(this.#context, id);
  }

  /**
   * Creates a the project.
   *
   * @param project The project attributes
   */
  create(project: ProjectQuery): ReturnType<typeof create> {
    return create(this.#context, project);
  }

  /**
   * Updates the project of given id or identifier.
   *
   * @param id Project id or identifier
   * @param project The project attributes to update it
   */
  update(
    id: ProjectRef,
    project: ProjectUpdateInformation,
  ): ReturnType<typeof update> {
    return update(this.#context, id, project);
  }

  /**
   * Deletes the project of given id or identifier.
   *
   * @param id Project id or identifier
   */
  delete(id: ProjectRef): ReturnType<typeof deleteProject> {
    return deleteProject(this.#context, id);
  }

  /**
   * Archives the project of given id or identifier
   *
   * @param id Project id or identifier
   *
   * @note This feature is available since Redmine 5.0.
   */
  archive(id: ProjectRef): ReturnType<typeof archive> {
    return archive(this.#context, id);
  }

  /**
   * Unrchives the project of given id or identifier
   *
   * @param id Project id or identifier
   *
   * @note This feature is available since Redmine 5.0.
   */
  unarchive(id: ProjectRef): ReturnType<typeof unarchive> {
    return unarchive(this.#context, id);
  }

  /**
   * Closes the project of given id or identifier.
   *
   * @param id Project id or identifier
   */
  close(id: ProjectRef): ReturnType<typeof close> {
    return close(this.#context, id);
  }

  /**
   * Reopens the project of given id or identifier.
   *
   * @param id Project id or identifier
   */
  reopen(id: ProjectRef): ReturnType<typeof reopen> {
    return reopen(this.#context, id);
  }
}
