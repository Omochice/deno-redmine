import type { Context } from "../../context.ts";
import { fetchList } from "./list.ts";
import { show } from "./show.ts";
import { create } from "./create.ts";
import type {
  CreateGroupQuery,
  UpdateGroupQuery,
} from "../../throwable/groups/type.ts";
import { update } from "./update.ts";
import { deleteGroup } from "./delete.ts";
import { addUser } from "./add-user.ts";
import { removeUser } from "./remove-user.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all groups.
   */
  list(): ReturnType<typeof fetchList> {
    return fetchList(this.#context);
  }

  /**
   * Returns the group of given id.
   *
   * @param id Group identifier
   */
  show(id: number): ReturnType<typeof show> {
    return show(this.#context, id);
  }

  /**
   * Creates a group.
   *
   * @param group The group attributes
   */
  create(group: CreateGroupQuery): ReturnType<typeof create> {
    return create(this.#context, group);
  }

  /**
   * Updates the group of given id.
   *
   * @param id Group identifier
   * @param group The group attributes to update it
   */
  update(
    id: number,
    group: UpdateGroupQuery,
  ): ReturnType<typeof update> {
    return update(this.#context, id, group);
  }

  /**
   * Deletes the group of given id.
   *
   * @param id Group identifier
   */
  delete(id: number): ReturnType<typeof deleteGroup> {
    return deleteGroup(this.#context, id);
  }

  /**
   * Adds a user to the group of given id.
   *
   * @param groupId Group identifier
   * @param userId User identifier to add to the group
   */
  addUser(groupId: number, userId: number): ReturnType<typeof addUser> {
    return addUser(this.#context, groupId, userId);
  }

  /**
   * Removes a user from the group of given id.
   *
   * @param groupId Group identifier
   * @param userId User identifier to remove from the group
   */
  removeUser(groupId: number, userId: number): ReturnType<typeof removeUser> {
    return removeUser(this.#context, groupId, userId);
  }
}
