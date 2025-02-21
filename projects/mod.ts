import { ResultAsync } from "npm:neverthrow@8.2.0";
import type { Context } from "../context.ts";
import { fetchList } from "./list.ts";
import { show } from "./show.ts";
import type { Project } from "./type.ts";
import { create } from "./create.ts";
import type { ProjectRequest } from "./type.ts";
import { type ProjectUpdateInformation, update } from "./update.ts";
import { deleteProject } from "./delete.ts";
import { archive, unarchive } from "./archive.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all projects
   * This includes all public projects and private projects where user have access to.
   */
  list(): ResultAsync<Project[], Error> {
    return fetchList(this.#context);
  }

  /**
   * Returns the project of given id or identifier.
   *
   * @param id Project identifier
   */
  show(
    id: number,
  ): ResultAsync<Project, Error> {
    return show(id, this.#context);
  }

  /**
   * Creates a the project.
   *
   * @param project The project attributes
   */
  create(
    project: ProjectRequest,
  ): ResultAsync<void, Error> {
    return create(project, this.#context);
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
  ): ResultAsync<void, Error> {
    return update(id, project, this.#context);
  }

  /**
   * Deletes the project of given id or identifier.
   *
   * @param id Project identifier
   */
  delete(id: number): ResultAsync<void, Error> {
    return deleteProject(id, this.#context);
  }

  /**
   * Archives the project of given id or identifier
   *
   * @param id Project identifier
   *
   * @note This feature is available since Redmine 5.0.
   */
  archive(id: number): ResultAsync<void, Error> {
    return archive(id, this.#context);
  }

  /**
   * Unrchives the project of given id or identifier
   *
   * @param id Project identifier
   *
   * @note This feature is available since Redmine 5.0.
   */
  unarchive(id: number): ResultAsync<void, Error> {
    return unarchive(id, this.#context);
  }
}
