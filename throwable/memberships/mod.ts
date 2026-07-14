import type { Context } from "../../context.ts";
import { fetchList } from "./list.ts";
import { show } from "./show.ts";
import { create } from "./create.ts";
import type { CreateMembershipQuery, UpdateMembershipQuery } from "./type.ts";
import { update } from "./update.ts";
import { deleteMembership } from "./delete.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all memberships of the project.
   *
   * @param projectId Project identifier
   */
  list(projectId: number): ReturnType<typeof fetchList> {
    return fetchList(this.#context, projectId);
  }

  /**
   * Returns the membership of given id.
   *
   * @param id Membership identifier
   */
  show(id: number): ReturnType<typeof show> {
    return show(this.#context, id);
  }

  /**
   * Creates a membership for the project.
   *
   * @param projectId Project identifier
   * @param membership The membership attributes
   */
  create(
    projectId: number,
    membership: CreateMembershipQuery,
  ): ReturnType<typeof create> {
    return create(this.#context, projectId, membership);
  }

  /**
   * Updates the membership of given id.
   *
   * @param id Membership identifier
   * @param membership The membership attributes to update it
   */
  update(
    id: number,
    membership: UpdateMembershipQuery,
  ): ReturnType<typeof update> {
    return update(this.#context, id, membership);
  }

  /**
   * Deletes the membership of given id.
   *
   * @param id Membership identifier
   */
  delete(id: number): ReturnType<typeof deleteMembership> {
    return deleteMembership(this.#context, id);
  }
}
