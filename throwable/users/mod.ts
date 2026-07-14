import type { Context } from "../../context.ts";
import { fetchList } from "./list.ts";
import { show } from "./show.ts";
import { create } from "./create.ts";
import type { CreateUserQuery, UpdateUserQuery } from "./type.ts";
import { update } from "./update.ts";
import { deleteUser } from "./delete.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all users.
   */
  list(): ReturnType<typeof fetchList> {
    return fetchList(this.#context);
  }

  /**
   * Returns the user of given id.
   *
   * @param id User identifier
   */
  show(id: number): ReturnType<typeof show> {
    return show(this.#context, id);
  }

  /**
   * Creates a user.
   *
   * @param user The user attributes
   */
  create(user: CreateUserQuery): ReturnType<typeof create> {
    return create(this.#context, user);
  }

  /**
   * Updates the user of given id.
   *
   * @param id User identifier
   * @param user The user attributes to update it
   */
  update(
    id: number,
    user: UpdateUserQuery,
  ): ReturnType<typeof update> {
    return update(this.#context, id, user);
  }

  /**
   * Deletes the user of given id.
   *
   * @param id User identifier
   */
  delete(id: number): ReturnType<typeof deleteUser> {
    return deleteUser(this.#context, id);
  }
}
