import type { Context } from "../../context.ts";
import { update } from "./update.ts";
import type { UpdateJournalQuery } from "./type.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Updates the note of the journal of given id.
   *
   * @param id Journal identifier
   * @param journal The journal attributes to update it
   */
  update(id: number, journal: UpdateJournalQuery): ReturnType<typeof update> {
    return update(this.#context, id, journal);
  }
}
