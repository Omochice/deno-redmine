import type { Context } from "../context.ts";
import { list } from "./list.ts";
import { show } from "./show.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all roles.
   */
  list(): ReturnType<typeof list> {
    return list(this.#context);
  }

  /**
   * Returns the role of given id.
   *
   * @param id Role identifier
   */
  show(id: number): ReturnType<typeof show> {
    return show(this.#context, id);
  }
}
