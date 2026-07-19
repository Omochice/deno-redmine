import type { Context } from "../context.ts";
import { fetchList } from "./list.ts";
import { show } from "./show.ts";
import { create } from "./create.ts";
import type {
  CreateTimeEntryQuery,
  ListTimeEntryQuery,
  UpdateTimeEntryQuery,
} from "./type.ts";
import { update } from "./update.ts";
import { deleteTimeEntry } from "./delete.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns time entries, optionally filtered by project, user, or spent-on date range.
   *
   * @param filter Optional filters (projectId, spentOn, userId, from, to)
   */
  list(filter?: Partial<ListTimeEntryQuery>): ReturnType<typeof fetchList> {
    return fetchList(this.#context, filter);
  }

  /**
   * Returns the time entry of given id.
   *
   * @param id Time entry identifier
   */
  show(id: number): ReturnType<typeof show> {
    return show(this.#context, id);
  }

  /**
   * Creates a time entry.
   *
   * @param timeEntry The time entry attributes
   */
  create(
    timeEntry: CreateTimeEntryQuery,
  ): ReturnType<typeof create> {
    return create(this.#context, timeEntry);
  }

  /**
   * Updates the time entry of given id.
   *
   * @param id Time entry identifier
   * @param timeEntry The time entry attributes to update it
   */
  update(
    id: number,
    timeEntry: UpdateTimeEntryQuery,
  ): ReturnType<typeof update> {
    return update(this.#context, id, timeEntry);
  }

  /**
   * Deletes the time entry of given id.
   *
   * @param id Time entry identifier
   */
  delete(id: number): ReturnType<typeof deleteTimeEntry> {
    return deleteTimeEntry(this.#context, id);
  }
}
